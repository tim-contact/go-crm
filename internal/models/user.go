package models

import "time"

type User struct {
	ID     string `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name   string `gorm:"column:name;not null" json:"name"`
	Email  string `gorm:"column:email;type:citext;uniqueIndex;not null" json:"email"`
	Phone  *string `gorm:"column:phone;uniqueIndex" json:"phone"`
	Role   string `gorm:"column:role;not null" json:"role"`
	PasswordHash string `gorm:"column:password_hash;not null" json:"-"`
	Active bool   `gorm:"column:active;default:true" json:"active"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (User) TableName() string {
	return "users"
}