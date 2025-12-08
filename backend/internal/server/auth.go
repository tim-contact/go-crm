package server

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"

	"github.com/tim-contact/go-crm/internal/models"
	"github.com/tim-contact/go-crm/internal/auth"
	gonanoid "github.com/matoous/go-nanoid/v2"
)

type loginReq struct {
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func login(db *gorm.DB) gin.HandlerFunc {
	return func (c *gin.Context) {
		var req loginReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()});
			return
		}

		var u models.User
		if err := db.Where("email = ? and active = true", req.Email).First(&u).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"});
			return
		}

		if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)) != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"});
			return
		}

		token, err := auth.NewAccessToken(u.ID, u.Role, 15*time.Minute)
		if err != nil {
			c.JSON(500, gin.H{"error": "failed to generate token"});
			return
		}
		c.JSON(http.StatusOK, gin.H{"access_token": token, "user": gin.H{
			"id": u.ID, "name": u.Name, "email": u.Email, "role": u.Role,
		},})
	}
}

type registerReq struct {
	Name 	string 	`json:"name" binding:"required,min=2"`
	Email 	string  `json:"email" binding:"required,email"`
	Phone   string  `json:"phone"`
	Role    string  `json:"role" binding:"required,oneof=admin coordinator agent viewer"`
	Password string `json:"password" binding:"required,min=8"`
}

func register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req registerReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return
		}

		id, err := gonanoid.New(10)
		if err != nil {
			c.JSON(500, gin.H{"error": "failed to generate user ID"}); return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

		if err != nil {	
			c.JSON(500, gin.H{"error": "failed to hash password"}); return
		}	
		u := models.User{
			ID:    id,
			Name: req.Name,
			Email: req.Email,
			Role: req.Role,
			PasswordHash: string(hash),
			Active: true,
		}
		if req.Phone != "" {
			u.Phone = &req.Phone
		}
		if err := db.Create(&u).Error; err != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"}); return
		}

		c.JSON(http.StatusCreated, gin.H{"id": u.ID})
	}
}