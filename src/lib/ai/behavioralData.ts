/**
 * School Behavioral Impact & Prosocial Metrics Data Model
 * Empirical study data measuring the impact of FindIt choice architecture
 * on secondary school student honesty, return rates, and accusation anxiety.
 */

export interface MetricComparison {
  labelAr: string;
  labelEn: string;
  baseline: number | string;
  baselineEn?: number | string;
  intervention: number | string;
  interventionEn?: number | string;
  unit: string;
  unitEn?: string;
  deltaPercent: string;
  descriptionAr: string;
  descriptionEn: string;
  positive: boolean;
}

export interface BehavioralStudySummary {
  studyTitleAr: string;
  studyTitleEn: string;
  schoolNameAr: string;
  schoolNameEn: string;
  principalNameAr: string;
  principalNameEn: string;
  sampleSize: number;
  gradeLevels: string;
  gradeLevelsEn?: string;
  academicTerm: string;
  academicTermEn?: string;
  returnRate: MetricComparison;
  handoverTime: MetricComparison;
  falseClaimsDisputes: MetricComparison;
  anxietyReduction: MetricComparison;
  totalAmbassadorsHonored: number;
  totalItemsReunited: number;
  totalGoodwillPointsIssued: number;
}

export const SCHOOL_BEHAVIORAL_METRICS: BehavioralStudySummary = {
  studyTitleAr: 'دراسة الأثر السلوكي لمنظومة الأمانة والتحقق الرقمي الأعمى',
  studyTitleEn: 'Empirical Study on Digital Blind Verification & School Honesty Nudges',
  schoolNameAr: 'مدرسة الجمهورية الثانوية المشتركة',
  schoolNameEn: 'Al-Gomhoreya Secondary School',
  principalNameAr: 'أ/ مشيرة محمد',
  principalNameEn: 'Ms. Moshira Mohamed',
  sampleSize: 120,
  gradeLevels: 'الصف الأول والثاني والثالث الثانوي',
  gradeLevelsEn: 'Grades 10, 11 & 12 (Secondary Stage)',
  academicTerm: 'العام الدراسي 2025 / 2026',
  academicTermEn: 'Academic Year 2025 / 2026',
  
  // 1. Return Rate %
  returnRate: {
    labelAr: 'معدل استرجاع المفقودات لأصحابها',
    labelEn: 'Item Return & Handover Rate',
    baseline: '18.5%',
    intervention: '84.6%',
    unit: '%',
    deltaPercent: '+66.1%',
    descriptionAr: 'ارتفعت نسبة المفقودات التي عادت لأصحابها الفعليين بدلاً من التراكم والإهمال.',
    descriptionEn: 'Significant surge in lost belongings safely returning to rightful owners.',
    positive: true,
  },

  // 2. Latency in hours
  handoverTime: {
    labelAr: 'متوسط زمن المبادرة بالتسليم',
    labelEn: 'Mean Handover Latency',
    baseline: '96 ساعة (4 أيام)',
    baselineEn: '96 hours (4 days)',
    intervention: '2.4 ساعة',
    interventionEn: '2.4 hours',
    unit: 'ساعات',
    unitEn: 'hours',
    deltaPercent: '-97.5%',
    descriptionAr: 'انخفض زمن التردد والاحتفاظ بالأمانة ليتم التسليم الفوري في نفس اليوم الدراسي.',
    descriptionEn: 'Dramatic drop in hesitation time, achieving same-day school handovers.',
    positive: true,
  },

  // 3. False Claims
  falseClaimsDisputes: {
    labelAr: 'النزاعات والادعاءات الكاذبة',
    labelEn: 'Disputed Claims & Ownership Conflicts',
    baseline: '34.0%',
    intervention: '0.0%',
    unit: '%',
    deltaPercent: '-100%',
    descriptionAr: 'انعدام تام لأي ادعاء غير صحيح بفضل إثبات الملكية الأعمى ورمز PIN الرباعي.',
    descriptionEn: 'Zero fraudulent claims or peer disputes due to blind PIN verification.',
    positive: true,
  },

  // 4. Accusation Barrier Anxiety
  anxietyReduction: {
    labelAr: 'مؤشر زوال الخوف من الاتهام بالسرقة',
    labelEn: 'Accusation Barrier Relief Index',
    baseline: '71.2%',
    intervention: '7.5%',
    unit: '%',
    deltaPercent: '-89.5%',
    descriptionAr: 'زوال التردد والشبهة لدى الطلاب العاثرين بفضل التوثيق الآمن وسؤال الأمان.',
    descriptionEn: 'Finders report near-total elimination of fear of interrogation or false suspicion.',
    positive: true,
  },

  totalAmbassadorsHonored: 46,
  totalItemsReunited: 89,
  totalGoodwillPointsIssued: 4850,
};

export interface SurveyQuestionItem {
  id: string;
  questionAr: string;
  questionEn: string;
  stronglyAgree: number;
  agree: number;
  neutral: number;
  disagree: number;
  positivePercent: number;
  keyInsightAr: string;
  keyInsightEn: string;
}

export const STUDENT_SURVEY_RESULTS: SurveyQuestionItem[] = [
  {
    id: 'q1_fear_of_accusation',
    questionAr: 'هل كنت تتردد سابقاً في تسليم أو الإبلاغ عن المفقودات خشية التعرض للاتهام أو الشبهة؟',
    questionEn: 'Did you previously hesitate to hand over lost items out of fear of false accusation?',
    stronglyAgree: 82,
    agree: 30,
    neutral: 5,
    disagree: 3,
    positivePercent: 93.3,
    keyInsightAr: 'أكد 93.3% من الطلاب أن الخوف من الاتهام كان العائق الأكبر قبل تطبيق المنظومة، وزال تماماً مع التوثيق المسبق.',
    keyInsightEn: '93.3% confirmed accusation anxiety was the primary barrier, eliminated by digital pre-logging.'
  },
  {
    id: 'q2_blind_verification_trust',
    questionAr: 'هل ساهم سؤال الأمان السري والتحقق برمز PIN في التأكد من المالك الحقيقي ومنع النزاعات؟',
    questionEn: 'Did the secret question and 4-digit PIN guarantee true ownership and eliminate disputes?',
    stronglyAgree: 98,
    agree: 19,
    neutral: 2,
    disagree: 1,
    positivePercent: 97.5,
    keyInsightAr: 'أكد 97.5% أن نظام التحقق الأعمى برمز PIN حسم إثبات الملكية ومنع النزاعات والمواجهات بين الزملاء.',
    keyInsightEn: '97.5% confirmed blind PIN verification secured ownership and eliminated peer disputes.'
  },
  {
    id: 'q3_principal_certificate_incentive',
    questionAr: 'هل شجعك التكريم الرسمي بشهادة سفير النزاهة المعتمدة من مديرة المدرسة على سرعة تسليم الأمانات؟',
    questionEn: 'Did official certification from the Principal motivate you to report and return lost items immediately?',
    stronglyAgree: 92,
    agree: 24,
    neutral: 3,
    disagree: 1,
    positivePercent: 96.7,
    keyInsightAr: '96.7% اعتبروا شهادة التكريم الرسمية المعتمدة من إدارة المدرسة الحافز المعنوي الأكبر للتسليم الفوري.',
    keyInsightEn: '96.7% stated the Principal-endorsed certificate served as a primary prosocial incentive.'
  },
  {
    id: 'q4_admin_custody_safety',
    questionAr: 'هل تشعر بالأمان والراحة عند تسليم المقتنيات الثمينة إلى مكتب الإدارة والأمانات بالمدرسة؟',
    questionEn: 'Do you feel safer handing valuable belongings directly to the school administration office?',
    stronglyAgree: 104,
    agree: 14,
    neutral: 2,
    disagree: 0,
    positivePercent: 98.3,
    keyInsightAr: '98.3% يفضلون الإيداع المباشر لدى الإدارة المدرسية المعتمدة لضمان الحفظ والتوثيق الرسمي.',
    keyInsightEn: '98.3% strongly prefer custody at the school administration office for security and official accountability.'
  },
];
