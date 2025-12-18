package models

import "time"

type ActivityKind string;

const (
	ActivityCall	     ActivityKind = "call"
	ActivityFollowUpCall ActivityKind = "follow_up_call"
	ActivityEmail        ActivityKind = "email"
	ActivityMeeting      ActivityKind = "meeting"
	ActivityWhatsapp     ActivityKind = "whatsapp"
	ActivityNote         ActivityKind = "note"
)

type Activity struct {
	ID        string          `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	LeadID    string          `gorm:"type:uuid;not null;index" json:"lead_id"`
	StaffID   *string         `gorm:"column:staff_id" json:"staff_id,omitempty"`
	Kind      ActivityKind    `gorm:"column:kind;type:text;not null" json:"kind"`     
	Summary   *string         `gorm:"column:summary" json:"summary,omitempty"`
	OccurredAt time.Time      `gorm:"column:occurred_at;not null;default:now()" json:"occurred_at"`
}

func (Activity) TableName() string {
	return "activities"
}

 