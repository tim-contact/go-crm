package dto

import "time"

type CreateActivity struct {
	Kind    string   `json:"kind" binding:"required,min=2"`
	Summary *string  `json:"summary,omitempty"`
}

type ActivityResponse struct {
	ID       string     `json:"id"`
	LeadID   string     `json:"lead_id"`
	StaffID  *string   `json:"staff_id,omitempty"`
	Kind     string     `json:"kind"`
	Summary  *string   `json:"summary,omitempty"`
	OccurredAt time.Time  `json:"occurred_at"`
}

type ActivityListResponse struct {
	Activities []ActivityResponse `json:"activities"`
	TotalCount int                `json:"total_count"`
}

type UpdateActivity struct {
	Summary *string  `json:"summary,omitempty"`
}











/*
type Activity struct {
	ID        string          `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	LeadID    string          `gorm:"type:uuid;not null;index" json:"lead_id"`
	StaffID   *string         `gorm:"column:staff_id" json:"staff_id,omitempty"`
	Kind      ActivityKind    `gorm:"column:kind;type:text;not null" json:"kind"`     
	Summary   *string         `gorm:"column:summary" json:"summary,omitempty"`
	OccurredAt time.Time      `gorm:"column:occurred_at;not null;default:now()" json:"occurred_at"`
}

*/