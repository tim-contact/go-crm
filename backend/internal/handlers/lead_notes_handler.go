package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/tim-contact/go-crm/internal/dto"
	"github.com/tim-contact/go-crm/internal/models"
)

type LeadNoteHandler struct {
	db *gorm.DB }

func NewLeadNoteHandler(db *gorm.DB) *LeadNoteHandler {
	return &LeadNoteHandler{db: db}
}

func (h *LeadNoteHandler) CreateLeadNote(c *gin.Context) {
	userID, _ := c.Get("uid")
	

	var req dto.CreateLeadNote

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note := models.LeadNote{
		LeadID:    req.LeadID,
		Body:      req.Body,
		CreatedBy: userID.(string),
	}

	if err := h.db.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, note)
}

func (h *LeadNoteHandler) GetLeadNotes(c *gin.Context) {
	leadID := c.Param("id")

	var notes []models.LeadNote

	if err := h.db.Where ("lead_id = ?", leadID).Order("created_at DESC").Find(&notes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response = make([]dto.LeadNoteResponse, len(notes)) 

	for i, note := range notes {
		response[i] = dto.LeadNoteResponse{
			ID: 	  note.ID,
			LeadID:   note.LeadID,
			Body:     note.Body,
			CreatedBy: note.CreatedBy,
			CreatedAt: note.CreatedAt,
		}
	}
	
	c.JSON(http.StatusOK, gin.H{"notes": response, "total_count": len(response)})

}

func (h *LeadNoteHandler) UpdateLeadNote(c *gin.Context) {
	noteID := c.Param("note_id")
	userID, _ := c.Get("uid")

	var req dto.UpdateLeadNote 
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
	}

	var note models.LeadNote
	if err := h.db.Where("id = ? AND created_by = ?", noteID, userID).First(&note).Error; 
	err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "note not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database Error"})
		}
		return
	}

	note.Body = req.Body
	if err := h.db.Save(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error" : "Falied  to update note"})
		return
	}

	response := dto.LeadNoteResponse{
		ID: note.ID,
		LeadID: note.LeadID,
		Body: note.Body,
		CreatedBy: note.CreatedBy,
		CreatedAt: note.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

func (h *LeadNoteHandler) DeleteLeadNote (c *gin.Context) {
	noteID := c.Param("note_id")
	userID, _ := c.Get("uid")

	result := h.db.Delete(&models.LeadNote{}, "id = ? and created_by = ?", noteID, userID)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete node"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
	}

	c.Status(http.StatusOK)
}