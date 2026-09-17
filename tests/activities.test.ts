import assert from 'node:assert/strict';
import test from 'node:test';
import { 
  SCHOOL_ACTIVITIES, 
  ACTIVITY_BADGES, 
  INITIAL_ACTIVITY_SUBMISSIONS 
} from '../src/lib/constants';
import { 
  getLocalizedActivity, 
  getLocalizedBadge, 
  ACTIVITIES_EN, 
  BADGES_EN 
} from '../src/lib/i18n/seedDataTranslations';
import { TRANSLATIONS } from '../src/lib/i18n/translations';

test('1. ACTIVITIES REGISTRY: 8 Authentic School Quests Configured', () => {
  assert.equal(SCHOOL_ACTIVITIES.length, 8, 'Must have exactly 8 school activities');

  const expectedIds = [
    'act_break_custody',
    'act_lab_assistance',
    'act_library_books',
    'act_eco_clean',
    'act_integrity_ambassador',
    'act_peer_tutoring',
    'act_gym_organization',
    'act_prayer_room_care',
  ];

  for (const expectedId of expectedIds) {
    const act = SCHOOL_ACTIVITIES.find((a) => a.id === expectedId);
    assert.ok(act, `Activity ${expectedId} must exist`);
    assert.ok(act.title && act.title.length > 5, 'Must have descriptive Arabic title');
    assert.ok(act.description && act.description.length > 10, 'Must have descriptive Arabic description');
    assert.ok(act.category, 'Must have valid category');
    assert.ok(act.points >= 15 && act.points <= 50, 'Points must be between 15 and 50');
    assert.ok(['instant', 'supervised'].includes(act.verificationType), 'Verification type must be instant or supervised');
    assert.ok(act.iconName, 'Must have iconName');
    assert.ok(act.estimatedMinutes > 0, 'Estimated minutes must be positive');
  }
});

test('2. BADGES REGISTRY: 4 Distinct Activity Honor Badges Configured', () => {
  assert.equal(ACTIVITY_BADGES.length, 4, 'Must have exactly 4 activity honor badges');

  const expectedBadges = [
    'badge_volunteer_star',
    'badge_lab_guardian',
    'badge_eco_ambassador',
    'badge_integrity_champion',
  ];

  for (const bId of expectedBadges) {
    const badge = ACTIVITY_BADGES.find((b) => b.id === bId);
    assert.ok(badge, `Badge ${bId} must exist`);
    assert.ok(badge.title && badge.title.length > 3, 'Must have title');
    assert.ok(badge.description && badge.description.length > 5, 'Must have description');
    assert.ok(badge.icon && badge.icon.length > 0, 'Must have icon emoji');
    assert.ok(badge.requiredPoints >= 30, 'Required points must be at least 30');
    assert.ok(badge.category, 'Must have matching category');
  }
});

test('3. BILINGUAL TRANSLATION PARITY: English Localizations for Activities & Badges', () => {
  for (const act of SCHOOL_ACTIVITIES) {
    const enAct = getLocalizedActivity(act, 'en');
    assert.ok(enAct.title, `English title must exist for ${act.id}`);
    assert.ok(enAct.description, `English description must exist for ${act.id}`);
    assert.notEqual(enAct.title, act.title, `English title should differ from Arabic title for ${act.id}`);

    const arAct = getLocalizedActivity(act, 'ar');
    assert.equal(arAct.title, act.title);
  }

  for (const badge of ACTIVITY_BADGES) {
    const enBadge = getLocalizedBadge(badge, 'en');
    assert.ok(enBadge.title, `English title must exist for ${badge.id}`);
    assert.ok(enBadge.description, `English description must exist for ${badge.id}`);
    assert.notEqual(enBadge.title, badge.title, `English badge title should differ from Arabic for ${badge.id}`);

    const arBadge = getLocalizedBadge(badge, 'ar');
    assert.equal(arBadge.title, badge.title);
  }
});

test('4. DICTIONARY KEYS: All activities translation keys present in AR and EN dictionaries', () => {
  const requiredKeys = [
    'nav.activities',
    'drawer.activitiesDesc',
    'activities.title',
    'activities.subtitle',
    'activities.tabAll',
    'activities.tabVolunteer',
    'activities.tabIntegrity',
    'activities.tabEnvironment',
    'activities.tabAcademic',
    'activities.pointsReward',
    'activities.statusAvailable',
    'activities.statusPending',
    'activities.statusCompleted',
    'activities.completeInstant',
    'activities.submitSupervised',
    'activities.badgesTitle',
    'activities.badgesDesc',
    'activities.myProgress',
    'activities.completedCount',
    'activities.totalEarnedPoints',
    'activities.modalTitle',
    'activities.modalDesc',
    'activities.notesLabel',
    'activities.notesPlaceholder',
    'activities.locationLabel',
    'activities.confirmSubmit',
    'activities.successToastTitle',
    'activities.successToastDesc',
    'activities.pendingToastDesc',
    'activities.weeklyQuest',
    'activities.activeNow',
    'activities.viewAll',
    'activities.frequencyDaily',
    'activities.frequencyWeekly',
    'activities.minutes',
    'admin.tabActivities',
    'admin.pendingActivitiesTitle',
    'admin.approveActivityBtn',
    'admin.noPendingActivities'
  ];

  for (const key of requiredKeys) {
    assert.ok(TRANSLATIONS.ar[key], `TRANSLATIONS.ar missing key: ${key}`);
    assert.ok(TRANSLATIONS.en[key], `TRANSLATIONS.en missing key: ${key}`);
  }
});

test('5. INITIAL ACTIVITY SEED SUBMISSIONS: Baseline student participation data', () => {
  assert.ok(INITIAL_ACTIVITY_SUBMISSIONS.length >= 2, 'Should have initial seed activity submissions');
  
  for (const sub of INITIAL_ACTIVITY_SUBMISSIONS) {
    assert.ok(sub.id, 'Submission must have id');
    assert.ok(sub.activityId, 'Submission must have activityId');
    assert.ok(sub.userId, 'Submission must have userId');
    assert.ok(sub.userName, 'Submission must have userName');
    assert.ok(sub.userGrade, 'Submission must have userGrade');
    assert.ok(['pending', 'approved', 'rejected'].includes(sub.status), 'Valid status');
    assert.ok(sub.awardedPoints > 0, 'Awarded points must be positive');
  }
});
