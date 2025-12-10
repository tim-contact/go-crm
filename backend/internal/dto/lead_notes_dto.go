package dto 

import "time"


type CreateLeadNote struct {
	LeadID	string     `json:"lead_id" binding:"required,uuid"`
	Body    string     `json:"body" binding:"required,min=2"`
}

type LeadNoteResponse struct {
	ID          string     `json:"id"`
	LeadID      string     `json:"lead_id"`
	Body        string     `json:"body"`
	CreatedBy   string     `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
}

type UpdateLeadNote struct {
	Body    string     `json:"body" binding:"required,min=2"`
}

type LeadNoteListResponse struct {
	Notes      []LeadNoteResponse `json:"notes"`
	TotalCount int                `json:"total_count"`
	page	   int                `json:"page"`	
	Limit	   int                `json:"limit"`
}