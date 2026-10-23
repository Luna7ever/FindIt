import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_WEEKLY_CHALLENGES } from '@/lib/challengesData';

export const dynamic = 'force-dynamic';

interface SyncPayload {
  items?: any[];
  claims?: any[];
  users?: any[];
  weeklyChallenges?: any[];
  activitySubmissions?: any[];
  integrityResponses?: any[];
  badges?: any[];
  campusGreetings?: any[];
  pinVerification?: {
    claimId: string;
    pin: string;
  };
  sourceClientId?: string;
  timestamp?: string;
}

// In-memory fallback cache for local dev / non-D1 runtime
let edgeMemoryStore = {
  items: [] as any[],
  claims: [] as any[],
  users: [] as any[],
  badges: [] as any[],
  campusGreetings: [] as any[],
  weeklyChallenges: DEFAULT_WEEKLY_CHALLENGES as any[],
  activitySubmissions: [] as any[],
  integrityResponses: [] as any[],
  lastSyncedAt: new Date().toISOString(),
};

function formatD1Item(row: any) {
  let visualFeatures = undefined;
  if (row.visual_features) {
    try {
      visualFeatures = typeof row.visual_features === 'string' ? JSON.parse(row.visual_features) : row.visual_features;
    } catch {}
  }
  return {
    id: row.id,
    title: row.title || '',
    type: row.type || 'lost',
    category: row.category || 'other',
    locationId: row.location_id || row.locationId || 'unknown',
    color: row.color || undefined,
    brand: row.brand || undefined,
    description: row.description || '',
    imageUrl: row.image_url || row.imageUrl || undefined,
    visualFeatures,
    status: row.status || 'open',
    custody: row.custody || 'student',
    secretQuestion: row.secret_question || row.secretQuestion || undefined,
    secretAnswer: row.secret_answer_hash || undefined,
    reportedBy: {
      id: row.reported_by_id || row.reportedBy?.id || 'unknown',
      name: row.reported_by_name || row.reportedBy?.name || 'مستخدم',
      role: row.reported_by_role || row.reportedBy?.role || 'student',
    },
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

function formatD1Claim(row: any) {
  return {
    id: row.id,
    itemId: row.item_id || row.itemId,
    claimant: {
      id: row.claimer_id || row.claimant?.id || 'unknown',
      name: row.claimer_name || row.claimant?.name || 'مستخدم',
      role: row.claimer_role || row.claimant?.role || 'student',
    },
    answerText: row.answer_text || row.answerText || '',
    status: row.status || 'pending',
    handoverPin: row.handover_pin || row.handoverPin || '',
    failedPinAttempts: row.failed_pin_attempts || 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

function formatD1User(row: any) {
  let completedChallenges: string[] = [];
  let integrityScenariosCompleted: string[] = [];
  try {
    if (row.completed_challenges) completedChallenges = JSON.parse(row.completed_challenges);
    if (row.integrity_scenarios_completed) integrityScenariosCompleted = JSON.parse(row.integrity_scenarios_completed);
  } catch {}

  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    role: row.role || 'student',
    grade: row.grade || '',
    classroom: row.classroom || '',
    track: row.track || '',
    avatar: row.avatar || '',
    returnedCount: row.returned_count || 0,
    isTrusted: Boolean(row.is_trusted),
    goodwillPoints: row.goodwill_points || 0,
    total_points: row.total_points || row.goodwill_points || 0,
    completed_challenges: completedChallenges,
    integrityScenariosCompleted,
    isLeaderboardVisible: row.is_leaderboard_visible === null || row.is_leaderboard_visible === undefined ? true : Boolean(row.is_leaderboard_visible),
    maskContactInfo: row.mask_contact_info === null || row.mask_contact_info === undefined ? true : Boolean(row.mask_contact_info),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function formatD1Challenge(row: any) {
  let scenarios = [];
  try {
    if (row.scenarios) scenarios = typeof row.scenarios === 'string' ? JSON.parse(row.scenarios) : row.scenarios;
  } catch {}

  return {
    id: row.id,
    week_id: row.week_id,
    theme_title: row.theme_title,
    order: row.display_order || 1,
    is_active: Boolean(row.is_active),
    start_date: row.start_date,
    end_date: row.end_date,
    description: row.description,
    badge_name: row.badge_name,
    pledge_text: row.pledge_text,
    scenarios,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function formatD1Badge(row: any) {
  return {
    id: row.id,
    code: row.code || row.id,
    title: row.title_ar,
    titleEn: row.title_en,
    description: row.description_ar,
    descriptionEn: row.description_en,
    icon: row.icon,
    category: row.category,
    requiredPoints: row.min_points || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function formatD1Greeting(row: any) {
  return {
    id: row.id,
    period: row.period,
    emoji: row.emoji,
    timeBracket: row.time_bracket,
    studentGreetingAr: row.student_greeting_ar,
    studentGreetingEn: row.student_greeting_en,
    adminGreetingAr: row.admin_greeting_ar,
    adminGreetingEn: row.admin_greeting_en,
    awarenessAr: row.awareness_ar || '',
    awarenessEn: row.awareness_en || '',
    badgeColorClass: row.badge_color_class || '',
    displayOrder: row.display_order || 1,
  };
}

function formatD1Activity(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userGrade: row.user_grade || undefined,
    activityId: row.activity_id,
    status: row.status,
    pointsAwarded: row.points_awarded || 0,
    locationId: row.location_id || undefined,
    notes: row.notes || undefined,
    audioBase64: row.audio_base64 || undefined,
    audioDuration: row.audio_duration || undefined,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at || undefined,
    reviewedBy: row.reviewed_by || undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity') || 'all';

    // Access Cloudflare D1
    // @ts-ignore
    const d1 = (globalThis as any).env?.DB || (process.env as any).DB;

    if (d1 && typeof d1.prepare === 'function') {
      try {
        let items: any[] = [];
        let claims: any[] = [];
        let users: any[] = [];
        let weeklyChallenges: any[] = [];
        let activities: any[] = [];
        let badges: any[] = [];
        let campusGreetings: any[] = [];

        // 1. Items
        if (entity === 'items' || entity === 'all') {
          const itemsResult = await d1.prepare('SELECT * FROM items ORDER BY updated_at DESC LIMIT 200').all();
          items = (itemsResult.results || []).map(formatD1Item);
        }

        // 2. Claims
        if (entity === 'claims' || entity === 'all') {
          try {
            const claimsResult = await d1.prepare('SELECT * FROM claims ORDER BY updated_at DESC LIMIT 200').all();
            claims = (claimsResult.results || []).map(formatD1Claim);
          } catch (claimsErr) {
            console.warn('Cloudflare D1 claims query fallback:', claimsErr);
          }
        }

        // 3. Users
        if (entity === 'users' || entity === 'all') {
          try {
            const usersResult = await d1.prepare('SELECT * FROM users ORDER BY goodwill_points DESC LIMIT 200').all();
            users = (usersResult.results || []).map(formatD1User);
          } catch (usersErr) {
            console.warn('Cloudflare D1 users query fallback:', usersErr);
          }
        }

        // 4. Weekly Challenges
        if (entity === 'challenges' || entity === 'all') {
          try {
            const chResult = await d1.prepare('SELECT * FROM weekly_challenges ORDER BY display_order ASC').all();
            if (chResult.results && chResult.results.length > 0) {
              weeklyChallenges = chResult.results.map(formatD1Challenge);
            } else {
              // Seed default challenges into D1
              const now = new Date().toISOString();
              for (const ch of DEFAULT_WEEKLY_CHALLENGES) {
                await d1.prepare(`
                  INSERT OR IGNORE INTO weekly_challenges (
                    id, week_id, theme_title, display_order, is_active, 
                    start_date, end_date, description, badge_name, pledge_text, scenarios, 
                    created_at, updated_at
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                  ch.id,
                  ch.week_id,
                  ch.theme_title,
                  ch.order,
                  ch.is_active ? 1 : 0,
                  ch.start_date || '',
                  ch.end_date || '',
                  ch.description || '',
                  ch.badge_name || '',
                  ch.pledge_text || '',
                  JSON.stringify(ch.scenarios || []),
                  now,
                  now
                ).run();
              }
              weeklyChallenges = DEFAULT_WEEKLY_CHALLENGES;
            }
          } catch (chErr) {
            console.warn('Cloudflare D1 challenges query fallback:', chErr);
            weeklyChallenges = DEFAULT_WEEKLY_CHALLENGES;
          }
        }

        // 5. Activities
        if (entity === 'activities' || entity === 'all') {
          try {
            const actResult = await d1.prepare('SELECT * FROM activity_submissions ORDER BY submitted_at DESC LIMIT 100').all();
            activities = (actResult.results || []).map(formatD1Activity);
          } catch {}
        }

        // 6. Badges
        if (entity === 'badges' || entity === 'all') {
          try {
            const badgeResult = await d1.prepare('SELECT * FROM badges ORDER BY min_points ASC').all();
            badges = (badgeResult.results || []).map(formatD1Badge);
          } catch (bErr) {
            console.warn('Cloudflare D1 badges query fallback:', bErr);
          }
        }

        // 7. Campus Greetings
        if (entity === 'greetings' || entity === 'all') {
          try {
            const greetResult = await d1.prepare('SELECT * FROM campus_greetings ORDER BY display_order ASC').all();
            campusGreetings = (greetResult.results || []).map(formatD1Greeting);
          } catch (gErr) {
            console.warn('Cloudflare D1 campus_greetings query fallback:', gErr);
          }
        }

        return NextResponse.json({
          status: 'ok',
          provider: 'cloudflare_d1_native',
          connected: true,
          totalItems: items.length,
          items,
          claims,
          users,
          badges,
          campusGreetings,
          weeklyChallenges,
          activities,
          syncedAt: new Date().toISOString(),
        });
      } catch (d1Err) {
        console.warn('Cloudflare D1 query error, falling back to edge store:', d1Err);
      }
    }

    return NextResponse.json({
      status: 'ok',
      provider: d1 ? 'cloudflare_d1' : 'cloudflare_edge_hybrid',
      connected: true,
      totalItems: edgeMemoryStore.items.length,
      syncedAt: edgeMemoryStore.lastSyncedAt,
      items: (edgeMemoryStore.items || []).map(formatD1Item),
      claims: (edgeMemoryStore.claims || []).map(formatD1Claim),
      users: (edgeMemoryStore.users || []).map(formatD1User),
      badges: edgeMemoryStore.badges,
      campusGreetings: edgeMemoryStore.campusGreetings,
      weeklyChallenges: edgeMemoryStore.weeklyChallenges || DEFAULT_WEEKLY_CHALLENGES,
      activities: edgeMemoryStore.activitySubmissions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown sync error',
        syncedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: SyncPayload = await request.json();
    const now = new Date().toISOString();

    // @ts-ignore
    const d1 = (globalThis as any).env?.DB || (process.env as any).DB;
    let d1Executed = false;

    if (d1 && typeof d1.prepare === 'function') {
      try {
        // 1. PIN Handover Verification (Atomic in D1)
        if (payload.pinVerification) {
          const { claimId, pin } = payload.pinVerification;
          const claimRow = await d1.prepare('SELECT * FROM claims WHERE id = ?').bind(claimId).first();

          if (!claimRow) {
            return NextResponse.json({ success: false, message: 'طلب الاسترداد غير موجود' }, { status: 404 });
          }

          if (claimRow.failed_pin_attempts >= 3) {
            return NextResponse.json({
              success: false,
              message: 'تم استنفاد عدد المحاولات المسموحة. لحماية الأمانة، يرجى التوجه لمكتب الإدارة المدرسية للتحقق اليدوي.',
              exceeded: true
            }, { status: 403 });
          }

          if (claimRow.handover_pin !== pin.trim()) {
            const newAttempts = (claimRow.failed_pin_attempts || 0) + 1;
            await d1.prepare('UPDATE claims SET failed_pin_attempts = ?, updated_at = ? WHERE id = ?')
              .bind(newAttempts, now, claimId).run();

            const remaining = 3 - newAttempts;
            return NextResponse.json({
              success: false,
              message: remaining <= 0 
                ? 'تم استنفاد عدد المحاولات المسموحة. لحماية الأمانة، يرجى التوجه لمكتب الإدارة المدرسية.' 
                : `رمز التسليم غير صحيح. المحاولات المتبقية: ${remaining}`,
              remainingAttempts: remaining
            });
          }

          // PIN Correct: Atomically mark claim completed & item reunited
          await d1.batch([
            d1.prepare('UPDATE claims SET status = "completed", handover_pin = "", updated_at = ? WHERE id = ?')
              .bind(now, claimId),
            d1.prepare('UPDATE items SET status = "reunited", updated_at = ? WHERE id = ?')
              .bind(now, claimRow.item_id)
          ]);

          return NextResponse.json({
            success: true,
            message: 'تم إثبات الملكية وتأكيد التسليم بنجاح عبر Cloudflare D1 🎉'
          });
        }

        // 2. Upsert items
        if (Array.isArray(payload.items) && payload.items.length > 0) {
          const statements = payload.items.map((item) => {
            return d1.prepare(`
              INSERT INTO items (
                id, title, type, category, location_id, color, brand, description, 
                image_url, visual_features, status, custody, secret_question, 
                secret_answer_hash, reported_by_id, reported_by_name, reported_by_role, 
                created_at, updated_at, version
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                status = excluded.status,
                custody = excluded.custody,
                description = excluded.description,
                updated_at = excluded.updated_at,
                version = version + 1
            `).bind(
              item.id,
              item.title || '',
              item.type || 'lost',
              item.category || 'other',
              item.locationId || 'unknown',
              item.color || null,
              item.brand || null,
              item.description || '',
              item.imageUrl || null,
              item.visualFeatures ? JSON.stringify(item.visualFeatures) : null,
              item.status || 'open',
              item.custody || 'student',
              item.secretQuestion || null,
              item.secretAnswer ? 'HASHED' : null,
              item.reportedBy?.id || 'unknown',
              item.reportedBy?.name || 'Unknown',
              item.reportedBy?.role || 'student',
              item.createdAt || now,
              now,
              1
            );
          });
          await d1.batch(statements);
          d1Executed = true;
        }

        // 3. Upsert claims
        if (Array.isArray(payload.claims) && payload.claims.length > 0) {
          const claimStatements = payload.claims.map((claim) => {
            return d1.prepare(`
              INSERT INTO claims (
                id, item_id, claimer_id, claimer_name, claimer_role, answer_text,
                status, handover_pin, failed_pin_attempts, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                handover_pin = excluded.handover_pin,
                failed_pin_attempts = excluded.failed_pin_attempts,
                updated_at = excluded.updated_at
            `).bind(
              claim.id,
              claim.itemId,
              claim.claimant?.id || claim.claimer?.id || 'unknown',
              claim.claimant?.name || claim.claimer?.name || 'Unknown',
              claim.claimant?.role || claim.claimer?.role || 'student',
              claim.answerText || '',
              claim.status || 'pending',
              claim.handoverPin || null,
              claim.failedPinAttempts || 0,
              claim.createdAt || now,
              now
            );
          });
          await d1.batch(claimStatements);
          d1Executed = true;
        }

        // 4. Upsert Users (Students/Admins)
        if (Array.isArray(payload.users) && payload.users.length > 0) {
          const userStatements = payload.users.map((u) => {
            return d1.prepare(`
              INSERT INTO users (
                id, name, email, role, grade, classroom, track, avatar,
                returned_count, is_trusted, goodwill_points, total_points,
                completed_challenges, integrity_scenarios_completed,
                is_leaderboard_visible, mask_contact_info,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                grade = excluded.grade,
                classroom = excluded.classroom,
                avatar = excluded.avatar,
                returned_count = excluded.returned_count,
                is_trusted = excluded.is_trusted,
                goodwill_points = excluded.goodwill_points,
                total_points = excluded.total_points,
                completed_challenges = excluded.completed_challenges,
                integrity_scenarios_completed = excluded.integrity_scenarios_completed,
                is_leaderboard_visible = excluded.is_leaderboard_visible,
                mask_contact_info = excluded.mask_contact_info,
                updated_at = excluded.updated_at
            `).bind(
              u.id,
              u.name,
              u.email || '',
              u.role || 'student',
              u.grade || '',
              u.classroom || '',
              u.track || '',
              u.avatar || '',
              u.returnedCount || 0,
              u.isTrusted ? 1 : 0,
              u.goodwillPoints || 0,
              u.total_points || u.goodwillPoints || 0,
              JSON.stringify(u.completed_challenges || []),
              JSON.stringify(u.integrityScenariosCompleted || []),
              u.isLeaderboardVisible === false ? 0 : 1,
              u.maskContactInfo === false ? 0 : 1,
              now,
              now
            );
          });
          await d1.batch(userStatements);
          d1Executed = true;
        }

        // 5. Upsert Integrity Research Responses
        if (Array.isArray(payload.integrityResponses) && payload.integrityResponses.length > 0) {
          const researchStatements = payload.integrityResponses.map((r) => {
            return d1.prepare(`
              INSERT INTO integrity_responses (
                id, student_id, student_name, student_grade, week_id, completed_at,
                total_points_earned, accuracy_percentage, ideal_answers_count,
                total_scenarios, answers, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                total_points_earned = excluded.total_points_earned,
                accuracy_percentage = excluded.accuracy_percentage,
                ideal_answers_count = excluded.ideal_answers_count,
                answers = excluded.answers,
                updated_at = excluded.updated_at
            `).bind(
              r.id || `${r.studentId}_${r.weekId}`,
              r.studentId,
              r.studentName,
              r.studentGrade || '',
              r.weekId,
              r.completedAt || now,
              r.totalPointsEarned || 0,
              r.accuracyPercentage || 0,
              r.idealAnswersCount || 0,
              r.totalScenarios || 0,
              JSON.stringify(r.answers || {}),
              now,
              now
            );
          });
          await d1.batch(researchStatements);
          d1Executed = true;
        }

        // 6. Upsert Badges
        if (Array.isArray(payload.badges) && payload.badges.length > 0) {
          const badgeStatements = payload.badges.map((b) => {
            return d1.prepare(`
              INSERT INTO badges (
                id, code, title_ar, title_en, description_ar, description_en, icon, category, min_points, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title_ar = excluded.title_ar,
                title_en = excluded.title_en,
                description_ar = excluded.description_ar,
                description_en = excluded.description_en,
                icon = excluded.icon,
                category = excluded.category,
                min_points = excluded.min_points
            `).bind(
              b.id,
              b.code || b.id,
              b.title || b.title_ar || '',
              b.titleEn || b.title_en || '',
              b.description || b.description_ar || '',
              b.descriptionEn || b.description_en || '',
              b.icon || '🏅',
              b.category || 'integrity',
              b.requiredPoints || b.min_points || 0,
              b.createdAt || now
            );
          });
          await d1.batch(badgeStatements);
          d1Executed = true;
        }

        // 7. Upsert Campus Greetings
        if (Array.isArray(payload.campusGreetings) && payload.campusGreetings.length > 0) {
          const greetingStatements = payload.campusGreetings.map((g) => {
            return d1.prepare(`
              INSERT INTO campus_greetings (
                id, period, emoji, time_bracket, student_greeting_ar, student_greeting_en,
                admin_greeting_ar, admin_greeting_en, awareness_ar, awareness_en,
                badge_color_class, display_order, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                student_greeting_ar = excluded.student_greeting_ar,
                student_greeting_en = excluded.student_greeting_en,
                admin_greeting_ar = excluded.admin_greeting_ar,
                admin_greeting_en = excluded.admin_greeting_en,
                awareness_ar = excluded.awareness_ar,
                awareness_en = excluded.awareness_en,
                badge_color_class = excluded.badge_color_class,
                updated_at = excluded.updated_at
            `).bind(
              g.id,
              g.period,
              g.emoji,
              g.timeBracket || g.time_bracket || '',
              g.studentGreetingAr || g.student_greeting_ar || '',
              g.studentGreetingEn || g.student_greeting_en || '',
              g.adminGreetingAr || g.admin_greeting_ar || '',
              g.adminGreetingEn || g.admin_greeting_en || '',
              g.awarenessAr || g.awareness_ar || '',
              g.awarenessEn || g.awareness_en || '',
              g.badgeColorClass || g.badge_color_class || '',
              g.displayOrder || g.display_order || 1,
              now,
              now
            );
          });
          await d1.batch(greetingStatements);
          d1Executed = true;
        }

        // 8. Upsert Activity Submissions
        if (Array.isArray(payload.activitySubmissions) && payload.activitySubmissions.length > 0) {
          const actStatements = payload.activitySubmissions.map((act) => {
            return d1.prepare(`
              INSERT INTO activity_submissions (
                id, user_id, user_name, activity_id, status, points_awarded,
                location_id, notes, audio_base64, audio_duration, user_grade,
                submitted_at, reviewed_at, reviewed_by
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                points_awarded = excluded.points_awarded,
                audio_base64 = excluded.audio_base64,
                audio_duration = excluded.audio_duration,
                reviewed_at = excluded.reviewed_at,
                reviewed_by = excluded.reviewed_by
            `).bind(
              act.id,
              act.userId || 'unknown',
              act.userName || 'طالب مجهول',
              act.activityId,
              act.status || 'pending',
              act.pointsAwarded || 0,
              act.locationId || null,
              act.notes || null,
              act.audioBase64 || null,
              act.audioDuration || null,
              act.userGrade || null,
              act.submittedAt || now,
              act.reviewedAt || null,
              act.reviewedBy || null
            );
          });
          await d1.batch(actStatements);
          d1Executed = true;
        }

      } catch (d1Err) {
        console.warn('Cloudflare D1 batch write error, updating edge store:', d1Err);
      }
    }

    // Edge Memory fallback
    if (Array.isArray(payload.items)) {
      const existingItemMap = new Map(edgeMemoryStore.items.map((i) => [i.id, i]));
      payload.items.forEach((item) => {
        existingItemMap.set(item.id, { ...existingItemMap.get(item.id), ...item });
      });
      edgeMemoryStore.items = Array.from(existingItemMap.values());
    }
    if (Array.isArray(payload.claims)) {
      const existingClaimMap = new Map(edgeMemoryStore.claims.map((c) => [c.id, c]));
      payload.claims.forEach((claim) => {
        existingClaimMap.set(claim.id, { ...existingClaimMap.get(claim.id), ...claim });
      });
      edgeMemoryStore.claims = Array.from(existingClaimMap.values());
    }
    if (Array.isArray(payload.users)) {
      const existingUserMap = new Map(edgeMemoryStore.users.map((u) => [u.id, u]));
      payload.users.forEach((u) => {
        existingUserMap.set(u.id, { ...existingUserMap.get(u.id), ...u });
      });
      edgeMemoryStore.users = Array.from(existingUserMap.values());
    }
    if (Array.isArray(payload.badges)) {
      const existingBadgeMap = new Map(edgeMemoryStore.badges.map((b) => [b.id, b]));
      payload.badges.forEach((b) => {
        existingBadgeMap.set(b.id, { ...existingBadgeMap.get(b.id), ...b });
      });
      edgeMemoryStore.badges = Array.from(existingBadgeMap.values());
    }
    if (Array.isArray(payload.campusGreetings)) {
      const existingGreetMap = new Map(edgeMemoryStore.campusGreetings.map((g) => [g.id, g]));
      payload.campusGreetings.forEach((g) => {
        existingGreetMap.set(g.id, { ...existingGreetMap.get(g.id), ...g });
      });
      edgeMemoryStore.campusGreetings = Array.from(existingGreetMap.values());
    }
    if (Array.isArray(payload.activitySubmissions)) {
      const existingActMap = new Map(edgeMemoryStore.activitySubmissions.map((a) => [a.id, a]));
      payload.activitySubmissions.forEach((act) => {
        existingActMap.set(act.id, { ...existingActMap.get(act.id), ...act });
      });
      edgeMemoryStore.activitySubmissions = Array.from(existingActMap.values());
    }
    edgeMemoryStore.lastSyncedAt = now;

    return NextResponse.json({
      success: true,
      provider: d1Executed ? 'cloudflare_d1_native' : 'cloudflare_edge_hybrid',
      syncedAt: now,
      itemsCount: payload.items?.length ?? 0,
      claimsCount: payload.claims?.length ?? 0,
      usersCount: payload.users?.length ?? 0,
      activitiesCount: payload.activitySubmissions?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Sync write failed',
        syncedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity') || 'item';
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'المعرّف مطلوب للحذف' }, { status: 400 });
    }

    // @ts-ignore
    const d1 = (globalThis as any).env?.DB || (process.env as any).DB;

    if (d1 && typeof d1.prepare === 'function') {
      if (entity === 'item') {
        await d1.prepare('DELETE FROM items WHERE id = ?').bind(id).run();
        // cascade claims in case FK not enabled
        await d1.prepare('DELETE FROM claims WHERE item_id = ?').bind(id).run();
      } else if (entity === 'claim') {
        await d1.prepare('DELETE FROM claims WHERE id = ?').bind(id).run();
      }
    }

    if (entity === 'item') {
      edgeMemoryStore.items = edgeMemoryStore.items.filter((i) => i.id !== id);
      edgeMemoryStore.claims = edgeMemoryStore.claims.filter((c) => c.itemId !== id);
    } else if (entity === 'claim') {
      edgeMemoryStore.claims = edgeMemoryStore.claims.filter((c) => c.id !== id);
    }

    return NextResponse.json({
      success: true,
      message: `تم حذف ${entity} بنجاح من Cloudflare D1`,
      deletedId: id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Delete failed',
      },
      { status: 500 }
    );
  }
}
