package db

import (
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

func Open(dsn string) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{ SingularTable: true },
		Logger: logger.Default.LogMode(logger.warn),vg
	})
}

func Tune(sqlDB interface{ SetMaxIdleConns(int); SetMaxOpenConns(int); SetConnMaxLifetime(time.Duration) }) {
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(30 *time.Minute)
}
