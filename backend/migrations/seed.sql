
-- Seed branches and an admin user (bcrypt via pgcrypto's crypt())
-- Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS citext;

-- Branches
INSERT INTO branches (id, name)
VALUES
  (NULL, 'Colombo'),
  (NULL, 'Kandy'),
  (NULL, 'Jaffna')
ON CONFLICT DO NOTHING;

-- Admin user
INSERT INTO users (id, name, email, phone, role, password_hash, active)
VALUES (
  'lIq4cbwhqsLX3aKS_Dz_T',
  'System Admin',
  'admin@example.com',
  '+94 71 234 5678',
  'admin',
  crypt('admin123', gen_salt('bf')),
  TRUE
)
ON CONFLICT (email) DO NOTHING;

