package config

import (
	"log"
	"os"
)

type Config struct {
	DB_DSN string
}

func Load() Config {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN environment variable is required, set it in your .env file")
	}
	return Config{
		DB_DSN: dsn,
	}
}