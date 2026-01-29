package dto

import "time"

type CreateTask struct {
	Title      string     `json:"title" binding:"required,min=2"`
	DueDate    *time.Time `json:"due_date,omitempty"`
	Kind       string     `json:"kind" binding:"required,oneof=call follow_up_call email meeting whatsapp note"`
	Status     string     `json:"status" binding:"required,oneof=open in_progress done cancelled"`
	AssignedTo *string    `json:"assigned_to,omitempty"`
}

type TaskResponse struct {
	ID         string     `json:"id"`
	LeadID     string     `json:"lead_id"`
	Title      string     `json:"title"`
	DueDate    *time.Time `json:"due_date,omitempty"`
	Kind       string     `json:"kind"`
	Status     string     `json:"status"`
	AssignedTo *string    `json:"assigned_to,omitempty"`
	AssignedToName *string `json:"assigned_to_name,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

type TaskListResponse struct {
	Tasks        []TaskResponse `json:"tasks"`
	TotalCount   int            `json:"total_count"`
	Limit        int            `json:"limit"`
	Offset       int            `json:"offset"`
}

type UpdateTask struct {
	Title      *string    `json:"title,omitempty"`
	DueDate    *time.Time `json:"due_date,omitempty"`
	Kind       *string    `json:"kind,omitempty" binding:"omitempty,oneof=call follow_up_call email meeting whatsapp note"`
	Status     *string    `json:"status,omitempty" binding:"omitempty,oneof=open in_progress done cancelled"`
	AssignedTo *string    `json:"assigned_to,omitempty"`
}

// Add these new types
type FollowUpCallTask struct {
	LeadID         string     `json:"lead_id"`
	LeadName       string     `json:"lead_name"`
	LeadStatus     *string    `json:"lead_status,omitempty"`
	LastFollowUpAt *time.Time `json:"last_follow_up_at,omitempty"`
	DueAt          time.Time  `json:"due_at"`
	AllocatedTo    *string    `json:"allocated_to,omitempty"`
}

// Replace TaskListResponse or create a new response type for /tasks/today
type TodayTasksResponse struct {
	Tasks              []TaskResponse      `json:"tasks"`
	FollowUpCallTasks  []FollowUpCallTask  `json:"follow_up_call_tasks"`
	TotalTasks         int                 `json:"total_tasks"`
	TotalFollowUpCalls int                 `json:"total_follow_up_calls"`
	Limit              int                 `json:"limit"`
	Offset             int                 `json:"offset"`
}
