CREATE TABLE IF NOT EXISTS assessment_records (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  level TEXT,
  level_name TEXT,
  credit INTEGER,
  business_score INTEGER,
  ai_score INTEGER,
  category TEXT,
  match INTEGER,
  ai_weakness TEXT,
  status TEXT NOT NULL DEFAULT '待分配',
  owner TEXT NOT NULL DEFAULT '未分配',
  source TEXT NOT NULL DEFAULT '完整OPC测评',
  note TEXT,
  business_result TEXT,
  ai_result TEXT,
  business_answers TEXT,
  ai_answers TEXT
);

CREATE INDEX IF NOT EXISTS idx_assessment_records_created_at
  ON assessment_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assessment_records_status
  ON assessment_records(status);

CREATE INDEX IF NOT EXISTS idx_assessment_records_phone
  ON assessment_records(phone);
