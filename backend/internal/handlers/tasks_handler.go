package handlers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

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

	var tasks []models.Task

	if err := h.db.Where("lead_id = ?", leadID).Order("created_at DESC").Find(&tasks).Error; err != nil {
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
			Status:     string(task.Status),
			AssignedTo: task.AssignedTo,
			CreatedAt:  task.CreatedAt,
		}
	}

	out := dto.TaskListResponse{
		Tasks: response,
		TotalCount: len(response),
	}

	c.JSON(http.StatusOK, out)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	taskID := c.Param("task_id")

	var req dto.UpdateTask

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var task models.Task

	if err := h.db.First(&task, "id = ?", taskID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if req.Title != nil {
		task.Title = *req.Title
	}
	if req.DueDate != nil {
		task.DueDate = req.DueDate
	}
	if req.Status != nil {
		task.Status = models.TaskStatus(*req.Status)
	}
	if req.AssignedTo != nil {
		task.AssignedTo = req.AssignedTo
	}

	if err := h.db.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	out := dto.TaskResponse{
		ID:         task.ID,
		LeadID:     task.LeadID,
		Title:      task.Title,
		DueDate:    task.DueDate,
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