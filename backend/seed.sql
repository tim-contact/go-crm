
-- Seed branches and an admin user (bcrypt via pgcrypto's crypt())
-- Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Branches
INSERT INTO branches (id, name)
VALUES
  (gen_random_uuid(), 'Colombo'),
  (gen_random_uuid(), 'Kandy'),
  (gen_random_uuid(), 'Jaffna')
ON CONFLICT DO NOTHING;

-- Admin user (email unique)
-- Password: admin123  (change immediately in production)
INSERT INTO users (id, name, email, phone, role, password_hash, active)
VALUES (
  gen_random_uuid(),
  'System Admin',
  'admin@example.com',
  '+94 71 234 5678',
  'admin',
  crypt('admin123', gen_salt('bf')),
  TRUE
)
ON CONFLICT (email) DO NOTHING;
