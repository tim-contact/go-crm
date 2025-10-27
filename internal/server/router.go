package server

import (
	"net/http" 
	"time"


	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"github.com/tim-contact/go-crm/internal/models"
)

func Router(r *gin.Engine, db *gorm.DB) *gin.Engine {
	r.GET("/healthz", func(c *gin.Context) { c.String(http.StatusOK, "ok") })

	authg := r.Group("/auth")
	{
	authg.POST("/login", login(db))
	authg.POST("/register", register(db))
	}



	lead := r.Group("/leads", Authn())
	{
		lead.POST("", createLead(db))
		lead.GET("", listLeads(db))
		lead.GET(":id", getLead(db))
		lead.PUT(":id", updateLead(db))
		lead.DELETE(":id", deleteLead(db))
	}
	return r
}

// Handlers

type leadCreateReq struct {
	InqID              *string    `json:"inq_id"`
	FullName           string     `json:"full_name" binding:"required,min=2"`
	DestinationCountry *string    `json:"destination_country" binding:"required, min=2"`
	Status             *string    `json:"status"`
	WhatsAppNo         *string    `json:"whatsapp_no"required, binding:"len=10, numeric"`
	InquiryDate        *time.Time `json:"inquiry_date"`
	AllocatedUserID    *string    `json:"allocated_user_id"`
}

func createLead(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req leadCreateReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
		}
		m := models.Lead{
			InqID:              req.InqID,
			FullName:           req.FullName,
			DestinationCountry: req.DestinationCountry,
			Status:             req.Status,
			WhatsAppNo:         req.WhatsAppNo,
			InquiryDate:        req.InquiryDate,
			AllocatedUserID:    req.AllocatedUserID,
		}
		if err := db.Create(&m).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
		}
		c.JSON(http.StatusCreated, m)
	}
}

type leadFilters struct {
	Country     string `form:"country"`
	Status      string `form:"status"`
	AllocatedTo string `form:"allocated_to"`
	Q           string `form:"q"`
	From        string `form:"from"` // YYYY-MM-DD
	To          string `form:"to"`
	Limit       int    `form:"limit,default=50"`
	Offset      int    `form:"offset,default=0"`
}

func listLeads(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var f leadFilters
		if err := c.ShouldBindQuery(&f); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid filters"}); return
		}
		q := db.Model(&models.Lead{})
		if f.Country != "" {
			q = q.Where("destination_country ILIKE ?", "%"+f.Country+"%")
		}
		if f.Status != "" { q = q.Where("status = ?", f.Status) }
		if f.AllocatedTo != "" { q = q.Where("allocated_user_id = ?", f.AllocatedTo) }
		if f.Q != "" {
			like := "%" + f.Q + "%"
			q = q.Where("(full_name ILIKE ? OR whatsapp_no ILIKE ? OR inq_id ILIKE ?)", like, like, like)
		}
		if f.From != "" { q = q.Where("inquiry_date >= ?", f.From) }
		if f.To != "" { q = q.Where("inquiry_date <= ?", f.To) }

		if f.Limit <= 0 || f.Limit > 200 { f.Limit = 50 }
		if f.Offset < 0 { f.Offset = 0 }

		var items []models.Lead
		if err := q.Order("created_at DESC").Limit(f.Limit).Offset(f.Offset).Find(&items).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
		}
		c.JSON(http.StatusOK, items)
	}
}

func getLead(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var m models.Lead
		if err := db.First(&m, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return
		}
		c.JSON(http.StatusOK, m)
	}
}

type leadUpdateReq struct {
	InqID              *string    `json:"inq_id"`
	FullName           *string    `json:"full_name"`
	DestinationCountry *string    `json:"destination_country"`
	Status             *string    `json:"status"`
	WhatsAppNo         *string    `json:"whatsapp_no"`
	InquiryDate        *time.Time `json:"inquiry_date"`
	AllocatedUserID    *string    `json:"allocated_user_id"`
}

func updateLead(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var req leadUpdateReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
		}
		var m models.Lead
		if err := db.First(&m, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return
		}
		updates := map[string]any{}
		if req.InqID != nil { updates["inq_id"] = req.InqID }
		if req.FullName != nil { updates["full_name"] = *req.FullName }
		if req.DestinationCountry != nil { updates["destination_country"] = req.DestinationCountry }
		if req.Status != nil { updates["status"] = req.Status }
		if req.WhatsAppNo != nil { updates["whatsapp_no"] = req.WhatsAppNo }
		if req.InquiryDate != nil { updates["inquiry_date"] = req.InquiryDate }
		if req.AllocatedUserID != nil { updates["allocated_user_id"] = req.AllocatedUserID }

		if err := db.Model(&m).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
		}
		c.JSON(http.StatusOK, m)
	}
}

func deleteLead(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if err := db.Delete(&models.Lead{}, "id = ?", id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
		}
		c.Status(http.StatusNoContent)
	}
}
