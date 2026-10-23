-- FindIt - Cloudflare D1 SQL Database Schema Migration (v2)
-- Adding Users, Badges, Weekly Challenges, and Integrity Research tables

-- 1. Users Table (Students & Staff Profiles)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    grade TEXT,
    classroom TEXT,
    track TEXT,
    avatar TEXT,
    returned_count INTEGER NOT NULL DEFAULT 0,
    is_trusted INTEGER NOT NULL DEFAULT 0,
    goodwill_points INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    completed_challenges TEXT DEFAULT '[]', -- JSON array of week_ids
    integrity_scenarios_completed TEXT DEFAULT '[]', -- JSON array of scenario IDs
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(goodwill_points);
CREATE INDEX IF NOT EXISTS idx_users_grade_classroom ON users(grade, classroom);

-- 2. Badges Catalog & Student Badges
CREATE TABLE IF NOT EXISTS badges (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('integrity', 'custody', 'volunteer', 'honor')),
    min_points INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_code TEXT NOT NULL,
    earned_at TEXT NOT NULL,
    metadata TEXT -- JSON stringified additional context
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_code ON user_badges(badge_code);

-- 3. Weekly Challenges Table (Weekly Ethics & Integrity Modules)
CREATE TABLE IF NOT EXISTS weekly_challenges (
    id TEXT PRIMARY KEY,
    week_id TEXT NOT NULL UNIQUE,
    theme_title TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    badge_name TEXT,
    pledge_text TEXT,
    scenarios TEXT NOT NULL DEFAULT '[]', -- JSON stringified array of scenarios with options & weights
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_challenges_active ON weekly_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_order ON weekly_challenges(display_order);

-- 4. Integrity Research Responses (ISEF Behavioral Empirical Dataset)
CREATE TABLE IF NOT EXISTS integrity_responses (
    id TEXT PRIMARY KEY, -- studentId_weekId
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_grade TEXT,
    week_id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    total_points_earned INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage REAL NOT NULL DEFAULT 0.0,
    ideal_answers_count INTEGER NOT NULL DEFAULT 0,
    total_scenarios INTEGER NOT NULL DEFAULT 0,
    answers TEXT NOT NULL, -- JSON stringified choices & subscores
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_integrity_responses_student ON integrity_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_integrity_responses_week ON integrity_responses(week_id);
