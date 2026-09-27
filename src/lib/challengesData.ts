import { IntegrityScenario, WeeklyChallenge } from '@/types';
import { INTEGRITY_SCENARIOS } from './constants';

/**
 * Normalizes any raw scenario from Firestore or API into a complete, safe IntegrityScenario
 */
export function normalizeToIntegrityScenario(raw: any, index: number): IntegrityScenario {
  if (!raw) {
    return INTEGRITY_SCENARIOS[index % INTEGRITY_SCENARIOS.length];
  }

  // If already structured as IntegrityScenario
  if (Array.isArray(raw.questions) && raw.questions.length > 0 && raw.visualDetails) {
    return raw as IntegrityScenario;
  }

  const scenarioId = raw.scenario_id || (raw.id !== undefined ? String(raw.id) : `scenario_${index + 1}`);
  const charName = raw.character_name || raw.characterSpeaker?.name || 'زميل الصف';
  const charEmotion = raw.character_emotion || raw.characterSpeaker?.emotion || 'قلق ومتردد';
  const dialogText = raw.dialog_text || raw.detailedDilemma || raw.shortDescription || '';
  const moralDim = raw.moral_dimension || raw.category || raw.topicTitle || 'النزاهة المدرسية';
  const categoryTitle = raw.category || raw.topicTitle || moralDim;
  const mediaUrl = raw.image_url || raw.media_url || raw.visualDetails?.sceneImageUrl || '/images/scenarios/scenario_hallway_item.jpg';
  const audioUrl = raw.audio_url || raw.audioUrl || '';
  const roomLabel = raw.location || raw.room_label || raw.visualDetails?.roomLabel || 'الحرم المدرسي';
  const locationBadge = raw.category || raw.location || raw.room_label || raw.visualDetails?.locationBadge || 'البيئة المدرسية';

  const options = Array.isArray(raw.options) ? raw.options : [];

  return {
    id: scenarioId,
    title: raw.title || `موقف ${index + 1}: ${categoryTitle}`,
    topicTitle: categoryTitle,
    shortDescription: dialogText.substring(0, 80) + '...',
    detailedDilemma: dialogText,
    dilemmaQuote: dialogText ? `"${dialogText}"` : '',
    cognitiveBasis: raw.cognitiveBasis || `البعد الأخلاقي: ${moralDim}، وتنمية حس المسؤولية الفردية والمجتمعية`,
    visualDetails: {
      locationBadge,
      roomLabel,
      promptNote: dialogText ? `⚠️ ${charName}: "${dialogText.substring(0, 60)}..."` : '',
      sceneImageUrl: mediaUrl,
    },
    characterSpeaker: {
      name: charName,
      role: raw.character_role || raw.characterSpeaker?.role || 'طالب بالمدرسة',
      avatarEmoji: raw.character_avatar || raw.characterSpeaker?.avatarEmoji || '👤',
      emotion: charEmotion,
    },
    locationId: raw.location_id || raw.locationId || 'classrooms_g1',
    audioUrl,
    videoUrl: raw.video_url || raw.videoUrl || '',
    duration: raw.duration || '0:45',
    badgeName: raw.badge_name || raw.badgeName || 'سفير النزاهة',
    pointsAwarded: 10,
    questions: [
      {
        id: `q_${scenarioId}`,
        order: 1,
        question: raw.question || 'كيف تتصرف بحكمة وأمانة في هذا الموقف التربوي؟',
        explanation: moralDim,
        options: options.map((opt: any, optIdx: number) => {
          let calculatedScore = 0;
          if (typeof opt.score === 'number') {
            calculatedScore = opt.score;
          } else if (typeof opt.points === 'number') {
            calculatedScore = opt.points <= 25 ? Math.round((opt.points / 25) * 100) : opt.points;
          } else {
            calculatedScore = optIdx === 0 ? 100 : 0;
          }

          return {
            id: opt.id || `opt_${scenarioId}_${optIdx + 1}`,
            text: opt.text || '',
            score: calculatedScore,
            feedback: opt.feedback || (calculatedScore >= 80 ? 'تصرف نموذجي يعكس النزاهة والأمانة!' : 'يحتاج التصرف لمراجعة التوجيهات الأخلاقية.'),
            whyWrong: opt.whyWrong || (calculatedScore < 80 ? opt.feedback : ''),
            correctActionText: opt.correctActionText || (calculatedScore >= 80 ? opt.feedback : ''),
          };
        }),
      },
    ],
  };
}

/**
 * Rotating Moral Pledges for Weekly Priming
 */
export const MORAL_PLEDGES: string[] = [
  // Week 1: الهوية والمبادئ الحقيقية
  "أتعهد بأن تعبّر اختياراتي عن شخصيتي ومبادئي الحقيقية، وأن أختار التصرف الأمين في كل موقف يواجهني داخل المدرسة.",
  
  // Week 2: الرقابة الذاتية والصدق مع النفس
  "أتعهد بأن أكون صادقاً مع نفسي أولاً؛ فنزاهتي الحقيقية تظهر في قراراتي عندما أكون مسؤولاً عن تصرفاتي في أي موقف مدرسي.",
  
  // Week 3: مقاومة الضغوط والعدل
  "أتعهد بأن تكون كل إجابة أختارها ممثلة لسلوكي الفعلي، واضعاً الأمانة والعدل فوق أي ضغط أو مصلحة مؤقتة.",
  
  // Week 4: الأثر المجتمعي والقدوة
  "أتعهد باتخاذ القرار الذي يحفظ حقي وحقوق الآخرين، وأن تكون اختياراتي خطوة نحو مجتمع مدرسي أكثر أمانة ونزاهة."
];

export const MORAL_PLEDGES_EN: string[] = [
  "I pledge that my choices will reflect my true character and principles, and that I will choose the honest action in every school situation.",
  "I pledge to be honest with myself first; my true integrity shines in my decisions when I am accountable for my actions in school.",
  "I pledge that every answer I choose represents my actual behavior, placing honesty and justice above any pressure or temporary gain.",
  "I pledge to make decisions that uphold my rights and the rights of others, making my choices a step towards a more honest school community."
];

export function getMoralPledgeForChallenge(challenge?: WeeklyChallenge | null, order?: number, lang: 'ar' | 'en' = 'ar'): string {
  if (challenge?.pledge_text && lang === 'ar') {
    return challenge.pledge_text;
  }
  const pledges = lang === 'en' ? MORAL_PLEDGES_EN : MORAL_PLEDGES;
  const idx = Math.max(0, ((order ?? challenge?.order ?? 1) - 1) % pledges.length);
  return pledges[idx];
}

/**
 * Default Seed Weekly Challenges for Firestore (Week 1 and Week 2)
 */
export const DEFAULT_WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  // ========================================================
  // WEEK 1: أمانة المعاملات والنزاهة الميدانية
  // ========================================================
  {
    id: 'week_1',
    week_id: 'week_1',
    theme_title: 'أمانة المعاملات والنزاهة الميدانية',
    order: 1,
    is_active: true,
    start_date: '2026-09-20T00:00:00.000Z',
    end_date: '2026-09-27T23:59:59.000Z',
    description: 'تحدي المواقف الميدانية داخل المدرسة؛ من قاعة الاختبار وطابور المقصف إلى معامل العلوم وغرف الحواسب.',
    badge_name: 'وسام سفير النزاهة الميدانية',
    pledge_text: MORAL_PLEDGES[0],
    scenarios: INTEGRITY_SCENARIOS,
  },

  // ========================================================
  // WEEK 2: المسؤولية الأكاديمية والوعي الرقمي
  // ========================================================
  {
    id: 'week_2',
    week_id: 'week_2',
    theme_title: 'المسؤولية الأكاديمية وحماية الممتلكات الرقمية',
    order: 2,
    is_active: false,
    start_date: '2026-09-28T00:00:00.000Z',
    end_date: '2026-10-04T23:59:59.000Z',
    description: 'تحديات حماية الملكية الفكرية، شجاعة الاعتراف بالخطأ، المواطنة الرقمية، ورد الأمانات المالية في الملعب.',
    badge_name: 'وسام الوعي والمسؤولية الرقمية',
    pledge_text: MORAL_PLEDGES[1],
    scenarios: [
      // 1. Intellectual Property
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s1_plagiarism',
        title: 'الأمانة العلمية: مشروع البحث الجماعي',
        character_name: 'عمر (زميل مجموعة البحث)',
        character_emotion: 'مستعجل ومتكاسل عن البحث',
        dialog_text: 'لقيت بحث جاهز لطالب من السنة الماضية على الإنترنت، خلينا نغير بس الأسماء ونقدمه للمعلم وناخد الدرجة الكاملة بدل التعب والسهر!',
        moral_dimension: 'الأمانة العلمية واحترام الملكية الفكرية',
        media_url: '/images/scenarios/scenario_academic_integrity.jpg',
        room_label: 'مكتبة المدرسة - قاعة الأبحاث',
        options: [
          {
            id: 'w2_s1_opt1',
            text: 'أرفض بحزم: "الدرجة لا تستحق أن نسرق مجهود غيرنا، دعنا ننجز عملنا الأصيل حتى لو كان بسيطاً، فالأمانة العلمية أهم من أي تقييم."',
            score: 100,
            feedback: 'موقف نبيل يعبر عن الشرف الأكاديمي الحقيقي؛ بناء مهاراتك بنفسك هو المكسب الحقيقي المستمر.',
            whyWrong: '',
            correctActionText: 'النزاهة الفكرية تتطلب الاعتماد على الجهد الذاتي ونسبة الأفكار لأصحابها.',
          },
          {
            id: 'w2_s1_opt2',
            text: 'أقترح نسخ نصف البحث فقط وإعادة صياغة المقدمة لتفادي كشف السرقة من المعلم.',
            score: 50,
            feedback: 'محاولة تجميل الانتهاك لا تلغي كونه سطواً على مجهود الآخرين وكسراً للأمانة.',
            whyWrong: 'التحايل على كشف الانتحال هو احتيال أكاديمي مضلل.',
            correctActionText: 'الواجب إنجاز البحث بجهدكم المستقل والاستشهاد بالمراجع وفق الأصول العلمية.',
          },
          {
            id: 'w2_s1_opt3',
            text: 'أوافق على الفور وأرسل الملف باسمنا للمدرس دون أي تردد لتوفير الوقت للعب.',
            score: 0,
            feedback: 'خيانة صريحة للأمانة العلمية وحرمان للنفس من التعلم وتضليل مباشر للمعلم.',
            whyWrong: 'السرقة العلمية انتهاك جسيم لقوانين المدرسة والعدالة الأكاديمية.',
            correctActionText: 'رفض استغلال جهود الآخرين والعمل بجد وأمانة لإعداد بحث خاص بالمجموعة.',
          },
        ],
      }, 0),

      // 2. School Projector Damage
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s2_projector',
        title: 'حماية الممتلكات: كسر جهاز العرض بالفصل',
        character_name: 'خالد (طالب بالفصل)',
        character_emotion: 'مرعوب من العقوبة وتكلفة التصليح',
        dialog_text: 'كنت بلعب بالكرة داخل الفصل وكسرت عدسة البروجكتور بالغلط.. تكفى لا تقول لأحد وخلينا نقول للمعلم إنه كان خربان من أول اليوم!',
        moral_dimension: 'شجاعة الاعتراف بالخطأ والحفاظ على المال العام',
        media_url: '/images/scenarios/scenario_computer_lab_privacy.jpg',
        room_label: 'فصل 1/2 الثانوي',
        options: [
          {
            id: 'w2_s2_opt1',
            text: 'أهدئه وأرافقه فوراً لإدارة المدرسة أو المعلم المسؤول للاعتراف بشجاعة بالخطأ غير المقصود وتحمل المسؤولية بروح نزيهة.',
            score: 100,
            feedback: 'شجاعة فائقة ونضج أخلاقي؛ الاعتراف بالخطأ فضيلة ترفع قدر صاحبها وتمنع الشك في الأبرياء.',
            whyWrong: '',
            correctActionText: 'المسارعة بالاعتراف الصادق وتحمل نتائج الأفعال دون خوف من العقاب.',
          },
          {
            id: 'w2_s2_opt2',
            text: 'ألتزم الصمت التام ولا أتكلم، تاركاً الفصل بأكمله تحت دائرة الاتهام والعقاب الجماعي.',
            score: 50,
            feedback: 'سلبية مؤذية تسمح بظلم زملاء أبرياء وتخالف واجب التعاون على البر.',
            whyWrong: 'السكوت عن الحق يتسبب في مساءلة زملائك الأبرياء.',
            correctActionText: 'مساندة الصديق على قول الصدق وتبرئة بقية الزملاء.',
          },
          {
            id: 'w2_s2_opt3',
            text: 'أساعده في تلفيق رواية كاذبة لاتهام فصل آخر دخل القاعة قبلنا لنبرئ أنفسنا.',
            score: 0,
            feedback: 'ظلم مركب وكذب صريح يجمع بين إتلاف الممتلكات والافتراء على الأبرياء.',
            whyWrong: 'الكذب واتهام الآخرين باطلاً من أبشع صور انعدام النزاهة.',
            correctActionText: 'الصدق منجاة، وتصحيح الخطأ يبدأ بالاعتراف به.',
          },
        ],
      }, 1),

      // 3. Lost Wallet in Sports Field
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s3_field_wallet',
        title: 'أمانة اللقطة: العثور على محفظة نقود بالملعب',
        character_name: 'سعد (صديق في حصة الرياضة)',
        character_emotion: 'متحمس وطامع في النقود',
        dialog_text: 'شوف المحفظة دي واقعة تحت مدرج الملعب وفيها 200 ريال! ما في كاميرات هنا، خلينا نقسمها ومحدش هيعرف مين اللي لقاها!',
        moral_dimension: 'أمانة اللقطة وحرمة الأموال الخاصة',
        media_url: '/images/scenarios/scenario_hallway_item.jpg',
        room_label: 'الملعب المدرسي والمدرجات',
        options: [
          {
            id: 'w2_s3_opt1',
            text: 'أرفض بشكل قاطع: "هذا مال حرام ليس حقنا، وصاحبها قلق عليها، سأسلمها فوراً للإدارة وأسجل بلاغ عثور في منصة Ethos."',
            score: 100,
            feedback: 'أمانة نموذجية في السر والعلن؛ مراقبة الله وحفظ حقوق الناس أساس الشخصية القيادية النزيهة.',
            whyWrong: '',
            correctActionText: 'تسليم اللقطة فوراً للجهة المسؤولة وحفظ الأمانات حتى تعود لأصحابها.',
          },
          {
            id: 'w2_s3_opt2',
            text: 'أترك المحفظة على الأرض مكانها دون لمسها حتى لا أتحمل مسؤوليتها أمام أحد.',
            score: 50,
            feedback: 'تهرب من المسؤولية؛ الإيجابية تقتضي حماية الأمانة من الضياع أو عبث ضعاف النفوس.',
            whyWrong: 'ترك المال الضائع يعرضه للسرقة والتلف.',
            correctActionText: 'المبادرة بحفظ اللقطة وتسليمها للمسؤولين بدلاً من تركها.',
          },
          {
            id: 'w2_s3_opt3',
            text: 'أوافق على تقسيم المبلغ معه وإنفاقه في مقصف المدرسة مادام لا أحد يرانا.',
            score: 0,
            feedback: 'استحلال للمال الحرام وخيانة واضحة للأمانة تضر بضميرك وتؤذي صاحب المال.',
            whyWrong: 'أخذ ما ليس لك سرقة وخيانة للأمانة.',
            correctActionText: 'الأمانة مبدأ ثابت لا يتغير بغياب الرقيب البشري.',
          },
        ],
      }, 2),

      // 4. WhatsApp Group Activity Leak
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s4_group_leak',
        title: 'المواطنة الرقمية: تسريب أسئلة النشاط بالجروب',
        character_name: 'يوسف (مشرف مجموعة الصف)',
        character_emotion: 'متباهٍ بالسبق ومتحمس',
        dialog_text: 'يا شباب صورت ورقة أسئلة النشاط الشهري من مكتب المعلم ونزلتها في جروب الواتساب، احفظوا الإجابات بس احذفوا الرسايل بسرعة!',
        moral_dimension: 'المواطنة الرقمية وحماية العدالة والنزاهة المؤسسية',
        media_url: '/images/scenarios/scenario_science_lab_damage.jpg',
        room_label: 'المجموعة الرقمية لطلاب الصف',
        options: [
          {
            id: 'w2_s4_opt1',
            text: 'أنبه الزملاء فوراً بعدم تداول التسريب، وأنصح يوسف بحذفه وإبلاغ المعلم لتغيير الأسئلة صوناً للعدالة وتكافؤ الفرص.',
            score: 100,
            feedback: 'وعي مدني ورقمي راقٍ؛ رفض الاستفادة من الغش وحماية تكافؤ الفرص يعزز البيئة التعليمية العادلة.',
            whyWrong: '',
            correctActionText: 'رفض الغش الرقمي وإيقاف انتشاره فوراً وتوعية الزملاء بعواقبه.',
          },
          {
            id: 'w2_s4_opt2',
            text: 'أغادر المجموعة بهدوء دون أن أقول شيئاً لأي شخص تفادياً للمشاكل.',
            score: 50,
            feedback: 'موقف محايد يفتقر للإيجابية؛ الإصلاح يتطلب كلمة طيبة وتوجيهاً يحمي بقية الطلاب.',
            whyWrong: 'الانسحاب الصامت يسمح للخطأ بالاستمرار وإفساد تقييم بقية الطلاب.',
            correctActionText: 'النصح والتذكير بالأمانة قبل مغادرة أي محادثة غير أخلاقية.',
          },
          {
            id: 'w2_s4_opt3',
            text: 'أحفظ الأسئلة وأشاركها مع مجموعات الفصول الأخرى لزيادة التفاعل والشهرة.',
            score: 0,
            feedback: 'مشاركة نشطة في نشر الفساد الأكاديمي وانتهاك صارخ لخصوصية وأمانة المدرسة.',
            whyWrong: 'ترويج التسريبات جريمة أكاديمية تخل بالعدالة كلياً.',
            correctActionText: 'عدم ترويج أي مواد مسربة والتصدي لمن يحاول تسريبها.',
          },
        ],
      }, 3),

      // 5. Attendance Register Tampering
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s5_attendance',
        title: 'نزاهة المسؤولية: التلاعب بدفتر الحضور والغياب',
        character_name: 'فهد (عريف الصف)',
        character_emotion: 'يعرض مجاملة غير مشروعة',
        dialog_text: 'بما إني ماسك دفتر الحضور اليوم، إيش رأيك أحطك حاضر طول الأسبوع وتتأخر براحتك في الفسحة وما حد بيدري؟',
        moral_dimension: 'نزاهة المسؤولية ورفض المحسوبية والمجاملة',
        media_url: '/images/scenarios/scenario_cafeteria_queue.jpg',
        room_label: 'فصل 2/3 الثانوي',
        options: [
          {
            id: 'w2_s5_opt1',
            text: 'أعتذر له بحزم: "شكراً يا فهد، لكن الأمانة لا تتجزأ، والمسؤولية تكليف لا فرصة للمجاملة، سجل الواقع بدقة كما هو."',
            score: 100,
            feedback: 'نزاهة استثنائية وصلابة أخلاقية ترفض استغلال النفوذ الصغير والمجاملات الزائفة.',
            whyWrong: '',
            correctActionText: 'المسؤولية أمانة، ورفض الامتيازات غير المشروعة يرسخ مبدأ المساواة.',
          },
          {
            id: 'w2_s5_opt2',
            text: 'أطلب منه عدم تسجيل اسمي ولكني لا أنصحه فيما يخص بقية الطلاب الذين يجاملهم.',
            score: 50,
            feedback: 'نزاهة فردية جيدة ولكنها ناقصة؛ السكوت عن تزوير سجلات الآخرين يضر بنظام المدرسة.',
            whyWrong: 'الاكتفاء بإنقاذ النفس دون تقديم النصيحة يضعف نزاهة البيئة العامة.',
            correctActionText: 'رفض العرض ونصح الزميل بأداء مسؤوليته بعدل مع الجميع.',
          },
          {
            id: 'w2_s5_opt3',
            text: 'أشكره وأطلب منه تسجيل زميل ثالث لنا أيضاً لم يحضر اليوم.',
            score: 0,
            feedback: 'تزوير مباشر للوثائق المدرسية واستغلال للمنصب، وهو خرق أمانة يوجب المساءلة.',
            whyWrong: 'التزوير في كشوف الحضور خيانة للأمانة الموكلة لك.',
            correctActionText: 'تسجيل البيانات الصادقة ورفض أي تلاعب مهما صغر شأنه.',
          },
        ],
      }, 4),
    ],
  },
];
