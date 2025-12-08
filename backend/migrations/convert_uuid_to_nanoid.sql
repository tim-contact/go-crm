-- ===========================================================
-- Migration: Convert UUID to TEXT (Nano ID)
-- ===========================================================
-- NOTE: Nano ID generation must be handled in your application code
-- PostgreSQL doesn't have native Nano ID support
-- ===========================================================

-- ===========================================================
-- STEP 0: Drop dependent view before altering column types
-- ===========================================================
DROP VIEW IF EXISTS v_lead_summary;

-- ===========================================================
-- STEP 1: Drop all foreign key constraints that reference users.id
-- ===========================================================
ALTER TABLE leads
    DROP CONSTRAINT IF EXISTS leads_allocated_user_id_fkey;

ALTER TABLE lead_notes
    DROP CONSTRAINT IF EXISTS lead_notes_created_by_fkey;

ALTER TABLE activities
    DROP CONSTRAINT IF EXISTS activities_staff_id_fkey;

ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

ALTER TABLE audit_logs
    DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;

-- ===========================================================
-- STEP 2: Convert users.id from UUID → TEXT (PRIMARY KEY FIRST!)
-- ===========================================================
ALTER TABLE users
    ALTER COLUMN id DROP DEFAULT,
    ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- ===========================================================
-- STEP 3: Now convert all foreign key columns to TEXT
-- ===========================================================

-- Convert leads.allocated_user_id
ALTER TABLE leads
    ALTER COLUMN allocated_user_id TYPE TEXT USING allocated_user_id::TEXT;

-- Convert lead_notes.created_by
ALTER TABLE lead_notes
    ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;

-- Convert activities.staff_id
ALTER TABLE activities
    ALTER COLUMN staff_id TYPE TEXT USING staff_id::TEXT;

-- Convert tasks.assigned_to
ALTER TABLE tasks
    ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;

-- Convert audit_logs fields
ALTER TABLE audit_logs
    ALTER COLUMN actor_id TYPE TEXT USING actor_id::TEXT,
    ALTER COLUMN entity_id TYPE TEXT USING entity_id::TEXT;

-- ===========================================================
-- STEP 4: Recreate all foreign key constraints
-- ===========================================================

ALTER TABLE leads
    ADD CONSTRAINT leads_allocated_user_id_fkey
        FOREIGN KEY (allocated_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL;

ALTER TABLE lead_notes
    ADD CONSTRAINT lead_notes_created_by_fkey
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL;

ALTER TABLE activities
    ADD CONSTRAINT activities_staff_id_fkey
        FOREIGN KEY (staff_id)
        REFERENCES users(id)
        ON DELETE SET NULL;

ALTER TABLE tasks
    ADD CONSTRAINT tasks_assigned_to_fkey
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON DELETE SET NULL;

ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_actor_id_fkey
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE SET NULL;

-- ===========================================================
-- STEP 5: Recreate the view v_lead_summary
-- ===========================================================
CREATE OR REPLACE VIEW v_lead_summary AS
SELECT
  l.id,
  l.inq_id,
  l.full_name,
  l.destination_country,
  l.status,
  l.inquiry_date,
  u.name AS allocated_to,
  b.name AS branch
FROM leads l
LEFT JOIN users u ON u.id = l.allocated_user_id
LEFT JOIN branches b ON b.id = l.branch_id;