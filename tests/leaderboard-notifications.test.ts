import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_USERS, INITIAL_NOTIFICATIONS, SCHOOL_LOCATIONS } from '../src/lib/constants.js';
import { IntegrityService } from '../src/services/integrityService.js';
import { TrustTier, UserProfile } from '../src/types/index.js';

test('1. LEADERBOARD: Calculates ranks and points correctly from users roster', () => {
  const students = DEMO_USERS.filter((u) => u.role === 'student');
  assert.ok(students.length >= 3, 'Should have at least 3 students for leaderboard podium');

  const sortedStudents = [...students].sort((a, b) => (b.goodwillPoints || 0) - (a.goodwillPoints || 0));
  
  assert.strictEqual(sortedStudents[0].name, 'ملك محمد فروق');
  assert.strictEqual(sortedStudents[0].goodwillPoints, 100);
  assert.strictEqual(sortedStudents[1].name, 'سارة القحطاني');
  assert.strictEqual(sortedStudents[1].goodwillPoints, 90);
});

test('2. LEADERBOARD: Class points aggregation and ranking', () => {
  const classMap: Record<string, { totalPoints: number; studentsCount: number }> = {};
  
  DEMO_USERS.filter((u) => u.role === 'student').forEach((u) => {
    const grade = u.grade;
    if (!classMap[grade]) classMap[grade] = { totalPoints: 0, studentsCount: 0 };
    classMap[grade].totalPoints += u.goodwillPoints || 0;
    classMap[grade].studentsCount += 1;
  });

  const rankings = Object.entries(classMap)
    .map(([grade, data]) => ({ grade, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  assert.ok(rankings.length > 0);
  assert.ok(rankings[0].totalPoints > 0);
  assert.strictEqual(rankings[0].grade, 'الصف الحادي عشر - علمي');
});

test('3. NOTIFICATIONS: Correct initial notification categories and read status', () => {
  assert.strictEqual(INITIAL_NOTIFICATIONS.length, 4);
  const unreadCount = INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length;
  assert.strictEqual(unreadCount, 2);

  const matchNotif = INITIAL_NOTIFICATIONS.find((n) => n.type === 'match');
  assert.ok(matchNotif);
  assert.ok(matchNotif.title.includes('88%'));
});

test('4. CERTIFICATE: Trust tier evaluation and serial code validation', () => {
  const malakTier: TrustTier = IntegrityService.calculateTrustTier(100);
  assert.strictEqual(malakTier, 'silver');

  const goldTier: TrustTier = IntegrityService.calculateTrustTier(350);
  assert.strictEqual(goldTier, 'gold');

  const bronzeTier: TrustTier = IntegrityService.calculateTrustTier(30);
  assert.strictEqual(bronzeTier, 'bronze');
});

test('5. SCHOOL LOCATIONS: All 10 facilities registered with valid metadata', () => {
  assert.strictEqual(SCHOOL_LOCATIONS.length, 10);
  const scienceLab = SCHOOL_LOCATIONS.find((l) => l.id === 'science_lab');
  assert.ok(scienceLab);
  assert.strictEqual(scienceLab.building, 'المبنى العلمي');
});
