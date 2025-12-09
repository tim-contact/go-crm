package migrate

import (
    "database/sql"
    "fmt"
    "io/ioutil"
    _ "github.com/lib/pq"
    "log"
)

func RunMigrations(dsn string) error {
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return fmt.Errorf("failed to connect to DB: %w", err)
    }

    defer db.Close()

    files := []string{
        "migrations/schema.sql",
		"migrations/convert_uuid_to_nanoid.sql",
        "migrations/seed.sql",
    }

    for _, f := range files {
        content, err := ioutil.ReadFile(f)
        if err != nil {
            return fmt.Errorf("failed to read %s: %w", f, err)
        }

        log.Println("Running migration:", f)

        _, err = db.Exec(string(content))
        if err != nil {
            return fmt.Errorf("error executing %s: %w", f, err)
        }
    }

    log.Println("All migrations applied successfully.")
    return nil
}
