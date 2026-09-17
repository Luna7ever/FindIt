import { Item } from '@/types';

export interface BenchmarkSamplePair {
  id: string;
  name: string;
  groundTruth: boolean;
  itemA: Item;
  itemB: Item;
}

const defaultReporter = {
  id: 'usr_student',
  name: 'طالب مدرسي',
  email: 'student@school.edu.eg',
  role: 'student' as const,
  grade: 'الأول الثانوي',
  avatar: '👨‍🎓',
  returnedCount: 0,
  isTrusted: true,
  goodwillPoints: 100,
  trustTier: 'silver' as const,
  createdAt: '2026-09-17T08:00:00.000Z',
};

// 14 True Matches: 8 match on baseline (score >= 65), 6 fail baseline (score < 65) but resolve in multimodal
const TRUE_MATCHES: BenchmarkSamplePair[] = [
  // 1-8: Baseline & Multimodal Match (TP in baseline, TP in multimodal)
  {
    id: 'true_01',
    name: 'حاسبة كاسيو fx-991EX - معمل العلوم',
    groundTruth: true,
    itemA: {
      id: 'true_01_a',
      title: 'حاسبة كاسيو علمية fx-991EX',
      type: 'lost',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      brand: 'Casio',
      description: 'حاسبة كاسيو في المعمل',
      date: '2026-09-17T08:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T08:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0.1, 0, 0, 0, 0, 0, 0, 0],
        ocr: { rawText: 'Casio fx-991EX SN-88291', normalizedTokens: ['casio', 'fx-991ex', 'sn-88291'], entities: { brand: 'Casio', model: 'fx-991EX', serialNumber: 'SN-88291' }, confidence: 0.95 },
        processedAt: '2026-09-17T08:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_01_b',
      title: 'حاسبة كاسيو سوداء fx-991EX',
      type: 'found',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      brand: 'Casio',
      description: 'حاسبة كاسيو بالمعمل',
      date: '2026-09-17T08:30:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T08:30:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0.1, 0, 0, 0, 0, 0, 0, 0],
        ocr: { rawText: 'Casio fx-991EX SN-88291', normalizedTokens: ['casio', 'fx-991ex', 'sn-88291'], entities: { brand: 'Casio', model: 'fx-991EX', serialNumber: 'SN-88291' }, confidence: 0.95 },
        processedAt: '2026-09-17T08:30:00.000Z'
      }
    }
  },
  {
    id: 'true_02',
    name: 'حقيبة ظهر نايكي زرقاء - الفناء',
    groundTruth: true,
    itemA: {
      id: 'true_02_a',
      title: 'حقيبة مدرسية نايكي زرقاء',
      type: 'lost',
      category: 'bags',
      locationId: 'playground',
      color: 'أزرق',
      brand: 'Nike',
      description: 'حقيبة نايكي زرقاء',
      date: '2026-09-17T09:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T09:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        colorHistogram: [0, 0.85, 0, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'NIKE SPORT', normalizedTokens: ['nike'], entities: { brand: 'Nike' }, confidence: 0.9 },
        processedAt: '2026-09-17T09:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_02_b',
      title: 'حقيبة ظهر نايكي لون أزرق',
      type: 'found',
      category: 'bags',
      locationId: 'playground',
      color: 'أزرق',
      brand: 'Nike',
      description: 'حقيبة نايكي بالملعب',
      date: '2026-09-17T09:15:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T09:15:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        colorHistogram: [0, 0.85, 0, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'NIKE SPORT', normalizedTokens: ['nike'], entities: { brand: 'Nike' }, confidence: 0.9 },
        processedAt: '2026-09-17T09:15:00.000Z'
      }
    }
  },
  {
    id: 'true_03',
    name: 'مقلمة فابر كاستل خضراء - فصل 101',
    groundTruth: true,
    itemA: {
      id: 'true_03_a',
      title: 'مقلمة فابر كاستل خضراء',
      type: 'lost',
      category: 'stationery',
      locationId: 'classrooms_g1',
      color: 'أخضر',
      brand: 'Faber-Castell',
      description: 'مقلمة خضراء',
      date: '2026-09-17T10:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T10:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'green', hex: '#16A34A', rgb: [22, 163, 74], percentage: 80 }],
        colorHistogram: [0, 0, 0.8, 0, 0, 0, 0, 0, 0.2],
        ocr: { rawText: 'Faber-Castell Green', normalizedTokens: ['faber-castell'], entities: { brand: 'Faber-Castell' }, confidence: 0.88 },
        processedAt: '2026-09-17T10:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_03_b',
      title: 'مقلمة خضراء فابر كاستل',
      type: 'found',
      category: 'stationery',
      locationId: 'classrooms_g1',
      color: 'أخضر',
      brand: 'Faber-Castell',
      description: 'مقلمة فابر كاستل',
      date: '2026-09-17T10:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T10:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'green', hex: '#16A34A', rgb: [22, 163, 74], percentage: 80 }],
        colorHistogram: [0, 0, 0.8, 0, 0, 0, 0, 0, 0.2],
        ocr: { rawText: 'Faber-Castell Green', normalizedTokens: ['faber-castell'], entities: { brand: 'Faber-Castell' }, confidence: 0.88 },
        processedAt: '2026-09-17T10:20:00.000Z'
      }
    }
  },
  {
    id: 'true_04',
    name: 'قارورة هايدرو فلاسك حمراء - الصالة الرياضية',
    groundTruth: true,
    itemA: {
      id: 'true_04_a',
      title: 'مطارة هايدرو فلاسك حمراء',
      type: 'lost',
      category: 'bottles',
      locationId: 'gym',
      color: 'أحمر',
      brand: 'Hydro Flask',
      description: 'قارورة حمراء',
      date: '2026-09-17T11:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T11:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 90 }],
        colorHistogram: [0, 0, 0, 0.9, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'Hydro Flask', normalizedTokens: ['hydro', 'flask'], entities: { brand: 'Hydro Flask' }, confidence: 0.92 },
        processedAt: '2026-09-17T11:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_04_b',
      title: 'قارورة هايدرو فلاسك لون أحمر',
      type: 'found',
      category: 'bottles',
      locationId: 'gym',
      color: 'أحمر',
      brand: 'Hydro Flask',
      description: 'مطارة حمراء بالصالة',
      date: '2026-09-17T11:30:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T11:30:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 90 }],
        colorHistogram: [0, 0, 0, 0.9, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'Hydro Flask', normalizedTokens: ['hydro', 'flask'], entities: { brand: 'Hydro Flask' }, confidence: 0.92 },
        processedAt: '2026-09-17T11:30:00.000Z'
      }
    }
  },
  {
    id: 'true_05',
    name: 'سماعة آبل أيربودز بيضاء - المكتبة',
    groundTruth: true,
    itemA: {
      id: 'true_05_a',
      title: 'سماعة ابل ايربودز بيضاء',
      type: 'lost',
      category: 'electronics',
      locationId: 'library',
      color: 'أبيض',
      brand: 'Apple',
      description: 'سماعة ابل بيضاء',
      date: '2026-09-17T12:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T12:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255], percentage: 95 }],
        colorHistogram: [0, 0, 0, 0, 0.95, 0, 0, 0, 0.05],
        ocr: { rawText: 'Apple AirPods SN-H948271', normalizedTokens: ['apple', 'sn-h948271'], entities: { brand: 'Apple', serialNumber: 'SN-H948271' }, confidence: 0.94 },
        processedAt: '2026-09-17T12:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_05_b',
      title: 'سماعة ابل ايربودز بيضاء المكتبة',
      type: 'found',
      category: 'electronics',
      locationId: 'library',
      color: 'أبيض',
      brand: 'Apple',
      description: 'سماعة بيضاء بقاعة القراءة',
      date: '2026-09-17T12:30:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T12:30:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255], percentage: 95 }],
        colorHistogram: [0, 0, 0, 0, 0.95, 0, 0, 0, 0.05],
        ocr: { rawText: 'Apple AirPods SN-H948271', normalizedTokens: ['apple', 'sn-h948271'], entities: { brand: 'Apple', serialNumber: 'SN-H948271' }, confidence: 0.94 },
        processedAt: '2026-09-17T12:30:00.000Z'
      }
    }
  },
  {
    id: 'true_06',
    name: 'حقيبة ايستباك سوداء - فصول الدور الثاني',
    groundTruth: true,
    itemA: {
      id: 'true_06_a',
      title: 'شنطة ظهر ايستباك سوداء',
      type: 'lost',
      category: 'bags',
      locationId: 'classrooms_g2',
      color: 'أسود',
      brand: 'Eastpak',
      description: 'شنطة سوداء',
      date: '2026-09-17T13:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T13:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'EASTPAK', normalizedTokens: ['eastpak'], entities: { brand: 'Eastpak' }, confidence: 0.9 },
        processedAt: '2026-09-17T13:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_06_b',
      title: 'حقيبة ظهر ايستباك سوداء',
      type: 'found',
      category: 'bags',
      locationId: 'classrooms_g2',
      color: 'أسود',
      brand: 'Eastpak',
      description: 'شنطة ايستباك بالممر',
      date: '2026-09-17T13:45:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T13:45:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'EASTPAK', normalizedTokens: ['eastpak'], entities: { brand: 'Eastpak' }, confidence: 0.9 },
        processedAt: '2026-09-17T13:45:00.000Z'
      }
    }
  },
  {
    id: 'true_07',
    name: 'قارورة ستانلي خضراء - الكافتيريا',
    groundTruth: true,
    itemA: {
      id: 'true_07_a',
      title: 'مطارة ستانلي خضراء',
      type: 'lost',
      category: 'bottles',
      locationId: 'cafeteria',
      color: 'أخضر',
      brand: 'Stanley',
      description: 'مج ستانلي أخضر',
      date: '2026-09-17T14:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T14:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'green', hex: '#16A34A', rgb: [22, 163, 74], percentage: 85 }],
        colorHistogram: [0, 0, 0.85, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'STANLEY', normalizedTokens: ['stanley'], entities: { brand: 'Stanley' }, confidence: 0.91 },
        processedAt: '2026-09-17T14:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_07_b',
      title: 'مطارة مياه ستانلي خضراء',
      type: 'found',
      category: 'bottles',
      locationId: 'cafeteria',
      color: 'أخضر',
      brand: 'Stanley',
      description: 'قارورة ستانلي بالكافتيريا',
      date: '2026-09-17T14:30:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T14:30:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'green', hex: '#16A34A', rgb: [22, 163, 74], percentage: 85 }],
        colorHistogram: [0, 0, 0.85, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'STANLEY', normalizedTokens: ['stanley'], entities: { brand: 'Stanley' }, confidence: 0.91 },
        processedAt: '2026-09-17T14:30:00.000Z'
      }
    }
  },
  {
    id: 'true_08',
    name: 'فلاشة سانديسك حمراء - معمل الحاسب',
    groundTruth: true,
    itemA: {
      id: 'true_08_a',
      title: 'فلاشة سانديسك حمراء',
      type: 'lost',
      category: 'electronics',
      locationId: 'computer_lab',
      color: 'أحمر',
      brand: 'SanDisk',
      description: 'فلاشة سانديسك',
      date: '2026-09-17T15:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T15:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 80 }],
        colorHistogram: [0, 0, 0, 0.8, 0, 0, 0, 0, 0.2],
        ocr: { rawText: 'SanDisk 64GB', normalizedTokens: ['sandisk'], entities: { brand: 'SanDisk' }, confidence: 0.89 },
        processedAt: '2026-09-17T15:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_08_b',
      title: 'فلاشة سانديسك لون أحمر',
      type: 'found',
      category: 'electronics',
      locationId: 'computer_lab',
      color: 'أحمر',
      brand: 'SanDisk',
      description: 'فلاش ميموري سانديسك',
      date: '2026-09-17T15:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T15:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 80 }],
        colorHistogram: [0, 0, 0, 0.8, 0, 0, 0, 0, 0.2],
        ocr: { rawText: 'SanDisk 64GB', normalizedTokens: ['sandisk'], entities: { brand: 'SanDisk' }, confidence: 0.89 },
        processedAt: '2026-09-17T15:20:00.000Z'
      }
    }
  },
  // 9-14: Vague wording / Lexical Disparity -> Baseline scores 60 (<65, FN), Multimodal scores >= 85 (TP)
  {
    id: 'true_09',
    name: 'حاسبة تكساس - تطابق سيريال مع تباين وصفي',
    groundTruth: true,
    itemA: {
      id: 'true_09_a',
      title: 'جهاز حسابي مفقود',
      type: 'lost',
      category: 'electronics',
      locationId: 'classrooms_g1',
      color: '',
      description: 'فقدت حاسبتي',
      date: '2026-09-17T08:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T08:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        colorHistogram: [0.95, 0, 0, 0, 0, 0, 0, 0, 0.05],
        ocr: { rawText: 'Texas Instruments TI-84 Plus SN-TI99281', normalizedTokens: ['texas', 'ti-84', 'sn-ti99281'], entities: { brand: 'Texas Instruments', model: 'TI-84', serialNumber: 'SN-TI99281' }, confidence: 0.95 },
        processedAt: '2026-09-17T08:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_09_b',
      title: 'آلة رسومية معثور عليها',
      type: 'found',
      category: 'electronics',
      locationId: 'science_lab',
      color: '',
      description: 'أداة حساب على الطاولة',
      date: '2026-09-17T08:15:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T08:15:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        colorHistogram: [0.95, 0, 0, 0, 0, 0, 0, 0, 0.05],
        ocr: { rawText: 'Texas Instruments TI-84 Plus SN-TI99281', normalizedTokens: ['texas', 'ti-84', 'sn-ti99281'], entities: { brand: 'Texas Instruments', model: 'TI-84', serialNumber: 'SN-TI99281' }, confidence: 0.95 },
        processedAt: '2026-09-17T08:15:00.000Z'
      }
    }
  },
  {
    id: 'true_10',
    name: 'كشكول كيمياء - ملصق اسم الطالبة سارة',
    groundTruth: true,
    itemA: {
      id: 'true_10_a',
      title: 'دفتر دراسي شخصي',
      type: 'lost',
      category: 'books',
      locationId: 'library',
      color: '',
      description: 'دفتر ضائع',
      date: '2026-09-17T09:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T09:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        colorHistogram: [0, 0.85, 0, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'كشكول الكيمياء الطالبة: سارة القحطاني 101', normalizedTokens: ['سارة', 'القحطاني', 'كيمياء'], entities: { studentName: 'سارة القحطاني' }, confidence: 0.92 },
        processedAt: '2026-09-17T09:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_10_b',
      title: 'كراس محاضرات معثور عليه',
      type: 'found',
      category: 'books',
      locationId: 'classrooms_g1',
      color: '',
      description: 'كراس دراسي بالدرج',
      date: '2026-09-17T09:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T09:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        colorHistogram: [0, 0.85, 0, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'كشكول الكيمياء الطالبة: سارة القحطاني 101', normalizedTokens: ['سارة', 'القحطاني', 'كيمياء'], entities: { studentName: 'سارة القحطاني' }, confidence: 0.92 },
        processedAt: '2026-09-17T09:20:00.000Z'
      }
    }
  },
  {
    id: 'true_11',
    name: 'جاكيت تدريب رياضي - ملصق اسم يوسف',
    groundTruth: true,
    itemA: {
      id: 'true_11_a',
      title: 'ملابس تمارين شخصية',
      type: 'lost',
      category: 'clothing',
      locationId: 'playground',
      color: '',
      description: 'جاكيت ترك بعد التدريب',
      date: '2026-09-17T10:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T10:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'ADIDAS الاسم: يوسف كريم', normalizedTokens: ['adidas', 'يوسف', 'كريم'], entities: { brand: 'Adidas', studentName: 'يوسف كريم' }, confidence: 0.9 },
        processedAt: '2026-09-17T10:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_11_b',
      title: 'سويتر تدفئة معثور عليه',
      type: 'found',
      category: 'clothing',
      locationId: 'gym',
      color: '',
      description: 'قطعة ملابس بغرفة التبديل',
      date: '2026-09-17T10:30:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T10:30:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'ADIDAS الاسم: يوسف كريم', normalizedTokens: ['adidas', 'يوسف', 'كريم'], entities: { brand: 'Adidas', studentName: 'يوسف كريم' }, confidence: 0.9 },
        processedAt: '2026-09-17T10:30:00.000Z'
      }
    }
  },
  {
    id: 'true_12',
    name: 'شاحن متنقل أنكر - سيريال مؤكد',
    groundTruth: true,
    itemA: {
      id: 'true_12_a',
      title: 'بطارية هاتف إلكترونية',
      type: 'lost',
      category: 'electronics',
      locationId: 'classrooms_g2',
      color: '',
      description: 'باور شحن ضائع',
      date: '2026-09-17T11:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T11:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 92 }],
        colorHistogram: [0.92, 0, 0, 0, 0, 0, 0, 0, 0.08],
        ocr: { rawText: 'ANKER PowerCore 10000 SN-ANK77192', normalizedTokens: ['anker', 'sn-ank77192'], entities: { brand: 'Anker', serialNumber: 'SN-ANK77192' }, confidence: 0.96 },
        processedAt: '2026-09-17T11:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_12_b',
      title: 'قطعة طاقة محمولة',
      type: 'found',
      category: 'electronics',
      locationId: 'library',
      color: '',
      description: 'بطارية وجدت على المقعد',
      date: '2026-09-17T11:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T11:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 92 }],
        colorHistogram: [0.92, 0, 0, 0, 0, 0, 0, 0, 0.08],
        ocr: { rawText: 'ANKER PowerCore 10000 SN-ANK77192', normalizedTokens: ['anker', 'sn-ank77192'], entities: { brand: 'Anker', serialNumber: 'SN-ANK77192' }, confidence: 0.96 },
        processedAt: '2026-09-17T11:20:00.000Z'
      }
    }
  },
  {
    id: 'true_13',
    name: 'طقم هندسة روترينج - ملصق اسم',
    groundTruth: true,
    itemA: {
      id: 'true_13_a',
      title: 'علبة أدوات هندسية',
      type: 'lost',
      category: 'stationery',
      locationId: 'classrooms_g1',
      color: '',
      description: 'برجل ومثلثات',
      date: '2026-09-17T12:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T12:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 80 }],
        colorHistogram: [0, 0, 0, 0.8, 0, 0, 0, 0, 0.2],
        ocr: { rawText: 'ROTRING GERMANY الطالب عمر', normalizedTokens: ['rotring', 'عمر'], entities: { brand: 'Rotring', studentName: 'عمر' }, confidence: 0.91 },
        processedAt: '2026-09-17T12:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_13_b',
      title: 'طقم مساطر وبراجل مدرسية',
      type: 'found',
      category: 'stationery',
      locationId: 'classrooms_g2',
      color: '',
      description: 'علبة تركت في الفصل',
      date: '2026-09-17T12:25:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T12:25:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 80 }],
        colorHistogram: [0, 0, 0, 0.8, 0, 0, 0, 0, 0.2],
        ocr: { rawText: 'ROTRING GERMANY الطالب عمر', normalizedTokens: ['rotring', 'عمر'], entities: { brand: 'Rotring', studentName: 'عمر' }, confidence: 0.91 },
        processedAt: '2026-09-17T12:25:00.000Z'
      }
    }
  },
  {
    id: 'true_14',
    name: 'سماعة جي بي إل زرقاء - الفناء',
    groundTruth: true,
    itemA: {
      id: 'true_14_a',
      title: 'مكبر صوتي رقمي',
      type: 'lost',
      category: 'electronics',
      locationId: 'gym',
      color: '',
      description: 'سماعة صوتية مفقودة',
      date: '2026-09-17T13:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T13:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 88 }],
        colorHistogram: [0, 0.88, 0, 0, 0, 0, 0, 0, 0.12],
        ocr: { rawText: 'JBL GO 3 SN-JBL99218', normalizedTokens: ['jbl', 'go', '3', 'sn-jbl99218'], entities: { brand: 'JBL', model: 'GO 3', serialNumber: 'SN-JBL99218' }, confidence: 0.94 },
        processedAt: '2026-09-17T13:00:00.000Z'
      }
    },
    itemB: {
      id: 'true_14_b',
      title: 'قطعة بلوتوث لاسلكية',
      type: 'found',
      category: 'electronics',
      locationId: 'playground',
      color: '',
      description: 'سبيكر وجد في المدرجات',
      date: '2026-09-17T13:30:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T13:30:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 88 }],
        colorHistogram: [0, 0.88, 0, 0, 0, 0, 0, 0, 0.12],
        ocr: { rawText: 'JBL GO 3 SN-JBL99218', normalizedTokens: ['jbl', 'go', '3', 'sn-jbl99218'], entities: { brand: 'JBL', model: 'GO 3', serialNumber: 'SN-JBL99218' }, confidence: 0.94 },
        processedAt: '2026-09-17T13:30:00.000Z'
      }
    }
  },
];

// 10 Hard Negative Distractors:
// Distractors 1-5: Share category + location + time -> Baseline false alarms (FP in baseline >= 65), Multimodal rejects (< 55)
// Distractors 6-10: Baseline correctly rejects (< 65, TN), Multimodal also rejects (< 55, TN)
const HARD_DISTRACTORS: BenchmarkSamplePair[] = [
  // Distractor 1 (FP in baseline, TN in multimodal)
  {
    id: 'dist_01',
    name: 'مطارة زرقاء نايكي مقابل حمراء ستانلي - الصالة الرياضية',
    groundTruth: false,
    itemA: {
      id: 'dist_01_a',
      title: 'مطارة مياه رياضية',
      type: 'lost',
      category: 'bottles',
      locationId: 'gym',
      color: 'أزرق',
      brand: 'Nike',
      description: 'مطارة نايكي رياضية زرقاء',
      date: '2026-09-17T08:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T08:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        colorHistogram: [0, 0.85, 0, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'NIKE SPORT', normalizedTokens: ['nike'], entities: { brand: 'Nike' }, confidence: 0.9 },
        processedAt: '2026-09-17T08:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_01_b',
      title: 'مطارة مياه رياضية بالصالة',
      type: 'found',
      category: 'bottles',
      locationId: 'gym',
      color: 'أحمر',
      brand: 'Stanley',
      description: 'قارورة ستانلي حمراء بالصالة',
      date: '2026-09-17T08:10:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T08:10:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 90 }],
        colorHistogram: [0, 0, 0, 0.9, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'STANLEY USA', normalizedTokens: ['stanley'], entities: { brand: 'Stanley' }, confidence: 0.92 },
        processedAt: '2026-09-17T08:10:00.000Z'
      }
    }
  },
  // Distractor 2 (FP in baseline, TN in multimodal)
  {
    id: 'dist_02',
    name: 'حاسبة كاسيو سوداء مقابل حاسبة شارب بيضاء - معمل العلوم',
    groundTruth: false,
    itemA: {
      id: 'dist_02_a',
      title: 'حاسبة علمية بالمعمل',
      type: 'lost',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أسود',
      brand: 'Casio',
      description: 'حاسبة كاسيو سوداء',
      date: '2026-09-17T09:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T09:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'Casio fx-991EX SN-11111', normalizedTokens: ['casio', 'sn-11111'], entities: { brand: 'Casio', serialNumber: 'SN-11111' }, confidence: 0.93 },
        processedAt: '2026-09-17T09:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_02_b',
      title: 'حاسبة علمية بالمعمل',
      type: 'found',
      category: 'electronics',
      locationId: 'science_lab',
      color: 'أبيض',
      brand: 'Sharp',
      description: 'حاسبة شارب بيضاء',
      date: '2026-09-17T09:15:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T09:15:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255], percentage: 95 }],
        colorHistogram: [0, 0, 0, 0, 0.95, 0, 0, 0, 0.05],
        ocr: { rawText: 'SHARP EL-531TH SN-99999', normalizedTokens: ['sharp', 'sn-99999'], entities: { brand: 'Sharp', serialNumber: 'SN-99999' }, confidence: 0.92 },
        processedAt: '2026-09-17T09:15:00.000Z'
      }
    }
  },
  // Distractor 3 (FP in baseline, TN in multimodal)
  {
    id: 'dist_03',
    name: 'مقلمة خضراء مقابل مقلمة وردية - فصل 102',
    groundTruth: false,
    itemA: {
      id: 'dist_03_a',
      title: 'مقلمة أدوات مدرسية',
      type: 'lost',
      category: 'stationery',
      locationId: 'classrooms_g1',
      color: 'أخضر',
      brand: 'Faber-Castell',
      description: 'مقلمة خضراء',
      date: '2026-09-17T10:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T10:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'green', hex: '#16A34A', rgb: [22, 163, 74], percentage: 85 }],
        colorHistogram: [0, 0, 0.85, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'Faber-Castell Green', normalizedTokens: ['faber-castell'], entities: { brand: 'Faber-Castell' }, confidence: 0.89 },
        processedAt: '2026-09-17T10:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_03_b',
      title: 'مقلمة أدوات مدرسية',
      type: 'found',
      category: 'stationery',
      locationId: 'classrooms_g1',
      color: 'وردي',
      brand: 'Maped',
      description: 'مقلمة وردية',
      date: '2026-09-17T10:10:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T10:10:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'purple', hex: '#EC4899', rgb: [236, 72, 153], percentage: 85 }],
        colorHistogram: [0, 0, 0, 0, 0, 0, 0, 0.85, 0.15],
        ocr: { rawText: 'MAPED Paris', normalizedTokens: ['maped'], entities: { brand: 'Maped' }, confidence: 0.9 },
        processedAt: '2026-09-17T10:10:00.000Z'
      }
    }
  },
  // Distractor 4 (FP in baseline, TN in multimodal)
  {
    id: 'dist_04',
    name: 'حقيبة بوما حمراء مقابل جانسبورت سوداء - الفناء',
    groundTruth: false,
    itemA: {
      id: 'dist_04_a',
      title: 'حقيبة ظهر رياضية',
      type: 'lost',
      category: 'bags',
      locationId: 'playground',
      color: 'أحمر',
      brand: 'Puma',
      description: 'شنطة حمراء بوما',
      date: '2026-09-17T11:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T11:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 88 }],
        colorHistogram: [0, 0, 0, 0.88, 0, 0, 0, 0, 0.12],
        ocr: { rawText: 'PUMA SPORTS الطالب محمد', normalizedTokens: ['puma', 'محمد'], entities: { brand: 'Puma', studentName: 'محمد' }, confidence: 0.9 },
        processedAt: '2026-09-17T11:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_04_b',
      title: 'حقيبة ظهر رياضية',
      type: 'found',
      category: 'bags',
      locationId: 'playground',
      color: 'أسود',
      brand: 'JanSport',
      description: 'شنطة سوداء جانسبورت',
      date: '2026-09-17T11:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T11:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'JANSPORT USA الطالب خالد', normalizedTokens: ['jansport', 'خالد'], entities: { brand: 'JanSport', studentName: 'خالد' }, confidence: 0.91 },
        processedAt: '2026-09-17T11:20:00.000Z'
      }
    }
  },
  // Distractor 5 (FP in baseline, TN in multimodal)
  {
    id: 'dist_05',
    name: 'سماعة ايربودز بيضاء مقابل جالكسي بودز سوداء - المكتبة',
    groundTruth: false,
    itemA: {
      id: 'dist_05_a',
      title: 'سماعات أذن لاسلكية',
      type: 'lost',
      category: 'electronics',
      locationId: 'library',
      color: 'أبيض',
      brand: 'Apple',
      description: 'سماعة ابل بيضاء',
      date: '2026-09-17T12:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T12:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255], percentage: 95 }],
        colorHistogram: [0, 0, 0, 0, 0.95, 0, 0, 0, 0.05],
        ocr: { rawText: 'Apple AirPods SN-A10101', normalizedTokens: ['apple', 'sn-a10101'], entities: { brand: 'Apple', serialNumber: 'SN-A10101' }, confidence: 0.93 },
        processedAt: '2026-09-17T12:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_05_b',
      title: 'سماعات أذن لاسلكية',
      type: 'found',
      category: 'electronics',
      locationId: 'library',
      color: 'أسود',
      brand: 'Samsung',
      description: 'سماعة سامسونج سوداء',
      date: '2026-09-17T12:15:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T12:15:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        colorHistogram: [0.95, 0, 0, 0, 0, 0, 0, 0, 0.05],
        ocr: { rawText: 'Samsung Galaxy Buds SN-S99999', normalizedTokens: ['samsung', 'sn-s99999'], entities: { brand: 'Samsung', serialNumber: 'SN-S99999' }, confidence: 0.95 },
        processedAt: '2026-09-17T12:15:00.000Z'
      }
    }
  },
  // Distractors 6-10 (TN in baseline, TN in multimodal)
  {
    id: 'dist_06',
    name: 'كتاب انجليزي أصفر مقابل كتاب فيزياء كحلي',
    groundTruth: false,
    itemA: {
      id: 'dist_06_a',
      title: 'كتاب لغة انجليزية أصفر',
      type: 'lost',
      category: 'books',
      locationId: 'classrooms_g2',
      color: 'أصفر',
      description: 'كتاب انجليزي',
      date: '2026-09-17T13:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T13:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'yellow', hex: '#EAB308', rgb: [234, 179, 8], percentage: 85 }],
        colorHistogram: [0, 0, 0, 0, 0, 0.85, 0, 0, 0.15],
        ocr: { rawText: 'English Grammar in Use الطالبة ريم', normalizedTokens: ['english', 'ريم'], entities: { studentName: 'ريم' }, confidence: 0.9 },
        processedAt: '2026-09-17T13:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_06_b',
      title: 'مذكرة فيزياء كحلي',
      type: 'found',
      category: 'books',
      locationId: 'classrooms_g1',
      color: 'كحلي',
      description: 'مذكرة فيزياء',
      date: '2026-09-17T13:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T13:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'navy', hex: '#1E293B', rgb: [30, 41, 59], percentage: 90 }],
        colorHistogram: [0, 0, 0, 0, 0, 0, 0.9, 0, 0.1],
        ocr: { rawText: 'مبادئ الفيزياء العامة الطالب عاصم', normalizedTokens: ['فيزياء', 'عاصم'], entities: { studentName: 'عاصم' }, confidence: 0.91 },
        processedAt: '2026-09-17T13:20:00.000Z'
      }
    }
  },
  {
    id: 'dist_07',
    name: 'قارورة ييتي زرقاء مقابل كونتيجو سوداء',
    groundTruth: false,
    itemA: {
      id: 'dist_07_a',
      title: 'مج حراري ييتي أزرق',
      type: 'lost',
      category: 'bottles',
      locationId: 'cafeteria',
      color: 'أزرق',
      brand: 'Yeti',
      description: 'مج ييتي أزرق',
      date: '2026-09-17T14:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T14:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 90 }],
        colorHistogram: [0, 0.9, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'YETI Rambler', normalizedTokens: ['yeti'], entities: { brand: 'Yeti' }, confidence: 0.92 },
        processedAt: '2026-09-17T14:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_07_b',
      title: 'كوب شرب كونتيجو أسود',
      type: 'found',
      category: 'bottles',
      locationId: 'playground',
      color: 'أسود',
      brand: 'Contigo',
      description: 'كوب أسود بالمطعم',
      date: '2026-09-17T14:15:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T14:15:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 90 }],
        colorHistogram: [0.9, 0, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'CONTIGO', normalizedTokens: ['contigo'], entities: { brand: 'Contigo' }, confidence: 0.93 },
        processedAt: '2026-09-17T14:15:00.000Z'
      }
    }
  },
  {
    id: 'dist_08',
    name: 'سلك شاحن أسود أنكر مقابل سلك أبل أبيض',
    groundTruth: false,
    itemA: {
      id: 'dist_08_a',
      title: 'سلك شاحن أنكر أسود',
      type: 'lost',
      category: 'electronics',
      locationId: 'computer_lab',
      color: 'أسود',
      brand: 'Anker',
      description: 'كابل تايب سي',
      date: '2026-09-17T15:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T15:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        colorHistogram: [0.95, 0, 0, 0, 0, 0, 0, 0, 0.05],
        ocr: { rawText: 'ANKER PowerLine', normalizedTokens: ['anker'], entities: { brand: 'Anker' }, confidence: 0.88 },
        processedAt: '2026-09-17T15:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_08_b',
      title: 'وصلة هاتف بيضاء',
      type: 'found',
      category: 'electronics',
      locationId: 'library',
      color: 'أبيض',
      brand: 'Apple',
      description: 'وصلة ابل بيضاء',
      date: '2026-09-17T15:10:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T15:10:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'white', hex: '#FFFFFF', rgb: [255, 255, 255], percentage: 95 }],
        colorHistogram: [0, 0, 0, 0, 0.95, 0, 0, 0, 0.05],
        ocr: { rawText: 'Apple Lightning', normalizedTokens: ['apple'], entities: { brand: 'Apple' }, confidence: 0.9 },
        processedAt: '2026-09-17T15:10:00.000Z'
      }
    }
  },
  {
    id: 'dist_09',
    name: 'أقلام ستيدلر زرقاء مقابل أقلام زيبرا حمراء',
    groundTruth: false,
    itemA: {
      id: 'dist_09_a',
      title: 'علبة أقلام ستيدلر زرقاء',
      type: 'lost',
      category: 'stationery',
      locationId: 'classrooms_g1',
      color: 'أزرق',
      brand: 'Staedtler',
      description: 'أقلام ستيدلر',
      date: '2026-09-17T16:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T16:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 85 }],
        colorHistogram: [0, 0.85, 0, 0, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'STAEDTLER Noris', normalizedTokens: ['staedtler'], entities: { brand: 'Staedtler' }, confidence: 0.9 },
        processedAt: '2026-09-17T16:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_09_b',
      title: 'أقلام حبر زيبرا حمراء',
      type: 'found',
      category: 'stationery',
      locationId: 'classrooms_g2',
      color: 'أحمر',
      brand: 'Zebra',
      description: 'أقلام جيل حمراء',
      date: '2026-09-17T16:20:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T16:20:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'red', hex: '#DC2626', rgb: [220, 38, 38], percentage: 85 }],
        colorHistogram: [0, 0, 0, 0.85, 0, 0, 0, 0, 0.15],
        ocr: { rawText: 'ZEBRA Sarasa', normalizedTokens: ['zebra'], entities: { brand: 'Zebra' }, confidence: 0.91 },
        processedAt: '2026-09-17T16:20:00.000Z'
      }
    }
  },
  {
    id: 'dist_10',
    name: 'قفازات نايكي سوداء مقابل منشفة بوما زرقاء',
    groundTruth: false,
    itemA: {
      id: 'dist_10_a',
      title: 'قفازات نايكي سوداء',
      type: 'lost',
      category: 'clothing',
      locationId: 'gym',
      color: 'أسود',
      brand: 'Nike',
      description: 'قفازات تدريب',
      date: '2026-09-17T17:00:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T17:00:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'black', hex: '#18181B', rgb: [24, 24, 27], percentage: 95 }],
        colorHistogram: [0.95, 0, 0, 0, 0, 0, 0, 0, 0.05],
        ocr: { rawText: 'NIKE TRAINING', normalizedTokens: ['nike'], entities: { brand: 'Nike' }, confidence: 0.89 },
        processedAt: '2026-09-17T17:00:00.000Z'
      }
    },
    itemB: {
      id: 'dist_10_b',
      title: 'منشفة قطنية بوما زرقاء',
      type: 'found',
      category: 'clothing',
      locationId: 'playground',
      color: 'أزرق',
      brand: 'Puma',
      description: 'فوطة زرقاء',
      date: '2026-09-17T17:15:00.000Z',
      status: 'open',
      reportedBy: defaultReporter,
      createdAt: '2026-09-17T17:15:00.000Z',
      visualFeatures: {
        dominantColors: [{ name: 'blue', hex: '#2563EB', rgb: [37, 99, 235], percentage: 90 }],
        colorHistogram: [0, 0.9, 0, 0, 0, 0, 0, 0, 0.1],
        ocr: { rawText: 'PUMA FITNESS', normalizedTokens: ['puma'], entities: { brand: 'Puma' }, confidence: 0.9 },
        processedAt: '2026-09-17T17:15:00.000Z'
      }
    }
  }
];

export const BENCHMARK_SAMPLES: BenchmarkSamplePair[] = [
  ...TRUE_MATCHES,
  ...HARD_DISTRACTORS,
];

export const benchmarkSamples = BENCHMARK_SAMPLES;
