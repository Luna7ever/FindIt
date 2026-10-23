-- FindIt - Cloudflare D1 SQL Database Schema Migration (v3)
-- Seed badges catalog and create campus_greetings table

-- 1. Create Campus Greetings Table
CREATE TABLE IF NOT EXISTS campus_greetings (
    id TEXT PRIMARY KEY,
    period TEXT NOT NULL UNIQUE,
    emoji TEXT NOT NULL,
    time_bracket TEXT NOT NULL,
    student_greeting_ar TEXT NOT NULL,
    student_greeting_en TEXT NOT NULL,
    admin_greeting_ar TEXT NOT NULL,
    admin_greeting_en TEXT NOT NULL,
    awareness_ar TEXT,
    awareness_en TEXT,
    badge_color_class TEXT,
    display_order INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Seed Initial Badges
INSERT OR IGNORE INTO badges (id, code, title_ar, title_en, description_ar, description_en, icon, category, min_points, created_at)
VALUES 
('badge_volunteer_star', 'badge_volunteer_star', 'نجم التطوع المدرسي', 'Campus Volunteer Star', 'مُنحت للمساهمة الفعالة في الأنشطة والمبادرات التطوعية وخدمة مجتمع المدرسة.', 'Awarded for active contribution to campus volunteering initiatives.', '🌟', 'volunteer', 50, datetime('now')),
('badge_lab_guardian', 'badge_lab_guardian', 'حارس المعامل والأدوات', 'Lab & Science Facility Guardian', 'مُنحت للتميز في تنظيم وإدارة عهدة المعامل والمكتبة والمرافق العلمية.', 'Awarded for excellence in managing lab equipment custody.', '🔬', 'custody', 60, datetime('now')),
('badge_eco_ambassador', 'badge_eco_ambassador', 'سفير البيئة والنظام', 'Campus Ecology & Order Ambassador', 'مُنحت للريادة في مبادرات الحفاظ على البيئة المدرسية والنظافة العامة.', 'Awarded for leading campus environmental and order initiatives.', '🌿', 'volunteer', 70, datetime('now')),
('badge_integrity_champion', 'badge_integrity_champion', 'قائد مبادرات الأمانة', 'Trust & Custody Champion', 'مُنحت للجهود المتميزة في حماية الأمانات والتوعية الميدانية بثقافة النزاهة.', 'Awarded for outstanding leadership in school integrity and honesty culture.', '🎖️', 'integrity', 80, datetime('now')),
('badge_silver_ambassador', 'badge_silver_ambassador', 'سفير فضي للنزاهة والأمانة', 'Silver Integrity Ambassador', 'مُنحت لتحقيق معايير النزاهة المتقدمة وإعادة الأمانات لأصحابها.', 'Awarded for high integrity standing and exemplary custody returns.', '🥈', 'honor', 150, datetime('now'));

-- 3. Seed Campus Greetings
INSERT OR IGNORE INTO campus_greetings (id, period, emoji, time_bracket, student_greeting_ar, student_greeting_en, admin_greeting_ar, admin_greeting_en, awareness_ar, awareness_en, badge_color_class, display_order, created_at, updated_at)
VALUES
('greet_morning', 'morning', '☀️', '06:00 – 09:30', 'صباح الهمة والنشاط ☀️', 'Good morning! Ready for an active day ☀️', 'أهلاً م. مشيرة - جولة الصباح الباكر ☀️', 'Welcome Eng. Moshira - Morning Campus Tour ☀️', 'بداية يوم دراسي مشرق في الحرم المدرسي', 'A bright start to the school day on campus', 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50', 1, datetime('now'), datetime('now')),
('greet_recess', 'recess', '🥪', '09:30 – 12:30', 'استراحة موفقة 🥪 — تفقدي متعلقاتك', 'Enjoy your break 🥪 — Keep track of your belongings', 'فترة الفسحة المدرسية - إشراف ساحات الحرم 🥪', 'Recess Period - Campus Ground Supervision 🥪', 'وقت الفسحة والنشاط الطلابي في الساحات', 'Recess time and student activity in campus courtyards', 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50', 2, datetime('now'), datetime('now')),
('greet_dismissal', 'dismissal', '🏫', '12:30 – 16:00', 'دمتِ بخير 🏫 — تأكدي من حقيبتك وكتبك', 'Have a safe dismissal 🏫 — Check your bag and books', 'فترة الانصراف المدرسي - جرد ومطابقة الأمانات 🏫', 'Dismissal Period - Custody Reconciliation 🏫', 'مغادرة الفصول وانصراف الطالبات بسلام', 'Classroom departure and safe dismissal', 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50', 3, datetime('now'), datetime('now')),
('greet_evening', 'evening', '🌙', '16:00 – 06:00', 'مساء الخير 🌙', 'Good evening 🌙', 'نظام ETHOS في وضع المزامنة والأرشفة الليلية 🌙', 'ETHOS System in Night Sync & Archive Mode 🌙', 'انتهاء اليوم المدرسي والأمانات في عهدة آمنة', 'End of school day; items in secure custody', 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50', 4, datetime('now'), datetime('now'));
