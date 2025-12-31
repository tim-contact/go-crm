package models

import "time"

type TaskStatus string;

const (
	TaskStatusOpen      TaskStatus = "open"
	TaskStatusInProgress TaskStatus = "in_progress"
	TaskStatusDone      TaskStatus = "done"
	TaskStatusCancelled TaskStatus = "cancelled"
)

type Task struct {
	ID            string      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	LeadID        string      `gorm:"type:uuid;not null;index" json:"lead_id"`
	Title         string      `gorm:"column:title;type:text;not null" json:"title"`
	DueDate       *time.Time  `gorm:"column:due_date" json:"due_date,omitempty"`
	Status        TaskStatus  `gorm:"column:status;type:text;not null;default:'open'" json:"status"`
	AssignedTo    *string     `gorm:"column:assigned_to" json:"assigned_to,omitempty"`
	CreatedAt     time.Time   `gorm:"column:created_at;not null;default:now()" json:"created_at"`
}

func (Task) TableName() string {
	return "tasks"
}