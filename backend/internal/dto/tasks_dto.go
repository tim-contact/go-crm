package dto

import "time"

type CreateTask struct {
	Title      string    `json:"title" binding:"required,min=2"`
	DueDate    *time.Time `json:"due_date,omitempty"`
	Status     string     `json:"status" binding:"required,oneof=open in_progress done cancelled"`
	AssignedTo *string   `json:"assigned_to,omitempty"`
}

type TaskResponse struct {
	ID         string     `json:"id"`
	LeadID     string     `json:"lead_id"`
	Title      string     `json:"title"`
	DueDate    *time.Time `json:"due_date,omitempty"`
	Status     string     `json:"status"`
	AssignedTo *string    `json:"assigned_to,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

type TaskListResponse struct {
	Tasks        []TaskResponse `json:"tasks"`
	TotalCount   int            `json:"total_count"`
}

type UpdateTask struct {
	Title      *string    `json:"title,omitempty"`
	DueDate    *time.Time `json:"due_date,omitempty"`
	Status     *string    `json:"status,omitempty" binding:"omitempty,oneof=open in_progress done cancelled"`
	AssignedTo *string    `json:"assigned_to,omitempty"`
}

