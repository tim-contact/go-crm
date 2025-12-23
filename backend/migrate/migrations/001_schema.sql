
-- CRM for Overseas Study Consultancy - PostgreSQL schema
-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;       -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;        -- trigram search
CREATE EXTENSION IF NOT EXISTS citext;         -- case-insensitive text

-- Users (staff) and roles
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           CITEXT UNIQUE NOT NULL,
    phone           TEXT,
    role            TEXT NOT NULL CHECK (role IN ('admin','coordinator','agent','viewer')),
    password_hash   TEXT NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Company branches
CREATE TABLE IF NOT EXISTS branches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE
);

-- Leads (customers/students)
-- Mapped from Excel columns (-> DB column):
-- DATE -> inquiry_date
-- INQ ID -> inq_id (UNIQUE)
-- STUDENT NAME -> full_name
-- GROUP NAME -> group_name
-- COUNTRY -> destination_country
-- BRANCH -> branch_id (lookup to branches.name)
-- FIELD -> field_of_study
-- AGE -> age
-- FLYING AS -> visa_category
-- PRINCIPLE -> principal
-- GPA -> gpa
-- WA NO -> whatsapp_no (normalize to E.164 in app)
-- TYPE -> lead_type
-- B TEAM -> team
-- STATUS -> status
-- METHOD -> contact_method
-- Allocated Person -> allocated_user_id (lookup to users.name)
-- REMARKS -> remarks
-- CC (Sigma , Canda & KK) -> cc_specialist
-- CC (All countries) -> cc_all_countries
-- SPECIAL COMMENT -> special_comment
CREATE TABLE IF NOT EXISTS leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inq_id              TEXT NOT NULL UNIQUE,
    full_name           TEXT NOT NULL,
    group_name          TEXT,
    destination_country TEXT,
    branch_id           UUID REFERENCES branches(id) ON DELETE SET NULL,
    field_of_study      TEXT,
    age                 SMALLINT CHECK (age IS NULL OR age BETWEEN 10 AND 90),
    visa_category       TEXT,
    principal           TEXT,
    gpa                 NUMERIC(4, 2) CHECK (gpa IS NULL OR (gpa >= 0.0 AND gpa <= 4.0)),
    whatsapp_no         TEXT NOT NULL,
    whatsapp_no_e164    TEXT, -- normalized in app; can be UNIQUE if policy allows
    contact_method      TEXT,
    lead_type           TEXT,
    team                TEXT,
    status              TEXT,
    allocated_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    inquiry_date        DATE,
    remarks             TEXT,
    cc_specialist       TEXT,
    cc_all_countries    TEXT,
    special_comment     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated ON leads;
CREATE TRIGGER trg_leads_updated
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Notes per lead
CREATE TABLE IF NOT EXISTS lead_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities (calls/emails/meetings) for auditability
CREATE TABLE IF NOT EXISTS activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    staff_id    UUID REFERENCES users(id),
    kind        TEXT NOT NULL CHECK (kind IN ('call','follow_up_call' , 'email','meeting','whatsapp','note')),
    summary     TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks/follow-ups
CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    due_date    DATE,
    status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','cancelled')),
    assigned_to UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simple audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id),
    action      TEXT NOT NULL,
    entity      TEXT NOT NULL,
    entity_id   UUID,
    before      JSONB,
    after       JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads (destination_country);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_alloc ON leads (allocated_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_inquiry_date ON leads (inquiry_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);

-- Trigram search indexes
CREATE INDEX IF NOT EXISTS idx_leads_full_name_trgm ON leads USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp_trgm ON leads USING gin (whatsapp_no gin_trgm_ops);

-- Helpful view for dashboards
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
