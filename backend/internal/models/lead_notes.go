package models

import "time"

type LeadNote struct {
	ID        string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	LeadID    string     `gorm:"type:uuid;not null;index" json:"lead_id"`
	Body      string     `gorm:"column:body" json:"body"`
	CreatedBy string     `gorm:"column:created_by" json:"created_by"`
	CreatedAt time.Time  `gorm:column:created_at" json:"created_at"`
}

func (LeadNote) TableName() string {
	return "lead_notes"
}