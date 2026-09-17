import assert from 'node:assert/strict';
import test from 'node:test';
import { IntegrityService } from '../src/services/integrityService';
import { INTEGRITY_SCENARIOS, INTEGRITY_COOLDOWN_MS, INTEGRITY_PASSING_THRESHOLD } from '../src/lib/constants';

test('1. SCENARIOS REGISTRY: Exactly 5 authentic weekly ethical scenarios configured with 4 options each', () => {
  assert.equal(INTEGRITY_SCENARIOS.length, 5, 'Must have exactly 5 weekly scenarios');

  const expectedIds = [
    'scenario_academic_integrity',
    'scenario_hallway_phone',
    'scenario_cafeteria_change',
    'scenario_computer_lab_damage',
    'scenario_science_lab_calc',
  ];

  for (const expectedId of expectedIds) {
    const scenario = INTEGRITY_SCENARIOS.find((s) => s.id === expectedId);
    assert.ok(scenario, `Scenario ${expectedId} must exist`);
    assert.ok(scenario.title && scenario.title.length > 5, 'Must have descriptive title');
    assert.ok(scenario.topicTitle && scenario.topicTitle.length > 2, 'Must have topicTitle');
    assert.ok(scenario.detailedDilemma && scenario.detailedDilemma.length > 10, 'Must have detailed dilemma');
    assert.ok(scenario.dilemmaQuote && scenario.dilemmaQuote.length > 5, 'Must have dilemmaQuote');
    assert.ok(scenario.cognitiveBasis && scenario.cognitiveBasis.length > 5, 'Must have cognitiveBasis');
    assert.ok(scenario.visualDetails?.locationBadge, 'Must have visualDetails.locationBadge');
    assert.ok(scenario.visualDetails?.roomLabel, 'Must have visualDetails.roomLabel');
    assert.ok(scenario.visualDetails?.promptNote, 'Must have visualDetails.promptNote');
    assert.ok(scenario.locationId, 'Must have valid locationId');
    assert.ok(scenario.badgeName, 'Must have badgeName');
    assert.ok(scenario.duration, 'Must have duration');
    assert.equal(scenario.pointsAwarded, 10, 'Must award 10 points on passing');

    assert.ok(scenario.questions && scenario.questions.length > 0, 'Must have at least 1 dilemma question');
    const primaryQ = scenario.questions[0];
    assert.equal(primaryQ.options.length, 4, `${expectedId} must have exactly 4 decision options`);

    const scores = primaryQ.options.map((o) => o.score).sort((a, b) => b - a);
    assert.deepEqual(scores, [100, 50, 0, 0], `${expectedId} must have [100, 50, 0, 0] score distribution`);

    // Verify whyWrong and correctActionText presence
    for (const opt of primaryQ.options) {
      assert.ok(opt.text && opt.text.length > 0, 'Option must have text');
      assert.ok(opt.feedback && opt.feedback.length > 0, 'Option must have feedback');
      assert.ok(opt.correctActionText && opt.correctActionText.length > 0, 'Option must have correctActionText');
      if (opt.score < 100) {
        assert.ok(opt.whyWrong && opt.whyWrong.length > 0, 'Non-ideal options must explain whyWrong');
      }
    }
  }
});

test('2. DIRECT EVALUATION: Ideal choice (100%) passes and awards 10 points with whyWrong & correctActionText', () => {
  const scenario = INTEGRITY_SCENARIOS[0]; // Academic integrity
  const idealOption = scenario.questions[0].options.find((o) => o.score === 100)!;

  // Single decision evaluation
  const singleResult = IntegrityService.evaluateSingleDecision(scenario, idealOption.id);
  assert.equal(singleResult.scorePercentage, 100);
  assert.equal(singleResult.isPassed, true);
  assert.equal(singleResult.pointsToAward, 10);
  assert.ok(singleResult.questionResults[scenario.questions[0].id]?.feedback);
  assert.equal(singleResult.questionResults[scenario.questions[0].id]?.correctActionText, idealOption.correctActionText);

  // Attempt map evaluation
  const attemptResult = IntegrityService.evaluateAttempt(scenario, {
    [scenario.questions[0].id]: idealOption.id,
  });
  assert.equal(attemptResult.scorePercentage, 100);
  assert.equal(attemptResult.isPassed, true);
  assert.equal(attemptResult.pointsToAward, 10);
});

test('3. DIRECT EVALUATION: Partial (50%) and Wrong (0%) choices fail and award 0 points with whyWrong feedback', () => {
  const scenario = INTEGRITY_SCENARIOS[2]; // Cafeteria change
  const partialOption = scenario.questions[0].options.find((o) => o.score === 50)!;
  const wrongOption = scenario.questions[0].options.find((o) => o.score === 0)!;

  const partialResult = IntegrityService.evaluateSingleDecision(scenario, partialOption.id);
  assert.equal(partialResult.scorePercentage, 50);
  assert.equal(partialResult.isPassed, false);
  assert.equal(partialResult.pointsToAward, 0);
  assert.equal(partialResult.questionResults[scenario.questions[0].id]?.whyWrong, partialOption.whyWrong);

  const wrongResult = IntegrityService.evaluateSingleDecision(scenario, wrongOption.id);
  assert.equal(wrongResult.scorePercentage, 0);
  assert.equal(wrongResult.isPassed, false);
  assert.equal(wrongResult.pointsToAward, 0);
  assert.equal(wrongResult.questionResults[scenario.questions[0].id]?.whyWrong, wrongOption.whyWrong);
});

test('4. COOLDOWN CREATION: Sub-90% sets 24h cooldown timer', () => {
  const baseTime = new Date('2026-09-15T12:00:00.000Z');
  const attempt = IntegrityService.createAttemptRecord(
    'student_1',
    'scenario_science_lab_calc',
    50,
    false,
    { calc_q1: 'calc_opt_2' },
    baseTime
  );

  assert.ok(attempt.cooldownUntil, 'cooldownUntil must be defined');
  const expectedCooldown = new Date(baseTime.getTime() + INTEGRITY_COOLDOWN_MS).toISOString();
  assert.equal(attempt.cooldownUntil, expectedCooldown);
  assert.equal(attempt.isPassed, false);
});

test('5. COOLDOWN CHECK: Enforces lock while cooldown is active and unlocks when expired', () => {
  const baseTime = new Date('2026-09-15T12:00:00.000Z');
  const attempt = IntegrityService.createAttemptRecord(
    'student_1',
    'scenario_science_lab_calc',
    50,
    false,
    {},
    baseTime
  );

  // 1 hour later (should still be locked)
  const oneHourLater = baseTime.getTime() + 60 * 60 * 1000;
  const statusActive = IntegrityService.getScenarioStatus(
    'student_1',
    'scenario_science_lab_calc',
    [attempt],
    oneHourLater
  );

  assert.equal(statusActive.canAttempt, false);
  assert.equal(statusActive.reason, 'in_cooldown');
  assert.ok(statusActive.cooldownRemainingMs && statusActive.cooldownRemainingMs > 0);

  // 25 hours later (cooldown expired)
  const twentyFiveHoursLater = baseTime.getTime() + 25 * 60 * 60 * 1000;
  const statusExpired = IntegrityService.getScenarioStatus(
    'student_1',
    'scenario_science_lab_calc',
    [attempt],
    twentyFiveHoursLater
  );

  assert.equal(statusExpired.canAttempt, true);
});

test('6. ANTI-SPAM: Passed scenarios cannot be retaken for points (Once in lifetime)', () => {
  const passedAttempt = {
    id: 'att_passed',
    studentId: 'student_1',
    scenarioId: 'scenario_science_lab_calc',
    scorePercentage: 100,
    isPassed: true,
    attemptedAt: new Date().toISOString(),
    answers: {},
  };

  const status = IntegrityService.getScenarioStatus(
    'student_1',
    'scenario_science_lab_calc',
    [passedAttempt]
  );

  assert.equal(status.canAttempt, false);
  assert.equal(status.reason, 'passed_already');
  assert.equal(status.isPassed, true);
});

test('7. TRUST TIERS: Calculates correct bronze, silver, and gold tiers', () => {
  assert.equal(IntegrityService.calculateTrustTier(0), 'bronze');
  assert.equal(IntegrityService.calculateTrustTier(90), 'bronze');
  assert.equal(IntegrityService.calculateTrustTier(100), 'silver');
  assert.equal(IntegrityService.calculateTrustTier(190), 'silver');
  assert.equal(IntegrityService.calculateTrustTier(200), 'gold');
  assert.equal(IntegrityService.calculateTrustTier(550), 'gold');

  const goldInfo = IntegrityService.getTrustTierInfo('gold');
  assert.equal(goldInfo.tier, 'gold');
  assert.ok(goldInfo.label.includes('الذهبي'));

  const silverInfo = IntegrityService.getTrustTierInfo('silver');
  assert.equal(silverInfo.tier, 'silver');
  assert.ok(silverInfo.label.includes('الفضي'));
});

test('8. INTEGRITY COVERAGE: Evaluates each of the 5 weekly scenarios independently', () => {
  for (const scenario of INTEGRITY_SCENARIOS) {
    const idealOption = scenario.questions[0].options.find((o) => o.score === 100)!;
    const result = IntegrityService.evaluateSingleDecision(scenario, idealOption.id);
    assert.equal(result.isPassed, true, `Scenario ${scenario.id} ideal option must pass`);
    assert.equal(result.pointsToAward, 10);
  }
});

test('9. EDGE CASES: Unknown option ID returns 0% score and failure safely', () => {
  const scenario = INTEGRITY_SCENARIOS[0];
  const result = IntegrityService.evaluateSingleDecision(scenario, 'non_existent_option');
  assert.equal(result.isPassed, false);
  assert.equal(result.scorePercentage, 0);
  assert.equal(result.pointsToAward, 0);

  const attemptResult = IntegrityService.evaluateAttempt(scenario, {
    [scenario.questions[0].id]: 'non_existent_option',
  });
  assert.equal(attemptResult.isPassed, false);
  assert.equal(attemptResult.scorePercentage, 0);
});

test('10. SCENARIO STATUS: Empty attempts list allows attempt', () => {
  const status = IntegrityService.getScenarioStatus('student_unknown', 'scenario_science_lab_calc', []);
  assert.equal(status.canAttempt, true);
  assert.equal(status.isPassed, false);
});


