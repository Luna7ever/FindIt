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
  const mediaUrl = raw.image_url || raw.media_url || raw.visualDetails?.sceneImageUrl || '/kids/challenge_banner.png';
  const audioUrl = raw.audio_url || raw.audioUrl || '';
  const roomLabel = raw.location || raw.room_label || raw.visualDetails?.roomLabel || 'فصل الأبطال 🏫';
  const locationBadge = raw.category || raw.locationBadge || raw.visualDetails?.locationBadge || 'البيئة المدرسية';

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
      promptNote: '',
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
  // WEEK 2: أمانة الأبطال الصغار ومساعدة الأصدقاء
  // ========================================================
  {
    id: 'week_2',
    week_id: 'week_2',
    theme_title: 'أمانة الأبطال الصغار وحماية ممتلكات المدرسة',
    order: 2,
    is_active: false,
    start_date: '2026-09-28T00:00:00.000Z',
    end_date: '2026-10-04T23:59:59.000Z',
    description: 'مواقف ممتعة للأبطال الصغار لتعلم الصدق، والاعتراف بالخطأ بشجاعة، ورد الأمانات، ومساعدة الأصدقاء.',
    badge_name: 'وسام البطل الصادق الصغير',
    pledge_text: MORAL_PLEDGES[1],
    scenarios: [
      // 1. Drawing & Homework Honesty
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s1_drawing',
        title: 'الأمانة في الرسم والواجب 🎨',
        category: 'الصدق والأمانة',
        character_name: 'عمر (صديقي بالفصل)',
        character_emotion: 'متردد ومستعجل',
        dialog_text: 'رسمتي لسه مش جاهزة، ممكن أكتب اسمي على رسمة صديقنا وأقول للمعلمة إني رسمتها عشان أكون الأول؟',
        moral_dimension: 'الأمانة والاعتماد على النفس',
        media_url: '/images/scenarios/scenario_academic_integrity.jpg',
        room_label: 'فصل النجوم 🌟',
        options: [
          {
            id: 'w2_s1_opt1',
            text: 'أقول له بلطف: "لا يا عمر، رسمتك الخاصة حتى لو بسيطة أجمل بكثير، والأمانة تخلينا أبطال حقيقيين!"',
            score: 100,
            feedback: 'بطل حقيقي! الاعتماد على نفسك يجعلك دائماً فخوراً بعملك ومحبوباً من الجميع.',
            whyWrong: '',
            correctActionText: 'الصدق في عمل الواجب والاعتماد على النفس.',
          },
          {
            id: 'w2_s1_opt2',
            text: 'أطلب منه يغير لون واحد في الرسمة بس عشان المعلمة ما تلاحظ.',
            score: 50,
            feedback: 'محاولة تجميل الخطأ لا تجعله صحيحاً؛ الصدق دائماً هو الأفضل.',
            whyWrong: 'أخذ مجهود الآخرين تصرف غير صحيح.',
            correctActionText: 'تشجيع الصديق على الرسم بمفرده بفخر.',
          },
          {
            id: 'w2_s1_opt3',
            text: 'أوافق وأشجعه يأخذ رسمة زميلنا بدون استئذان.',
            score: 0,
            feedback: 'تصرف خاطئ يحرم الصديق من التعلم ويكسر الأمانة.',
            whyWrong: 'أخذ أدوات ورسومات الزملاء دون إذن خطأ.',
            correctActionText: 'الاعتذار للمعلمة والعمل بجد لإكمال الرسمة بأمانة.',
          },
        ],
      }, 0),

      // 2. Classroom Toy Care & Courage
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s2_toy_care',
        title: 'حماية الممتلكات: كسر لعبة بالفصل 🧸',
        category: 'شجاعة الاعتراف بالخطأ',
        character_name: 'خالد (صديقي بالفصل)',
        character_emotion: 'حزين وخائف من العقاب',
        dialog_text: 'كنت بلعب بالكرة داخل الفصل وكسرت لعبة جميلة بالغلط.. ساعدني أقول للمعلمة الحقيقة وأعتذر بشجاعة!',
        moral_dimension: 'شجاعة الاعتراف بالخطأ والحفاظ على الألعاب',
        media_url: '/images/scenarios/scenario_computer_lab_damage.jpg',
        room_label: 'ركن الألعاب بالفصل 🏫',
        options: [
          {
            id: 'w2_s2_opt1',
            text: 'أهديه وأروح معاه للمعلمة فوراً، ونقول الحقيقة بأمانة ونعتذر بشجاعة لأن البطل يعترف بخطئه.',
            score: 100,
            feedback: 'يا بطل! شجاعة الاعتراف بالخطأ فضيلة عظيمة تجعل المعلمة وأصدقائك يحبونك ويحترمونك.',
            whyWrong: '',
            correctActionText: 'قول الصدق فوراً والاعتذار للمعلمة بشجاعة ومحبة.',
          },
          {
            id: 'w2_s2_opt2',
            text: 'أسكت خالص وما أقولش أي حاجة وأسيب الفصل كله حيران مين اللي كسر اللعبة.',
            score: 50,
            feedback: 'السكوت قد يجعل أصدقائك يشعرون بالحزن أو يُظلم أحدهم.',
            whyWrong: 'السكوت يمنع تصليح الخطأ.',
            correctActionText: 'مساعدة الصديق على قول الصدق لتبرئة الأصدقاء.',
          },
          {
            id: 'w2_s2_opt3',
            text: 'أقترح عليه يخبي اللعبة في سلة المهملات وننكر إننا شفنا حاجة.',
            score: 0,
            feedback: 'إخفاء الحقيقة تصرف خاطئ والصدق دائماً ينجي صاحبه.',
            whyWrong: 'الكذب وإخفاء الحقيقة ليس من صفات الأبطال.',
            correctActionText: 'إخبار المعلمة والتعاون لتنظيف المكان.',
          },
        ],
      }, 1),

      // 3. Lost Colored Pencil Box in Courtyard
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s3_pencil_box',
        title: 'أمانة الأغراض: العثور على ألوان جميلة ✏️',
        category: 'رد الأمانات لأصحابها',
        character_name: 'سعد (صديقي بالفسحة)',
        character_emotion: 'متحمس وعايز ياخد الألوان',
        dialog_text: 'شوف علبة الألوان الجديدة دي واقعة في ساحة الألعاب! شكلها حلو أوي، إيه رأيك ناخدها ونرسم بيها ومحدش هيعرف؟',
        moral_dimension: 'حفظ الأمانة ورد المفقودات لأصحابها',
        media_url: '/kids/kids_found_pencil.jpg',
        room_label: 'ساحة الألعاب ⚽',
        options: [
          {
            id: 'w2_s3_opt1',
            text: 'أقول له: "دي مش بتاعتنا يا سعد، وصاحبها أكيد زعلان عليها، تعال نسلمها للمعلمة فوراً عشان ترجع لصاحبها!"',
            score: 100,
            feedback: 'أمانة رائعة يا بطل! إعادة الأشياء لأصحابها يسعد قلوبهم ويجعلك بطلاً أميناً في مدرستك.',
            whyWrong: '',
            correctActionText: 'تسليم المفقودات للمعلمة أو ركن المفقودات فوراً.',
          },
          {
            id: 'w2_s3_opt2',
            text: 'أسيب الألوان مكانها على الأرض ومقربش منها عشان متعبش نفسي.',
            score: 50,
            feedback: 'ترك الأمانة قد يجعلها تضيع أو تتلف؛ البطل الإيجابي يساعد في حفظها.',
            whyWrong: 'ترك الأغراض الضائعة دون تسليمها قد يضيعها تماماً.',
            correctActionText: 'أخذها برفق وتسليمها لإدارة المدرسة أو المعلمة.',
          },
          {
            id: 'w2_s3_opt3',
            text: 'أوافق وأقسم الألوان معاه وأحط نصها في شنطتي المدرسية.',
            score: 0,
            feedback: 'أخذ أغراض الآخرين خطأ كبير وكسر للأمانة.',
            whyWrong: 'أخذ ما ليس لك يضر بصاحبه ويخالف الصدق.',
            correctActionText: 'حفظ الأمانة كاملة وإرجاعها.',
          },
        ],
      }, 2),

      // 4. Lab & Classroom Cleanliness Cooperation
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s4_lab_tidy',
        title: 'التعاون الصادق: ترتيب أدوات النشاط 🧪',
        category: 'المحافظة على بيئة التعلم',
        character_name: 'يوسف (صديقي في النشاط)',
        character_emotion: 'مستعجل عايز يروح يلعب',
        dialog_text: 'خلصنا التجربة الممتعة، إيه رأيك نسيب الأدوات مبعثرة ونجري على الفسحة وباقي الطلاب ينضفوا مكاننا؟',
        moral_dimension: 'المسؤولية والتعاون في النظافة',
        media_url: '/images/scenarios/scenario_science_lab_calc.jpg',
        room_label: 'معمل العلوم للأطفال 🔬',
        options: [
          {
            id: 'w2_s4_opt1',
            text: 'أشجعه بحماس: "يلا نرتب أدواتنا بسرعة وبنظام مع بعض، عشان نسيب المكان نظيف وجميل زي ما استلمناه!"',
            score: 100,
            feedback: 'بطل نظيف ومنظم! التعاون في تنظيف وترتيب أدوات الفصل يعبر عن حبك لمدرستك وأصدقائك.',
            whyWrong: '',
            correctActionText: 'التعاون في إعادة الأدوات لأماكنها بنظافة.',
          },
          {
            id: 'w2_s4_opt2',
            text: 'أرتب أدواتي أنا بس وأسيب باقي المكان غير مرتب للآخرين.',
            score: 50,
            feedback: 'جميل أن تنظم أدواتك، والأجمل أن تساعد صديقك وتتعاونا معاً.',
            whyWrong: 'الأفضل مشاركة الفريق في الترتيب الكامل.',
            correctActionText: 'التعاون مع زميلك لإنهاء العمل سوياً بسرعة.',
          },
          {
            id: 'w2_s4_opt3',
            text: 'أجري معاه ونسيب الأدوات مكسورة أو مرمية على الطاولة.',
            score: 0,
            feedback: 'إهمال الأدوات يسبب تلفها وقد يعرض زملاءك للأذى.',
            whyWrong: 'ترك المكان مهملاً تصرف غير مسؤول.',
            correctActionText: 'إعادة الأدوات لمكانها الآمن قبل الخروج.',
          },
        ],
      }, 3),

      // 5. Cafeteria Change Honesty
      normalizeToIntegrityScenario({
        scenario_id: 'w2_s5_cafeteria_change',
        title: 'الأمانة في الفسحة: باقي النقود بالمقصف 🥪',
        category: 'النزاهة والصدق في المعاملات',
        character_name: 'فهد (صديقي في الطابور)',
        character_emotion: 'فرحان بالفلوس الزيادة',
        dialog_text: 'عمو في المقصف رجعلي باقي زيادة بالغلط! إيه رأيك نشتري بيها عصير زيادة ومحدش هيحس بحاجة؟',
        moral_dimension: 'الصدق والأمانة في رد الأموال',
        media_url: '/images/scenarios/scenario_cafeteria_change.jpg',
        room_label: 'مقصف المدرسة 🏫',
        options: [
          {
            id: 'w2_s5_opt1',
            text: 'أنصحه بابتسامة: "الزيادة دي مش بتاعتنا يا فهد، تعال نرجعها لعمو فوراً عشان الأمانة بتخلينا أبطال نزاهة شرفاء!"',
            score: 100,
            feedback: 'ممتاز يا بطل الأمانة! رد الحقوق لأصحابها حتى في أصغر الأشياء يزرع فيك النزاهة والبركة.',
            whyWrong: '',
            correctActionText: 'إرجاع المال الزائد فوراً للبائع بكل صدق.',
          },
          {
            id: 'w2_s5_opt2',
            text: 'أقوله يحطها في جيبه ويتصدق بيها بعدين في صندوق التبرعات.',
            score: 50,
            feedback: 'نية الخير طيبة، لكن رد الحق لصاحبه الأصلي أولى وأوجب.',
            whyWrong: 'الصدقة لا تصح بمال ليس ملكك؛ الواجب إرجاعه للبائع.',
            correctActionText: 'رد المال للبائع نفسه.',
          },
          {
            id: 'w2_s5_opt3',
            text: 'أفرح معاه وأروح اشتري معاه حلويات بالفلوس الزيادة.',
            score: 0,
            feedback: 'استحلال المال الزائد خطأ يضر بالأمانة والضمير.',
            whyWrong: 'أخذ مال غيرك دون حق يخالف الصدق والأمانة.',
            correctActionText: 'الاعتراف بالخطأ وإعادة المبلغ للبائع فوراً.',
          },
        ],
      }, 4),
    ],
  },
];
