/**
 * Database Migration Script
 * Creates all necessary tables for persistent data storage
 * Run this once to set up the database schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'lapaas.db');

const db = new sqlite3.Database(DB_PATH);

const tables = [
  // ==================== MEETINGS ====================
  `CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    purpose TEXT,
    expected_outcomes TEXT,
    location TEXT,
    meeting_type TEXT DEFAULT 'internal',
    status TEXT DEFAULT 'scheduled',
    start_time TEXT,
    end_time TEXT,
    duration_minutes INTEGER,
    organizer_id TEXT,
    organizer_name TEXT,
    facilitator_id TEXT,
    scribe_id TEXT,
    decision_maker_id TEXT,
    attendees TEXT, -- JSON array
    is_recurring INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    calendar_event_id TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS meeting_agenda_items (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 5,
    presenter_id TEXT,
    presenter_name TEXT,
    order_index INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    actual_duration_minutes INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS meeting_decisions (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    decision TEXT NOT NULL,
    rationale TEXT,
    owner_id TEXT,
    owner_name TEXT,
    review_date TEXT,
    status TEXT DEFAULT 'approved',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS meeting_action_items (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    decision_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT,
    assignee_name TEXT,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    completed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS meeting_attendees (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    user_id TEXT,
    email TEXT,
    name TEXT,
    role TEXT DEFAULT 'attendee',
    rsvp_status TEXT DEFAULT 'pending',
    attended INTEGER DEFAULT 0,
    joined_at TEXT,
    left_at TEXT,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
  )`,

  // ==================== REQUESTS (Interruption Firewall) ====================
  `CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    requester_id TEXT,
    requester_name TEXT,
    requester_email TEXT,
    category TEXT,
    urgency TEXT DEFAULT 'P3',
    description TEXT NOT NULL,
    what_tried TEXT,
    impact TEXT,
    deadline TEXT,
    attachments TEXT, -- JSON array
    status TEXT DEFAULT 'pending',
    routed_to_id TEXT,
    routed_to_name TEXT,
    routed_to_email TEXT,
    request_type TEXT DEFAULT 'to_founder',
    response TEXT,
    responded_at TEXT,
    sla_at TEXT,
    sla_breached INTEGER DEFAULT 0,
    delegated_to_id TEXT,
    delegated_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // ==================== TASKS ====================
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date TEXT,
    due_time TEXT,
    scheduled_start_time TEXT,
    scheduled_end_time TEXT,
    estimated_minutes INTEGER,
    actual_minutes INTEGER DEFAULT 0,
    is_recurring INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    is_blocked INTEGER DEFAULT 0,
    blocked_reason TEXT,
    parent_task_id TEXT,
    project_id TEXT,
    assignee_id TEXT,
    assignee_name TEXT,
    tags TEXT, -- JSON array
    completed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS task_subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )`,

  // ==================== COMMITMENTS (Daily Top-3) ====================
  `CREATE TABLE IF NOT EXISTS commitments (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    effort_minutes INTEGER DEFAULT 30,
    actual_minutes INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    linked_task_id TEXT,
    linked_project_id TEXT,
    notes TEXT,
    score REAL,
    completed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS commitment_subtasks (
    id TEXT PRIMARY KEY,
    commitment_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commitment_id) REFERENCES commitments(id) ON DELETE CASCADE
  )`,

  // ==================== TIME BLOCKS ====================
  `CREATE TABLE IF NOT EXISTS time_blocks (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    block_type TEXT DEFAULT 'deep_work',
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes INTEGER,
    target_minutes INTEGER,
    actual_minutes INTEGER DEFAULT 0,
    color TEXT,
    is_recurring INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // ==================== KNOWLEDGE BASE ====================
  `CREATE TABLE IF NOT EXISTS kb_categories (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📄',
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS kb_articles (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    category_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT, -- JSON array
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES kb_categories(id)
  )`,

  // ==================== OFFICE HOURS ====================
  `CREATE TABLE IF NOT EXISTS office_hours (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    max_slots INTEGER DEFAULT 4,
    slot_duration_minutes INTEGER DEFAULT 15,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // ==================== FOCUS SESSIONS ====================
  `CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    planned_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    status TEXT DEFAULT 'active',
    breaches INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // ==================== CALENDAR EVENTS ====================
  `CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'event',
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    all_day INTEGER DEFAULT 0,
    location TEXT,
    color TEXT,
    is_recurring INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    reminder_minutes INTEGER,
    linked_meeting_id TEXT,
    linked_task_id TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`
];

const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_meetings_org_id ON meetings(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time)',
  'CREATE INDEX IF NOT EXISTS idx_meeting_agenda_meeting_id ON meeting_agenda_items(meeting_id)',
  'CREATE INDEX IF NOT EXISTS idx_meeting_decisions_meeting_id ON meeting_decisions(meeting_id)',
  'CREATE INDEX IF NOT EXISTS idx_meeting_actions_meeting_id ON meeting_action_items(meeting_id)',
  'CREATE INDEX IF NOT EXISTS idx_requests_org_id ON requests(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)',
  'CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON requests(requester_id)',
  'CREATE INDEX IF NOT EXISTS idx_requests_routed_to_id ON requests(routed_to_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)',
  'CREATE INDEX IF NOT EXISTS idx_commitments_org_id ON commitments(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON commitments(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_commitments_date ON commitments(date)',
  'CREATE INDEX IF NOT EXISTS idx_time_blocks_org_id ON time_blocks(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_time_blocks_user_id ON time_blocks(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON time_blocks(date)',
  'CREATE INDEX IF NOT EXISTS idx_kb_articles_org_id ON kb_articles(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON kb_articles(category_id)',
  'CREATE INDEX IF NOT EXISTS idx_calendar_events_org_id ON calendar_events(org_id)',
  'CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time)'
];

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  // Create tables
  for (const sql of tables) {
    await new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('❌ Error creating table:', err.message);
          reject(err);
        } else {
          // Extract table name from SQL
          const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
          if (match) {
            console.log(`✅ Table: ${match[1]}`);
          }
          resolve();
        }
      });
    });
  }

  console.log('\n📊 Creating indexes...\n');

  // Create indexes
  for (const sql of indexes) {
    await new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('❌ Error creating index:', err.message);
          reject(err);
        } else {
          const match = sql.match(/idx_\w+/);
          if (match) {
            console.log(`✅ Index: ${match[0]}`);
          }
          resolve();
        }
      });
    });
  }

  console.log('\n✅ Migration complete!\n');

  // Show all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, rows) => {
    if (err) {
      console.error('Error listing tables:', err);
    } else {
      console.log('📋 All tables in database:');
      rows.forEach(row => console.log(`   - ${row.name}`));
    }
    db.close();
  });
}

migrate().catch(console.error);
