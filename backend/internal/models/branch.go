// internal/models/branch.go
package models

type Branch struct {
	ID   string `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name string `gorm:"column:name;uniqueIndex;not null" json:"name"`
}

func (Branch) TableName() string { return "branches" }
