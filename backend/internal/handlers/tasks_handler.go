package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"time"

	"github.com/tim-contact/go-crm/internal/dto"
	"fmt"
	"net/http"
	"github.com/tim-contact/go-crm/internal/models"
)


type TaskHandler struct {
	db *gorm.DB
}

func NewTaskHandler(db *gorm.DB) *TaskHandler {
	return &TaskHandler{db: db}
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	leadID := c.Param("id")

	var req dto.CreateTask
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	task := models.Task{
		LeadID:   leadID,
		Title:    req.Title,
		DueDate:  req.DueDate,
		Kind:     models.ActivityKind(req.Kind),
		Status:   models.TaskStatus(req.Status),
		AssignedTo: req.AssignedTo,
	}

	if err := h.db.Create(&task).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, task)


}

func (h *TaskHandler) GetTasks(c *gin.Context) {
	leadID := c.Param("id")

	var tasks []taskWithAssignedName

	if err := h.db.
		Table("tasks t").
		Select("t.*, u.name AS assigned_to_name").
		Joins("LEFT JOIN users u ON u.id = t.assigned_to").
		Where("t.lead_id = ?", leadID).
		Order("t.created_at DESC").
		Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response = make([]dto.TaskResponse, len(tasks))

	for i, task := range tasks {
		response[i] = dto.TaskResponse{
			ID:         task.ID,
			LeadID:     task.LeadID,
			Title:      task.Title,
			DueDate:    task.DueDate,
			Kind:       string(task.Kind),
			Status:     string(task.Status),
			AssignedTo: task.AssignedTo,
			AssignedToName: task.AssignedToName,
			CreatedAt:  task.CreatedAt,
		}
	}

	out := dto.TaskListResponse{
		Tasks: response,
		TotalCount: len(response),
	}

	c.JSON(http.StatusOK, out)
}

type followUpCallRow struct {
	LeadID         string     `json:"lead_id"`
	LeadName       string     `json:"lead_name"`
	LeadStatus     *string    `json:"lead_status"`
	LastFollowUpAt *time.Time `json:"last_follow_up_at"`
	DueAt          time.Time  `json:"due_at"`
	AllocatedTo    *string    `json:"allocated_to"`
}

type taskWithAssignedName struct {
	models.Task
	AssignedToName *string `gorm:"column:assigned_to_name" json:"assigned_to_name,omitempty"`
}

func (h *TaskHandler) GetTodayTasks(c *gin.Context) {
	userID, _ := c.Get("uid")
	uid, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	role, _ := c.Get("role")

	assignedTo := uid
	if override := c.Query("assigned_to"); override != "" {
		if roleStr, ok := role.(string); !ok || (roleStr != "admin" && roleStr != "coordinator") {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		assignedTo = override
	}

	limit := 50
	offset := 0
	if v := c.Query("limit"); v != "" {
		fmt.Sscanf(v, "%d", &limit)
	}
	if v := c.Query("offset"); v != "" {
		fmt.Sscanf(v, "%d", &offset)
	}
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	var tasks []taskWithAssignedName
	base := h.db.
		Table("tasks t").
		Select("t.*, u.name AS assigned_to_name").
		Joins("LEFT JOIN users u ON u.id = t.assigned_to").
		Where("t.assigned_to = ? AND t.status IN ?", assignedTo, []models.TaskStatus{models.TaskStatusOpen, models.TaskStatusInProgress})

	var total int64
	if err := base.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := base.
		Order("due_date ASC NULLS LAST, created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response = make([]dto.TaskResponse, len(tasks))
	for i, task := range tasks {
		response[i] = dto.TaskResponse{
			ID:         task.ID,
			LeadID:     task.LeadID,
			Title:      task.Title,
			DueDate:    task.DueDate,
			Kind:       string(task.Kind),
			Status:     string(task.Status),
			AssignedTo: task.AssignedTo,
			AssignedToName: task.AssignedToName,
			CreatedAt:  task.CreatedAt,
		}
	}

	closedStatuses := []string{"done", "cancelled", "Closed"}

	var followUpRows []followUpCallRow

	followUpSQL := 
				`
			WITH last_fu AS (
				SELECT lead_id, MAX(occurred_at) AS last_fu_at
				FROM activities
				WHERE kind = 'follow_up_call'
				GROUP BY lead_id
			)
			SELECT
				l.id AS lead_id,
				l.full_name AS lead_name,
				l.status AS lead_status,
				lf.last_fu_at AS last_follow_up_at,
				(COALESCE(lf.last_fu_at, l.inquiry_date::timestamptz, l.created_at) + INTERVAL '3 days') AS due_at,
				l.allocated_user_id AS allocated_to
			FROM leads l
			LEFT JOIN last_fu lf ON lf.lead_id = l.id
			WHERE l.allocated_user_id = ?
			AND (l.status IS NULL OR l.status NOT IN ?)
			AND (COALESCE(lf.last_fu_at, l.inquiry_date::timestamptz, l.created_at) + INTERVAL '3 days')::date <= CURRENT_DATE
			ORDER BY due_at ASC
			`

	if err := h.db.Raw(followUpSQL, assignedTo, closedStatuses).Scan(&followUpRows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	followUpTasks := make([]dto.FollowUpCallTask, len(followUpRows)) 

	for i, row := range followUpRows {
		followUpTasks[i] = dto.FollowUpCallTask{
			LeadID:         row.LeadID,
			LeadName:       row.LeadName,
			LeadStatus:     row.LeadStatus,
			LastFollowUpAt: row.LastFollowUpAt,
			DueAt:          row.DueAt,
			AllocatedTo:    row.AllocatedTo,
		}
	}
		

	out := dto.TodayTasksResponse{
		Tasks:      response,
		FollowUpCallTasks: followUpTasks,
		TotalTasks: int(total),
		TotalFollowUpCalls: len(followUpTasks),
		Limit:      limit,
		Offset:     offset,
	}

	c.JSON(http.StatusOK, out)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	taskID := c.Param("task_id")
	userID, _ := c.Get("uid")
	uid, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req dto.UpdateTask

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("UpdateTask: req.Status is nil? %v, value: %v\n", req.Status == nil, req.Status)


	var task models.Task

	if err := h.db.First(&task, "id = ?", taskID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	prevStatus := task.Status

	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.DueDate != nil {
		task.DueDate = req.DueDate
	}
	if req.Status != nil {
		task.Status = models.TaskStatus(*req.Status)
	}
	if req.Kind != nil {
		task.Kind = models.ActivityKind(*req.Kind)
	}
	if req.AssignedTo != nil {
		task.AssignedTo = req.AssignedTo
	}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		fmt.Printf("UpdateTask: saving task %s (prev=%s, next=%s, kind=%s)\n", task.ID, prevStatus, task.Status, task.Kind)
		if err := tx.Save(&task).Error; err != nil {
			fmt.Printf("UpdateTask: failed to save task %s: %v\n", task.ID, err)
			return err
		}
		if prevStatus != models.TaskStatusDone && task.Status == models.TaskStatusDone {
			fmt.Printf("UpdateTask: task %s transitioned to done, creating activity\n", task.ID)
			summary := fmt.Sprintf("Task completed: %s", task.Title)
			activity := models.Activity{
				LeadID:  task.LeadID,
				StaffID: &uid,
				Kind:    task.Kind,
				Summary: &summary,
			}
			if err := tx.Create(&activity).Error; err != nil {
				fmt.Printf("UpdateTask: failed to create activity for task %s: %v\n", task.ID, err)
				return err
			}
		} else {
			fmt.Printf("UpdateTask: no activity created (prev=%s, next=%s)\n", prevStatus, task.Status)
		}
		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	out := dto.TaskResponse{
		ID:         task.ID,
		LeadID:     task.LeadID,
		Title:      task.Title,
		DueDate:    task.DueDate,
		Kind:       string(task.Kind),
		Status:     string(task.Status),
		AssignedTo: task.AssignedTo,
		CreatedAt:  task.CreatedAt,
	}

	c.JSON(http.StatusOK, out)


}


func (h *TaskHandler) DeleteTask(c *gin.Context) {
	taskID := c.Param("task_id")

	result := h.db.Delete(&models.Task{}, "id = ?", taskID)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}
	
	c.Status(http.StatusOK)	
	
}
