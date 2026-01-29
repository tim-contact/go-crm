ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'note'
    CHECK (kind IN ('call','follow_up_call','email','meeting','whatsapp','note'));
