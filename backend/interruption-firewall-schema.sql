-- INTERRUPTION FIREWALL - DATABASE SCHEMA
-- Date: November 20, 2025

-- Office Hours Configuration Table
CREATE TABLE IF NOT EXISTS office_hours (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TEXT NOT NULL, -- HH:MM format
  end_time TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Escalation Rules Table
CREATE TABLE IF NOT EXISTS escalation_rules (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  priority TEXT NOT NULL, -- P1, P2, P3, P4
  route_to TEXT NOT NULL, -- FAQ, Manager, Office Hours, Immediate
  sla_hours INTEGER NOT NULL,
  requires_justification BOOLEAN DEFAULT 0,
  auto_batch BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- KB Articles Table (for deflection)
CREATE TABLE IF NOT EXISTS kb_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT, -- JSON array of tags
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Request Deflections Table (tracking)
CREATE TABLE IF NOT EXISTS request_deflections (
  id TEXT PRIMARY KEY,
  request_id TEXT,
  kb_article_id TEXT,
  was_deflected BOOLEAN DEFAULT 0,
  user_feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kb_article_id) REFERENCES kb_articles(id)
);

-- Request Batches Table
CREATE TABLE IF NOT EXISTS request_batches (
  id TEXT PRIMARY KEY,
  batch_date DATE NOT NULL,
  batch_time TIME NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed
  request_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

-- Request Batch Items Table
CREATE TABLE IF NOT EXISTS request_batch_items (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (batch_id) REFERENCES request_batches(id) ON DELETE CASCADE
);

-- SLA Tracking Table
CREATE TABLE IF NOT EXISTS request_sla_tracking (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  priority TEXT NOT NULL,
  sla_deadline DATETIME NOT NULL,
  first_response_at DATETIME,
  resolution_at DATETIME,
  is_breached BOOLEAN DEFAULT 0,
  breach_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_office_hours_user ON office_hours(user_id);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_org ON escalation_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_escalation_rules_priority ON escalation_rules(priority);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON kb_articles(category);
CREATE INDEX IF NOT EXISTS idx_kb_articles_published ON kb_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_request_deflections_request ON request_deflections(request_id);
CREATE INDEX IF NOT EXISTS idx_request_batches_date ON request_batches(batch_date);
CREATE INDEX IF NOT EXISTS idx_request_batch_items_batch ON request_batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_request_sla_tracking_request ON request_sla_tracking(request_id);
CREATE INDEX IF NOT EXISTS idx_request_sla_tracking_deadline ON request_sla_tracking(sla_deadline);
