import { MoralDilemma, MoralUserChoice, IntegrityReport } from '@/types/moral';

export const MORAL_DILEMMAS: MoralDilemma[] = [
  {
    id: 1,
    title: 'الغش الأكاديمي',
    video_desc: 'الدكتور ساب اللجنة. صاحبك بيطلع ورقة وبيقولك ساعدني',
    theory: 'العلاج المعرفي السلوكي CBT - آرون بيك',
    options: [
      {
        text: 'أساعده عشان صاحبي',
        analysis: 'السبب: ولاء زائف. البديل: النزاهة أهم من الصداقة المؤقتة',
        reason: 'ولاء زائف',
        alternative: 'النزاهة أهم من الصداقة المؤقتة',
        integrityScoreDelta: -10,
        isBestChoice: false,
      },
      {
        text: 'أعمل نفسي مش شايف',
        analysis: 'السبب: تجنب المسؤولية. البديل: المواجهة الإيجابية',
        reason: 'تجنب المسؤولية',
        alternative: 'المواجهة الإيجابية',
        integrityScoreDelta: 0,
        isBestChoice: false,
      },
      {
        text: 'أبلغ المراقب',
        analysis: 'السبب: عدالة إجرائية. ممتاز',
        reason: 'عدالة إجرائية',
        alternative: 'حماية معايير العدالة والمساواة',
        integrityScoreDelta: +8,
        isBestChoice: false,
      },
      {
        text: 'أقوله ده غلط وهنشيل ذنب سوا',
        analysis: 'السبب: شجاعة أخلاقية. هذا هو الأفضل',
        reason: 'شجاعة أخلاقية ونصح مباشر',
        alternative: 'هذا هو التصرف الأمثل',
        integrityScoreDelta: +10,
        isBestChoice: true,
      },
    ],
  },
  {
    id: 2,
    title: 'واسطة الشغل',
    video_desc: 'باباكي بيكلم حد في الشركة عشان يشغلك بواسطة',
    theory: 'نظرية اتخاذ القرار الأخلاقي - جيمس ريست',
    options: [
      {
        text: 'أوافق عشان دي فرصة',
        analysis: 'السبب: تبرير الغاية تبرر الوسيلة. البديل: الكفاءة',
        reason: 'تبرير الغاية تبرر الوسيلة',
        alternative: 'الاعتماد على الكفاءة والاستحقاق',
        integrityScoreDelta: -10,
        isBestChoice: false,
      },
      {
        text: 'أرفض وأقدم لوحدي',
        analysis: 'السبب: استقلالية ونزاهة. ممتاز',
        reason: 'استقلالية ونزاهة',
        alternative: 'بناء مسار مهني نقي',
        integrityScoreDelta: +8,
        isBestChoice: false,
      },
      {
        text: 'أقدم لوحدي بس أخلي بابا يسأل بس',
        analysis: 'السبب: منطقة رمادية. حاولي تعتمدي على نفسك',
        reason: 'منطقة رمادية وتردد',
        alternative: 'الاعتماد الكامل على قدراتك الذاتية',
        integrityScoreDelta: +2,
        isBestChoice: false,
      },
      {
        text: 'أقول لبابا يوقف الموضوع',
        analysis: 'السبب: نزاهة كاملة. ممتاز',
        reason: 'نزاهة كاملة وحسم مبكر',
        alternative: 'هذا هو الموقف المبدئي الأقوى',
        integrityScoreDelta: +10,
        isBestChoice: true,
      },
    ],
  },
  {
    id: 3,
    title: 'فلوس زيادة',
    video_desc: 'الكاشير رجعلك 200 جنيه زيادة بالغلط',
    theory: 'نظرية القيم الأساسية - شالوم شوارتز',
    options: [
      {
        text: 'أخدهم رزقي',
        analysis: 'السبب: تبرير ذاتي. البديل: الأمانة',
        reason: 'تبرير ذاتي خاطئ',
        alternative: 'الأمانة واستحضار الرقابة الذاتية',
        integrityScoreDelta: -15,
        isBestChoice: false,
      },
      {
        text: 'أرجعهم فوراً',
        analysis: 'السبب: أمانة. هذه القيمة ترفع مؤشر النزاهة +10',
        reason: 'أمانة ومبادرة فورية',
        alternative: 'هذه القيمة ترفع مؤشر النزاهة بقوة',
        integrityScoreDelta: +10,
        isBestChoice: true,
      },
      {
        text: 'أسيبهم وأمشي',
        analysis: 'السبب: سلبية. الأفضل المواجهة',
        reason: 'سلبية وهروب من القرار',
        alternative: 'المبادرة الإيجابية بتصحيح الخطأ',
        integrityScoreDelta: -5,
        isBestChoice: false,
      },
      {
        text: 'أصور وأفضحه',
        analysis: 'السبب: تشهير. الحل بهدوء أفضل',
        reason: 'تشهير ورد فعل مبالغ فيه',
        alternative: 'معالجة الأمر بالحكمة والستر',
        integrityScoreDelta: -5,
        isBestChoice: false,
      },
    ],
  },
  {
    id: 4,
    title: 'سرقة فكرة',
    video_desc: 'زميلك في الجروب خد فكرتك وقدمها للدكتور باسمه',
    theory: 'نظرية التنافر المعرفي - ليون فيستنجر',
    options: [
      {
        text: 'أسكت عشان الدرجات',
        analysis: 'السبب: خوف من العواقب. البديل: الحق',
        reason: 'خوف من العواقب واستسلام',
        alternative: 'المطالبة بالحق بالطرق الرسمية الهادئة',
        integrityScoreDelta: -5,
        isBestChoice: false,
      },
      {
        text: 'أواجهه بيني وبينه',
        analysis: 'السبب: حل ودي. خطوة جيدة',
        reason: 'حل ودي ومواجهة مباشرة',
        alternative: 'إعطاء فرصة لتصحيح الخطأ أدبياً',
        integrityScoreDelta: +5,
        isBestChoice: false,
      },
      {
        text: 'أكلم الدكتور بالأدلة',
        analysis: 'السبب: عدالة. هذا هو التصرف الصحيح',
        reason: 'عدالة موثقة بالأدلة',
        alternative: 'هذا هو التصرف النظامي الصحيح',
        integrityScoreDelta: +10,
        isBestChoice: true,
      },
      {
        text: 'أسرق فكرته المرة الجاية',
        analysis: 'السبب: دورة الغلط. لا تردي الغلط بغلط',
        reason: 'الانجرار في دائرة الخطأ والانتقام',
        alternative: 'عدم مقابلة الإساءة بمثلها والحفاظ على قيمك',
        integrityScoreDelta: -15,
        isBestChoice: false,
      },
    ],
  },
  {
    id: 5,
    title: 'التنمر الصامت',
    video_desc: 'الشلة بتتريق على بنت جديدة وبيقولولك تعالي اضحكي',
    theory: 'التعلم الاجتماعي - ألبرت باندورا',
    options: [
      {
        text: 'أضحك معاهم',
        analysis: 'السبب: ضغط الأقران. البديل: الشجاعة',
        reason: 'الخضوع لضغط الأقران ومسايرة السلوك الخاطئ',
        alternative: 'الشجاعة الأخلاقية في رفض الإيذاء',
        integrityScoreDelta: -15,
        isBestChoice: false,
      },
      {
        text: 'أسكت وأغير الموضوع',
        analysis: 'السبب: حياد سلبي. حاولي الدفاع',
        reason: 'حياد سلبي وموقف متفرج',
        alternative: 'اتخاذ موقف إيجابي ناصر للمظلوم',
        integrityScoreDelta: 0,
        isBestChoice: false,
      },
      {
        text: 'أدافع عنها',
        analysis: 'السبب: شجاعة أخلاقية. ممتاز +15 نقطة',
        reason: 'شجاعة أخلاقية ونصرة للغير',
        alternative: 'قمة النزاهة والشرف الإنساني',
        integrityScoreDelta: +15,
        isBestChoice: true,
      },
      {
        text: 'أبعد عن الشلة دي',
        analysis: 'السبب: حماية الذات. قرار محترم',
        reason: 'حماية الذات من البيئة السامة',
        alternative: 'قرار واعٍ باختيار الرفقة الصالحة',
        integrityScoreDelta: +8,
        isBestChoice: false,
      },
    ],
  },
];

export function calculateIntegrityReport(choices: MoralUserChoice[]): IntegrityReport {
  // Base starting score
  const baseScore = 50;
  let totalDelta = 0;
  const trendScores: number[] = [];
  let currentAccumulated = baseScore;

  choices.forEach((c) => {
    const delta = c.selectedOption.integrityScoreDelta;
    totalDelta += delta;
    currentAccumulated = Math.max(20, Math.min(100, currentAccumulated + delta));
    trendScores.push(currentAccumulated);
  });

  // Calculate final percentage clamped between 20% and 100%
  const scorePercentage = Math.max(20, Math.min(100, Math.round(baseScore + totalDelta * 1.1)));

  // Sub metrics
  const honestyScore = Math.min(100, Math.max(30, Math.round(scorePercentage * 0.95 + 4)));
  const moralCourageScore = Math.min(100, Math.max(30, Math.round(scorePercentage * 0.9 + 7)));
  const independenceScore = Math.min(100, Math.max(30, Math.round(scorePercentage * 0.88 + 9)));

  return {
    scorePercentage,
    honestyScore,
    moralCourageScore,
    independenceScore,
    trendScores,
  };
}
