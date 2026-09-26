import assert from 'node:assert/strict';
import test from 'node:test';

// 1. Test Validation Schemas
import {
  ItemCreateSchema,
  ClaimCreateSchema,
  HandoverVerifySchema,
} from '../src/lib/validation/schemas';

// 2. Test State Machine
import {
  validateItemTransition,
  validateClaimTransition,
  canTransitionItem,
} from '../src/lib/state/machine';
import { StateTransitionError } from '../src/lib/errors/AppError';

// 3. Test Permissions
import {
  canAccessAdmin,
  assertAdmin,
  sanitizeItemForViewer,
} from '../src/lib/auth/permissions';
import { AuthorizationError } from '../src/lib/errors/AppError';

// 4. Test Matching Engine
import { calculateMatchScore, findMatchesForItem } from '../src/lib/matching';

// 5. Test Handover & Attempt Limit
import { HandoverService } from '../src/services/handoverService';
import { RateLimitError } from '../src/lib/errors/AppError';

// 6. Test Demo Data
import { DEMO_USERS, INITIAL_SEED_ITEMS } from '../src/lib/constants';

test('1. VALIDATION: ItemCreateSchema validates correctly', () => {
  const validItem = {
    title: 'سماعات بلوتوث سوداء',
    type: 'lost',
    category: 'electronics',
    locationId: 'science_lab',
    date: '2026-08-29T18:00:00.000Z',
    color: 'أسود',
    description: 'سماعات داخل علبتها الأصلية',
  };

  const parsed = ItemCreateSchema.safeParse(validItem);
  assert.equal(parsed.success, true);

  // Short title must fail
  const invalidShort = { ...validItem, title: 'a' };
  const shortParsed = ItemCreateSchema.safeParse(invalidShort);
  assert.equal(shortParsed.success, false);

  // Invalid date format must fail
  const invalidDate = { ...validItem, date: 'invalid-date' };
  const dateParsed = ItemCreateSchema.safeParse(invalidDate);
  assert.equal(dateParsed.success, false);
});

test('2. VALIDATION: HandoverVerifySchema requires 4 digits', () => {
  assert.equal(HandoverVerifySchema.safeParse({ claimId: 'c1', pin: '4826' }).success, true);
  assert.equal(HandoverVerifySchema.safeParse({ claimId: 'c1', pin: '123' }).success, false);
  assert.equal(HandoverVerifySchema.safeParse({ claimId: 'c1', pin: 'abcd' }).success, false);
  assert.equal(HandoverVerifySchema.safeParse({ claimId: 'c1', pin: '12345' }).success, false);
});

test('3. STATE MACHINE: Enforces legal lifecycle transitions', () => {
  assert.equal(canTransitionItem('open', 'claimed'), true);
  assert.equal(canTransitionItem('claimed', 'reunited'), true);
  assert.equal(canTransitionItem('reunited', 'open'), false);

  assert.throws(() => validateItemTransition('reunited', 'claimed'), StateTransitionError);
});

test('4. AUTHORIZATION: Student cannot access admin features', () => {
  const student = DEMO_USERS[0]; // Malak (role: student)
  const admin = DEMO_USERS[1]; // Moshira (role: admin)

  assert.equal(canAccessAdmin(student), false);
  assert.equal(canAccessAdmin(admin), true);

  assert.throws(() => assertAdmin(student), AuthorizationError);
  assert.doesNotThrow(() => assertAdmin(admin));
});

test('5. DATA PRIVACY: sanitizeItemForViewer strips secret answer from public view', () => {
  const student = DEMO_USERS[0];
  const foundItem = INITIAL_SEED_ITEMS[1]; // Found calculator with secretAnswer

  assert.ok(foundItem.secretAnswer, 'Original has secretAnswer');

  const sanitizedForStudent = sanitizeItemForViewer(foundItem, student);
  assert.equal(sanitizedForStudent.secretAnswer, undefined, 'Secret answer must be stripped for public student');

  const sanitizedForAdmin = sanitizeItemForViewer(foundItem, DEMO_USERS[1]);
  assert.equal(sanitizedForAdmin.secretAnswer, foundItem.secretAnswer, 'Admin retains access to secret answer');
});

test('6. MATCHING ENGINE: Calculates expected high match for Malak Calculator', () => {
  const malakLostCalc = INITIAL_SEED_ITEMS[0];
  const matchingFoundCalc = INITIAL_SEED_ITEMS[1];

  const breakdown = calculateMatchScore(malakLostCalc, matchingFoundCalc);
  assert.equal(breakdown.totalScore, 88, 'Score should be 88%');
  assert.equal(breakdown.categoryScore, 35);
  assert.equal(breakdown.locationScore, 30);
  assert.equal(breakdown.featuresScore, 13);
});

test('7. HANDOVER: Enforces correct PIN and rate limits incorrect attempts', () => {
  const testClaim = {
    id: 'test_claim_rate_limit',
    itemId: 'test_item_1',
    claimant: DEMO_USERS[0],
    answerText: 'إجابة تجريبية',
    status: 'approved' as const,
    handoverPin: '4826',
    createdAt: '2026-08-29T18:00:00.000Z',
  };

  const testItem = {
    ...INITIAL_SEED_ITEMS[1],
    id: 'test_item_1',
    status: 'claimed' as const,
  };

  // Wrong PIN attempts (MAX_PIN_ATTEMPTS = 3)
  const first = HandoverService.completeHandover(testClaim.id, '0000', testClaim, testItem);
  assert.equal(first.success, false);
  assert.ok(first.message.includes('2 محاولات'));

  const second = HandoverService.completeHandover(testClaim.id, '0000', testClaim, testItem);
  assert.equal(second.success, false);
  assert.ok(second.message.includes('محاولة واحدة'));

  // 3rd wrong attempt reaches limit
  const third = HandoverService.completeHandover(testClaim.id, '0000', testClaim, testItem);
  assert.equal(third.success, false);
  assert.ok(third.message.includes('تم استنفاد عدد المحاولات المسموحة'));

  // 4th attempt is blocked by RateLimitError
  assert.throws(
    () => HandoverService.completeHandover(testClaim.id, '4826', testClaim, testItem),
    RateLimitError
  );
});

test('8. PRIVACY & MASKING: Student ID masking and public reporter labels', async () => {
  const { maskStudentId, getPublicReporterLabel } = await import('../src/lib/utils');

  assert.equal(maskStudentId('4826'), '••26');
  assert.equal(maskStudentId('102938'), '••••38');
  assert.equal(maskStudentId(''), '');

  assert.equal(getPublicReporterLabel('student', true), 'طالبة في المدرسة');
  assert.equal(getPublicReporterLabel('student', false), 'أحد الطلاب (أمانة)');
  assert.equal(getPublicReporterLabel('admin', false), 'أمانات إدارة المدرسة');
  assert.equal(getPublicReporterLabel('student', false, 'at_office'), 'أمانات إدارة المدرسة');
});

