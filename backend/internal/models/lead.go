package models

import "time"

type Lead struct {
	ID                 string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	InqID              string    `gorm:"column:inq_id;uniqueIndex" json:"inq_id"`
	FullName           string     `gorm:"column:full_name;not null" json:"full_name"`
	DestinationCountry *string    `gorm:"column:destination_country" json:"destination_country"`
	Status             *string    `gorm:"column:status" json:"status"`
	WhatsAppNo         string    `gorm:"column:whatsapp_no" json:"whatsapp_no"`
	InquiryDate        *time.Time `gorm:"column:inquiry_date" json:"inquiry_date"`
	AllocatedUserID    *string    `gorm:"column:allocated_user_id" json:"allocated_user_id"`
	CreatedAt          time.Time  `gorm:"column:created_at" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"column:updated_at" json:"updated_at"`
	GroupName          string     `gorm:"column:group_name" json:"group_name"`
	BranchID           *string     `gorm:"column:branch_id" json:"branch_id"`
	Remarks            string     `gorm:"column:remarks" json:"remarks"`
}

func (Lead) TableName() string {
	return "leads"
}