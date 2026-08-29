import { ItemCategory, SchoolLocation, UserProfile, Item } from '@/types';

export const CATEGORIES: { id: ItemCategory; label: string; icon: string; description: string }[] = [
  { id: 'electronics', label: 'إلكترونيات وأجهزة', icon: 'Laptop', description: 'حاسبات، سماعات، ساعات، شواحن' },
  { id: 'books', label: 'كتب ودفاتر ومذكرات', icon: 'BookOpen', description: 'كتب دراسية، دفاتر ملاحظات، ملفات' },
  { id: 'stationery', label: 'أدوات مدرسية', icon: 'PenTool', description: 'مقالم، أقلام، علب هندسة، مساطر' },
  { id: 'bottles', label: 'قوارير وحافظات ماء', icon: 'CupSoda', description: 'مطارات ماء، حافظات سوائل' },
  { id: 'keys', label: 'مفاتيح وميداليات', icon: 'KeyRound', description: 'مفاتيح منازل، خزائن، سيارات' },
  { id: 'bags', label: 'حقائب وأكياس', icon: 'ShoppingBag', description: 'حقائب ظهر، حقائب رياضية' },
  { id: 'clothing', label: 'ملابس وأزياء', icon: 'Shirt', description: 'سترات، جاكيتات، قبعات' },
  { id: 'wallets_cards', label: 'بطاقات ومحافظ', icon: 'CreditCard', description: 'بطاقة مدرسية، بطاقة صراف، محافظ' },
  { id: 'sports', label: 'أدوات رياضية', icon: 'Trophy', description: 'كرات، ألبسة رياضية، أحذية' },
  { id: 'personal', label: 'أغراض شخصية أخرى', icon: 'FolderOpen', description: 'نظارات، ساعات، إكسسوارات' },
];

export const SCHOOL_LOCATIONS: SchoolLocation[] = [
  { id: 'science_lab', name: 'معمل العلوم والكيمياء', building: 'المبنى العلمي', floor: 'الطابق الثاني', icon: 'FlaskConical' },
  { id: 'library', name: 'المكتبة المدرسية', building: 'المبنى الرئيسي', floor: 'الطابق الأول', icon: 'Library' },
  { id: 'cafeteria', name: 'الكافتيريا / صالة الطعام', building: 'مبنى الخدمات', floor: 'الطابق الأرضي', icon: 'Utensils' },
  { id: 'gym', name: 'الصالة الرياضية المغلقة', building: 'المجمع الرياضي', floor: 'الطابق الأرضي', icon: 'Dumbbell' },
  { id: 'playground', name: 'الملعب والساحة الخارجية', building: 'الساحة المركزية', floor: 'خارجي', icon: 'Sun' },
  { id: 'classrooms_g1', name: 'فصول المرحلة الأولى (10 - 11)', building: 'المبنى الأكاديمي أ', floor: 'الطابق الأول', icon: 'GraduationCap' },
  { id: 'classrooms_g2', name: 'فصول المرحلة الثانية (12)', building: 'المبنى الأكاديمي ب', floor: 'الطابق الثاني', icon: 'Building' },
  { id: 'computer_lab', name: 'معمل الحاسب الآلي والتقنية', building: 'المبنى العلمي', floor: 'الطابق الأول', icon: 'Monitor' },
  { id: 'admin_office', name: 'مكتب الإدارة والأمانات', building: 'المبنى الرئيسي', floor: 'الطابق الأرضي', icon: 'ShieldCheck' },
  { id: 'prayer_room', name: 'المصلى المدرسي', building: 'المبنى الرئيسي', floor: 'الطابق الأرضي', icon: 'Moon' },
];

export const ITEM_COLORS = [
  { name: 'أسود', hex: '#18181B' },
  { name: 'أزرق', hex: '#2563EB' },
  { name: 'فضي / رمادي', hex: '#64748B' },
  { name: 'أبيض', hex: '#F8FAFC' },
  { name: 'كحلي', hex: '#1E293B' },
  { name: 'أخضر', hex: '#16A34A' },
  { name: 'أحمر', hex: '#DC2626' },
  { name: 'بني', hex: '#78350F' },
  { name: 'أخرى', hex: '#8B5CF6' },
];

// TWO PRIMARY DEMO SHOWCASE IDENTITIES
export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_malak',
    name: 'ملك محمد فروق',
    email: 'malak.farouk@school.edu',
    role: 'student',
    grade: 'الصف الحادي عشر - علمي',
    avatar: '',
    returnedCount: 2,
    isTrusted: true,
    goodwillPoints: 100,
  },
  {
    id: 'user_moshira',
    name: 'م. مشيرة',
    email: 'moshira.admin@school.edu',
    role: 'admin',
    grade: 'إدارة المدرسة وشؤون الأمانات',
    avatar: '',
    returnedCount: 34,
    isTrusted: true,
    goodwillPoints: 650,
  },
];

// DETERMINISTIC DEMO ITEMS WITH FIXED ISO TIMESTAMPS
export const INITIAL_SEED_ITEMS: Item[] = [
  // 1. MALAK'S LOST ITEM (Target for 88% Match demo!)
  {
    id: 'item_malak_lost_calc',
    title: 'حاسبة كاسيو علمية fx-991EX',
    type: 'lost',
    category: 'electronics',
    locationId: 'science_lab',
    locationDetails: 'نسيتها على طاولة التجارب رقم 3 في معمل الكيمياء بعد الحصة الرابعة',
    date: '2026-08-29T18:00:00.000Z',
    color: 'أسود',
    brand: 'Casio',
    description: 'حاسبة علمية سوداء مع غطاء حماية وعليها ملصق كوكب زحل الأزرق بالخلف.',
    status: 'open',
    reportedBy: DEMO_USERS[0], // Malak
    createdAt: '2026-08-29T18:00:00.000Z',
  },

  // 2. MATCHING FOUND ITEM IN SCIENCE LAB (88% Match with Malak's Calculator!)
  {
    id: 'item_found_calc_lab',
    title: 'آلة حاسبة Casio سوداء',
    type: 'found',
    category: 'electronics',
    locationId: 'science_lab',
    locationDetails: 'وُجدت في معمل الكيمياء على طاولة التجارب بجانب المجهر',
    date: '2026-08-29T18:45:00.000Z',
    color: 'أسود',
    brand: 'Casio',
    description: 'آلة حاسبة علمية سوداء كاسيو بحالة ممتازة ومقفلة بغطائها الأصلي.',
    secretQuestion: 'ما هو شكل ولون الملصق الموجود على الغطاء الخلفي للحاسبة؟',
    secretAnswer: 'ملصق أزرق دائري لكوكب زحل',
    custody: 'with_finder',
    status: 'open',
    reportedBy: {
      id: 'student_finder_sara',
      name: 'سارة القحطاني',
      email: 'sara.q@school.edu',
      role: 'student',
      grade: 'الصف العاشر - أ',
      avatar: '',
      returnedCount: 3,
      isTrusted: true,
      goodwillPoints: 90,
    },
    createdAt: '2026-08-29T18:45:00.000Z',
  },

  // 3. MALAK'S LOST WATER BOTTLE
  {
    id: 'item_malak_lost_bottle',
    title: 'قارورة ماء رياضية زرقاء Hydro Flask',
    type: 'lost',
    category: 'bottles',
    locationId: 'gym',
    locationDetails: 'عند مقاعد البدلاء في الصالة الرياضية أثناء حصة التربية البدنية',
    date: '2026-08-29T15:30:00.000Z',
    color: 'أزرق',
    brand: 'Hydro Flask',
    description: 'مطارة ماء زرقاء سعة 750 مل مع حزام غطاء مطاطي أسود.',
    status: 'open',
    reportedBy: DEMO_USERS[0], // Malak
    createdAt: '2026-08-29T15:30:00.000Z',
  },

  // 4. MALAK'S REUNITED NOTEBOOK (Demonstrating Reunited History)
  {
    id: 'item_malak_reunited_notebook',
    title: 'دفتر مذكرات الرياضيات المتقدمة',
    type: 'lost',
    category: 'books',
    locationId: 'classrooms_g1',
    locationDetails: 'الفصل 11-أ علمي',
    date: '2026-08-27T08:00:00.000Z',
    color: 'بني',
    description: 'دفتر بغلاف بني مقوى يحتوي على مسائل وحلول تفاضل وتكامل.',
    status: 'reunited',
    reunitedAt: '2026-08-28T10:00:00.000Z',
    reportedBy: DEMO_USERS[0], // Malak
    createdAt: '2026-08-27T08:00:00.000Z',
  },

  // 5. FOUND WIRELESS EARBUDS
  {
    id: 'item_found_airpods',
    title: 'سماعات Apple AirPods Pro لاسلكية',
    type: 'found',
    category: 'electronics',
    locationId: 'library',
    locationDetails: 'في ركن القراءة الهادئة بالطابق الأول بجانب النافذة',
    date: '2026-08-29T16:30:00.000Z',
    color: 'أبيض',
    brand: 'Apple',
    description: 'علبة سماعات آيربودز بيضاء نظيفة بجراب سيليكون شفاف.',
    secretQuestion: 'ما هو النقش أو الرسمة الصغيرة على جراب السماعات؟',
    secretAnswer: 'رسمة شمس صغيرة باللون الأصفر',
    custody: 'at_office',
    status: 'open',
    reportedBy: DEMO_USERS[1], // Moshira Admin
    createdAt: '2026-08-29T16:30:00.000Z',
  },

  // 6. FOUND SILVER WATCH
  {
    id: 'item_found_watch',
    title: 'ساعة يد فضية كلاسيكية',
    type: 'found',
    category: 'personal',
    locationId: 'playground',
    locationDetails: 'قرب مدخل الملعب الرياضي',
    date: '2026-08-28T11:00:00.000Z',
    color: 'فضي / رمادي',
    description: 'ساعة يد بسوار ستانلس ستيل ومينا داكن وعقارب زرقاء.',
    secretQuestion: 'ما هو لون المينا الداخلي للساعة؟',
    secretAnswer: 'كحلي داكن',
    custody: 'at_office',
    status: 'open',
    reportedBy: DEMO_USERS[1], // Moshira Admin
    createdAt: '2026-08-28T11:00:00.000Z',
  },

  // 7. FOUND HOUSE KEYS
  {
    id: 'item_found_keys',
    title: 'مفاتيح منزل مع ميدالية جلدية بنية',
    type: 'found',
    category: 'keys',
    locationId: 'cafeteria',
    locationDetails: 'على طاولة الطعام رقم 12 في الكافتيريا',
    date: '2026-08-29T13:00:00.000Z',
    color: 'بني',
    description: 'حلقة مفاتيح تضم مفتاحين أحدهما فضي والآخر نحاسي مع قطعة جلد.',
    secretQuestion: 'كم عدد المفاتيح وما لون القطعة الجلدية؟',
    secretAnswer: 'مفتاحين وميدالية بنية',
    custody: 'at_office',
    status: 'reunited',
    reunitedAt: '2026-08-29T16:00:00.000Z',
    reportedBy: DEMO_USERS[1], // Moshira
    createdAt: '2026-08-29T13:00:00.000Z',
  },

  // 8. LOST PENCIL CASE
  {
    id: 'item_lost_pencil_case',
    title: 'مقلمة مدرسية كحلية بسحاب برتقالي',
    type: 'lost',
    category: 'stationery',
    locationId: 'classrooms_g1',
    locationDetails: 'في فصل 10-ب تحت المقعد الثاني',
    date: '2026-08-29T12:00:00.000Z',
    color: 'كحلي',
    description: 'مقلمة قماشية تضم أقلام رصاص وألوان مائية ومسطرة 20 سم.',
    status: 'open',
    reportedBy: {
      id: 'student_omar',
      name: 'عمر التميمي',
      email: 'omar.t@school.edu',
      role: 'student',
      grade: 'الصف العاشر - ب',
      avatar: '',
      returnedCount: 0,
      isTrusted: false,
      goodwillPoints: 10,
    },
    createdAt: '2026-08-29T12:00:00.000Z',
  },

  // 9. FOUND BACKPACK
  {
    id: 'item_found_backpack',
    title: 'حقيبة ظهر مدرسية سوداء',
    type: 'found',
    category: 'bags',
    locationId: 'prayer_room',
    locationDetails: 'عند رف الأحذية في المصلى المدرسي',
    date: '2026-08-28T14:00:00.000Z',
    color: 'أسود',
    description: 'حقيبة ظهر مقاس متوسط بها جيوب جانبية لمطارة الماء.',
    secretQuestion: 'ما اسم الكتاب الموجود داخل الجيب الرئيسي؟',
    secretAnswer: 'كتاب الأحياء للصف الحادي عشر',
    custody: 'at_office',
    status: 'open',
    reportedBy: DEMO_USERS[1], // Moshira
    createdAt: '2026-08-28T14:00:00.000Z',
  },

  // 10. FOUND USB DRIVE
  {
    id: 'item_found_usb',
    title: 'ذاكرة فلاش USB سعة 64GB',
    type: 'found',
    category: 'electronics',
    locationId: 'computer_lab',
    locationDetails: 'مركبة في جهاز الحاسوب رقم 7 في معمل التقنية',
    date: '2026-08-29T14:30:00.000Z',
    color: 'أخضر',
    brand: 'SanDisk',
    description: 'فلاش ميموري بلون أخضر زمردي وهيكل معدني.',
    secretQuestion: 'ما اسم المجلد الرئيسي داخل الفلاش؟',
    secretAnswer: 'مشروع التخرج 2026',
    custody: 'with_finder',
    status: 'open',
    reportedBy: {
      id: 'student_finder_sara',
      name: 'سارة القحطاني',
      email: 'sara.q@school.edu',
      role: 'student',
      grade: 'الصف العاشر - أ',
      avatar: '',
      returnedCount: 3,
      isTrusted: true,
      goodwillPoints: 90,
    },
    createdAt: '2026-08-29T14:30:00.000Z',
  },

  // 11. FOUND SCHOOL ID
  {
    id: 'item_found_school_id',
    title: 'بطاقة هوية مدرسية ذكية للطالب فهد',
    type: 'found',
    category: 'wallets_cards',
    locationId: 'cafeteria',
    locationDetails: 'قرب ماكينة الدفع في الكافتيريا',
    date: '2026-08-29T17:00:00.000Z',
    color: 'أبيض',
    description: 'بطاقة مدرسية ذكية للعام الحالي تحتوي على الشريحة الذكية.',
    secretQuestion: 'ما هو الرقم التعريفي الأخير في البطاقة؟',
    secretAnswer: '4826',
    custody: 'at_office',
    status: 'open',
    reportedBy: DEMO_USERS[1], // Moshira
    createdAt: '2026-08-29T17:00:00.000Z',
  },
];
