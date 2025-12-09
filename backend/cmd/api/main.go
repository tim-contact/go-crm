package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"

	"github.com/tim-contact/go-crm/internal/config"
	"github.com/tim-contact/go-crm/internal/db"
	"github.com/tim-contact/go-crm/internal/server"
	"github.com/tim-contact/go-crm/migrate"
)

func main() {
	cfg := config.Load()

	database, err := db.Open(cfg.DB_DSN)
	if err != nil {
		log.Fatalf("db open: %v", err)
	}
 	if err := migrate.RunMigrations(dsn); err != nil {
        log.Fatal("Migration failed: ", err)
    }

	log.Println("Database connected, migrations applied")

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173", "http://localhost:8082", "https://go-crm-production.up.railway.app/"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		AllowCredentials: true, MaxAge: 12 * time.Hour,
	}))

	srv := &http.Server{
		Addr: ":8081",
		Handler: server.Router(r, database),
	}


	go func() {
		log.Printf("HTTP listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); 
		err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutdown signal received ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel() 
	if err:= srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exiting")
}