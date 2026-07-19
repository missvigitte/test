ALTER TABLE assessment_records ADD COLUMN report_unlocked INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assessment_records ADD COLUMN unlocked_at TEXT;
ALTER TABLE assessment_records ADD COLUMN unlocked_by TEXT;

CREATE TABLE IF NOT EXISTS advisor_accounts (
  id TEXT PRIMARY KEY,
  account TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  account TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
  ON admin_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_advisor_accounts_active
  ON advisor_accounts(active, name);
