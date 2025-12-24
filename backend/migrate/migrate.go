package migrate

import (
  "database/sql"
  "embed"
  "fmt"
  "time"
  "strings"
  _ "github.com/lib/pq"
  "log"
)

//go:embed migrations/*.sql
var fs embed.FS

func RunMigrations(dsn string) error {
  db, err := sql.Open("postgres", dsn)
  if err != nil { return fmt.Errorf("db connect: %w", err) }
  defer db.Close()

  if err := ensureMigrationsTable(db); err != nil {
    return err
  }

  entries, err := fs.ReadDir("migrations")
  if err != nil {
    return fmt.Errorf("readdir migrations: %w", err)
  }

  var files []string

  for _, e := range entries {
    if e.IsDir() {
      continue
    }

    name := e.Name()

    if strings.HasSuffix(strings.ToLower(name), ".sql") {
      files = append(files, name)
    }
  }

  if len(files) == 0 {
    log.Println("No migration files found.")
    return nil
  }

  applied, err := loadAppliedMigrations(db)
  if err != nil {
    return fmt.Errorf("load applied migrations: %w", err)
  }

  appliedCount := 0 

  for _, file := range files {
    if applied[file] {
      continue
    }

    sqlBytes, err := fs.ReadFile("migrations/" + file)
    if err != nil {
      return fmt.Errorf("read migration file %s: %w", file, err)
    }

    contents := strings.TrimSpace(string(sqlBytes))
    if contents == "" {
      if err := markApplied(db, file); err != nil {
        return fmt.Errorf("mark empty migration %s as applied: %w", file, err)
      }

      log.Printf("Applied (empty) migration: %s", file)
      appliedCount++
      continue
    }

    log.Printf("Applying migration: %s", file)
    tx, err := db.Begin()

    if err != nil {
      return fmt.Errorf("begin tx for migration %s: %w", file, err)
    }

    if _, err := tx.Exec(contents); err != nil {
      _ = tx.Rollback()
      return fmt.Errorf("exec migration %s: %w", file, err)
    }

    if _, err := tx.Exec(
      `INSERT INTO schema_migrations (filename, applied_at) VALUES ($1, $2)`,
      file,
      time.Now().UTC(),
    ); err != nil {
      _ = tx.Rollback()
      return fmt.Errorf("record migration %s: %w", file, err)
    }
    
    if err := tx.Commit(); err != nil {
      return fmt.Errorf("commit migration %s: %w", file, err)
    }

    appliedCount++


  }
  log.Println("Migrations applied.")
  return nil
}

func ensureMigrationsTable(db *sql.DB) error {
  _, err := db.Exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL)
      `)

      if err != nil {
        return fmt.Errorf("create schema_migrations table: %w", err)
      }
      return nil
}

func loadAppliedMigrations(db *sql.DB) (map[string]bool, error) {
  rows, err := db.Query(`SELECT filename FROM schema_migrations`)

  if err != nil {
    return nil, err
  }

  defer rows.Close()

  applied := make(map[string]bool)
  for rows.Next() {
    var filename string
    if err := rows.Scan(&filename); err != nil {
      return nil, err
    }
    applied[filename] = true
  }

  if err := rows.Err(); err != nil {
    return nil, err
  }

  return applied, nil
}

func markApplied(db *sql.DB, filename string) error {
  _, err := db.Exec(`
    INSERT INTO schema_migrations (filename, applied_at) VALUES ($1, $2) ON CONFLICT (filename) DO NOTHING
  `,
  filename,
  time.Now().UTC(),
  )

  if err != nil {
    return fmt.Errorf("insert applied migration %s: %w", filename, err)
  }

  return nil

}