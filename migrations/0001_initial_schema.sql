-- FindIt - Cloudflare D1 SQL Database Schema Migration (v1)
-- Multi-tenant resilient schema for ISEF 2026

-- 1. Items Table (Lost & Found inventory)
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    category TEXT NOT NULL,
    location_id TEXT NOT NULL,
    color TEXT,
    brand TEXT,
    description TEXT,
    image_url TEXT,
    visual_features TEXT, -- JSON-stringified EdgeVision features
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'reunited', 'archived')),
    custody TEXT NOT NULL DEFAULT 'student' CHECK (custody IN ('student', 'security', 'admin', 'returned')),
    secret_question TEXT,
    secret_answer_hash TEXT,
    reported_by_id TEXT NOT NULL,
    reported_by_name TEXT NOT NULL,
    reported_by_role TEXT NOT NULL DEFAULT 'student',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(location_id);
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at);

-- 2. Claims Table (Ownership claims & Handover PINs)
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    claimer_id TEXT NOT NULL,
    claimer_name TEXT NOT NULL,
    claimer_role TEXT NOT NULL DEFAULT 'student',
    answer_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    handover_pin TEXT, -- Encrypted/Salted 4-digit PIN
    failed_pin_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_claims_item_id ON claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimer_id ON claims(claimer_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

-- 3. School Activity Submissions (Reputation & Integrity)
CREATE TABLE IF NOT EXISTS activity_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    points_awarded INTEGER NOT NULL DEFAULT 0,
    location_id TEXT,
    notes TEXT,
    submitted_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_status ON activity_submissions(status);

-- 4. Integrity Scenarios Attempts
CREATE TABLE IF NOT EXISTS integrity_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    answers TEXT NOT NULL, -- JSON-stringified answers
    score INTEGER NOT NULL,
    passed INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    attempted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_integrity_user ON integrity_attempts(user_id);

-- 5. Sync Audit & Conflict Resolution Log
CREATE TABLE IF NOT EXISTS sync_audit (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    source_client_id TEXT,
    synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_audit_synced_at ON sync_audit(synced_at);
