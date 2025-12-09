// migrate/migrate.go
package migrate

import (
  "database/sql"
  "embed"
  "fmt"
  _ "github.com/lib/pq"
  "log"
)

var fs embed.FS

func RunMigrations(dsn string) error {
  db, err := sql.Open("postgres", dsn)
  if err != nil { return fmt.Errorf("db connect: %w", err) }
  defer db.Close()

  files := []string{
    "migrations/schema.sql",
    "migrations/convert_uuid_to_nanoid.sql",
    "migrations/seed.sql",
  }
  for _, f := range files {
    sqlBytes, err := fs.ReadFile(f)
    if err != nil { return fmt.Errorf("read %s: %w", f, err) }
    log.Println("Running migration:", f)
    if _, err := db.Exec(string(sqlBytes)); err != nil {
      return fmt.Errorf("exec %s: %w", f, err)
    }
  }
  log.Println("Migrations applied.")
  return nil
}
