import { 
  IntegrityScenario, 
  IntegrityAttempt, 
  TrustTier 
} from '@/types';
import { 
  INTEGRITY_COOLDOWN_MS, 
  INTEGRITY_PASSING_THRESHOLD, 
  INTEGRITY_AWARD_POINTS 
} from '@/lib/constants';

export interface EvaluationResult {
  scorePercentage: number;
  isPassed: boolean;
  pointsToAward: number;
  questionResults: Record<string, {
    selectedOptionId: string;
    score: number;
    feedback: string;
    whyWrong?: string;
    correctActionText?: string;
  }>;
}

export interface ScenarioStatus {
  canAttempt: boolean;
  reason?: 'passed_already' | 'in_cooldown';
  isPassed: boolean;
  cooldownRemainingMs?: number;
  cooldownUntil?: string;
  lastScore?: number;
}

export class IntegrityService {
  /**
   * Evaluates student answers against a scenario's questions.
   * Calculates overall percentage. Requires >= 90% to pass.
   */
  static evaluateAttempt(
    scenario: IntegrityScenario,
    answers: Record<string, string>
  ): EvaluationResult {
    let totalScore = 0;
    const maxPossibleScore = scenario.questions.length * 100;
    const questionResults: EvaluationResult['questionResults'] = {};

    for (const question of scenario.questions) {
      let selectedOptionId = answers[question.id];
      if (!selectedOptionId) {
        // Fallback: check if any answer value corresponds to an option ID in this question
        const foundVal = Object.values(answers).find((val) =>
          question.options.some((opt) => opt.id === val)
        );
        if (foundVal) selectedOptionId = foundVal;
      }

      const option = question.options.find((opt) => opt.id === selectedOptionId);

      if (option) {
        totalScore += option.score;
        questionResults[question.id] = {
          selectedOptionId: option.id,
          score: option.score,
          feedback: option.feedback,
          whyWrong: option.whyWrong,
          correctActionText: option.correctActionText,
        };
      } else {
        questionResults[question.id] = {
          selectedOptionId: '',
          score: 0,
          feedback: 'لم يتم اختيار إجابة لهذا السؤال.',
        };
      }
    }

    const rawPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const scorePercentage = Math.round(rawPercentage);
    const isPassed = scorePercentage >= INTEGRITY_PASSING_THRESHOLD;
    const pointsToAward = isPassed ? (scenario.pointsAwarded || INTEGRITY_AWARD_POINTS) : 0;

    return {
      scorePercentage,
      isPassed,
      pointsToAward,
      questionResults,
    };
  }

  /**
   * Directly evaluates a single chosen decision option for quick interactive judgment.
   */
  static evaluateSingleDecision(
    scenario: IntegrityScenario,
    selectedOptionId: string
  ): EvaluationResult {
    const question = scenario.questions[0];
    const option =
      question?.options.find((opt) => opt.id === selectedOptionId) ||
      scenario.questions.flatMap((q) => q.options).find((opt) => opt.id === selectedOptionId);

    if (!option) {
      return {
        scorePercentage: 0,
        isPassed: false,
        pointsToAward: 0,
        questionResults: {
          [question?.id || 'decision']: {
            selectedOptionId: '',
            score: 0,
            feedback: 'لم يتم العثور على الخيار المحدد.',
          },
        },
      };
    }

    const scorePercentage = option.score;
    const isPassed = scorePercentage >= INTEGRITY_PASSING_THRESHOLD;
    const pointsToAward = isPassed ? (scenario.pointsAwarded || INTEGRITY_AWARD_POINTS) : 0;

    return {
      scorePercentage,
      isPassed,
      pointsToAward,
      questionResults: {
        [question?.id || 'decision']: {
          selectedOptionId: option.id,
          score: option.score,
          feedback: option.feedback,
          whyWrong: option.whyWrong,
          correctActionText: option.correctActionText,
        },
      },
    };
  }


  /**
   * Checks whether a student can attempt a scenario, or is blocked by cooldown / prior pass.
   */
  static getScenarioStatus(
    studentId: string,
    scenarioId: string,
    attempts: IntegrityAttempt[],
    now: number = Date.now()
  ): ScenarioStatus {
    const studentAttempts = attempts.filter(
      (a) => a.studentId === studentId && a.scenarioId === scenarioId
    );

    // If passed already, points are once-in-a-lifetime
    const passedAttempt = studentAttempts.find((a) => a.isPassed);
    if (passedAttempt) {
      return {
        canAttempt: false,
        reason: 'passed_already',
        isPassed: true,
        lastScore: passedAttempt.scorePercentage,
      };
    }

    if (studentAttempts.length === 0) {
      return {
        canAttempt: true,
        isPassed: false,
      };
    }

    // Sort by latest attempt
    const latestAttempt = [...studentAttempts].sort(
      (a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
    )[0];

    if (latestAttempt.cooldownUntil) {
      const cooldownEnd = new Date(latestAttempt.cooldownUntil).getTime();
      if (cooldownEnd > now) {
        return {
          canAttempt: false,
          reason: 'in_cooldown',
          isPassed: false,
          cooldownRemainingMs: cooldownEnd - now,
          cooldownUntil: latestAttempt.cooldownUntil,
          lastScore: latestAttempt.scorePercentage,
        };
      }
    }

    return {
      canAttempt: true,
      isPassed: false,
      lastScore: latestAttempt.scorePercentage,
    };
  }

  /**
   * Creates an attempt record with appropriate cooldown if failed.
   */
  static createAttemptRecord(
    studentId: string,
    scenarioId: string,
    scorePercentage: number,
    isPassed: boolean,
    answers: Record<string, string>,
    nowDate: Date = new Date()
  ): IntegrityAttempt {
    const attemptedAt = nowDate.toISOString();
    let cooldownUntil: string | undefined = undefined;

    // If failed (<90%), enforce 24-hour cooldown
    if (!isPassed) {
      cooldownUntil = new Date(nowDate.getTime() + INTEGRITY_COOLDOWN_MS).toISOString();
    }

    return {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId,
      scenarioId,
      scorePercentage,
      isPassed,
      attemptedAt,
      cooldownUntil,
      answers,
    };
  }

  /**
   * Calculates the student's trust tier based on total goodwill & integrity points.
   * Tier 1: Bronze (0 - 99 pts)
   * Tier 2: Silver (100 - 199 pts)
   * Tier 3: Gold (200+ pts)
   */
  static calculateTrustTier(goodwillPoints: number): TrustTier {
    if (goodwillPoints >= 200) return 'gold';
    if (goodwillPoints >= 100) return 'silver';
    return 'bronze';
  }

  /**
   * Metadata and display labels for Trust Tiers.
   */
  static getTrustTierInfo(tier: TrustTier) {
    switch (tier) {
      case 'gold':
        return {
          tier,
          label: 'سفير النزاهة الذهبي',
          shortLabel: 'سفير ذهبي 🏆',
          color: 'from-amber-500 to-yellow-600',
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconName: 'Crown',
          minPoints: 200,
          description: 'أعلى رتبة موثوقية؛ بلاغاته تحظى بأولوية قصوى لدى الإدارة.',
        };
      case 'silver':
        return {
          tier,
          label: 'سفير النزاهة الفضي',
          shortLabel: 'سفير فضي 🌟',
          color: 'from-emerald-600 to-teal-700',
          textColor: 'text-teal-800',
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-200',
          iconName: 'ShieldCheck',
          minPoints: 100,
          description: 'طالب موثوق أثبت نزاهته في عدة سيناريوهات ومواقف واقعية.',
        };
      case 'bronze':
      default:
        return {
          tier: 'bronze' as TrustTier,
          label: 'عضو نزاهة واعد',
          shortLabel: 'نزاهة واعدة 🛡️',
          color: 'from-slate-600 to-slate-700',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
          iconName: 'Shield',
          minPoints: 0,
          description: 'في بداية رحلة ترسيخ الأمانة والمواطنة المدرسية الرقمية.',
        };
    }
  }
}
