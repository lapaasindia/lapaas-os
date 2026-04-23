-- MEETING OS - DATABASE SCHEMA
-- Date: November 20, 2025

-- Meeting Agenda Items Table
CREATE TABLE IF NOT EXISTS meeting_agenda (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  owner TEXT,
  status TEXT DEFAULT 'pending',
  time_spent INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Meeting Roles Table
CREATE TABLE IF NOT EXISTS meeting_roles (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE,
  facilitator TEXT,
  scribe TEXT,
  decision_maker TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Meeting Recordings Table
CREATE TABLE IF NOT EXISTS meeting_recordings (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  transcription TEXT,
  summary TEXT,
  duration INTEGER,
  file_size INTEGER,
  format TEXT DEFAULT 'webm',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Meeting Timer Sessions Table
CREATE TABLE IF NOT EXISTS meeting_timer_sessions (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  agenda_item_id TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INTEGER,
  status TEXT DEFAULT 'running',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (agenda_item_id) REFERENCES meeting_agenda(id) ON DELETE SET NULL
);

-- After-Action Packets Table
CREATE TABLE IF NOT EXISTS meeting_after_action (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE,
  summary TEXT,
  decisions_count INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,
  nps_score INTEGER,
  nps_feedback TEXT,
  email_sent BOOLEAN DEFAULT 0,
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_agenda_meeting_id ON meeting_agenda(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_agenda_order ON meeting_agenda(meeting_id, order_index);
CREATE INDEX IF NOT EXISTS idx_meeting_roles_meeting_id ON meeting_roles(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_timer_sessions_meeting_id ON meeting_timer_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_after_action_meeting_id ON meeting_after_action(meeting_id);
