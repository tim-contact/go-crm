package handlers

import (
	"net/http"
	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/tim-contact/go-crm/internal/dto"
	"github.com/tim-contact/go-crm/internal/models"
)

type ActivityHandler struct {
	db *gorm.DB
}

func NewActivityHandler(db *gorm.DB) *ActivityHandler {
	return &ActivityHandler{db: db}
}

func (h *ActivityHandler) CreateActivity(c *gin.Context) {
	userID, _ := c.Get("uid")
	leadID := c.Param("id")

	uid := userID.(string)

	var req dto.CreateActivity 

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Error binding JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	activity := models.Activity {
		LeadID:   leadID,
		StaffID:  &uid,
		Kind:     models.ActivityKind(req.Kind),
		Summary:  req.Summary,
	}

	if err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&activity).Error; err != nil {
			return err
		}
		if activity.Kind != models.ActivityNote {
			if err := tx.Model(&models.Lead{}).
				Where("id = ? AND status = ?", leadID, "New").
				Update("status", "In Progress").Error; err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, activity)
}

func (h *ActivityHandler) GetActivities(c *gin.Context) {
	leadID := c.Param("id")

	var activities []models.Activity

	if err := h.db.Where ("lead_id = ?", leadID).Order("occurred_at DESC").Find(&activities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response = make([]dto.ActivityResponse, len(activities))

	for i, activity := range activities {
		response[i] = dto.ActivityResponse{
			ID:      activity.ID,
			LeadID:  activity.LeadID,
			StaffID: activity.StaffID,
			Kind:    string(activity.Kind),
			Summary: activity.Summary,
			OccurredAt: activity.OccurredAt,
		}
	}

	out := dto.ActivityListResponse{
		Activities: response,
		TotalCount: len(response),
	}

	c.JSON(http.StatusOK, out)
}

func (h *ActivityHandler) UpdateActivity(c *gin.Context) {
	activityID := c.Param("activity_id")
	userID, _ := c.Get("uid")

	var req dto.UpdateActivity
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
	}

	var activity models.Activity

	if err := h.db.Where("id = ? AND staff_id = ?", activityID, userID).First(&activity).Error;
	err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "activity not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database Error"})
		}
		return
	}

	activity.Summary = req.Summary
	if err := h.db.Save(&activity).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error" : "Failed to update activity"})
		return
	}
	
	out := dto.ActivityResponse{
		ID: activity.ID,
		LeadID: activity.LeadID,
		StaffID: activity.StaffID,
		Kind:    string(activity.Kind),
		Summary: activity.Summary,
		OccurredAt: activity.OccurredAt,
	}

	c.JSON(http.StatusOK, out)

}

func (h *ActivityHandler) DeleteActivity (c *gin.Context) {
	activityID := c.Param("activity_id")
	userID, _ := c.Get("uid")

	result := h.db.Delete(&models.Activity{}, "id = ? AND staff_id = ?", activityID, userID)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete activitiy"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Activity not found"})
		return
	}

	c.Status(http.StatusOK)
}
