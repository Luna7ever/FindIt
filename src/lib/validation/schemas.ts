import { z } from 'zod';

export const ItemCategoryEnum = z.enum([
  'electronics',
  'stationery',
  'books',
  'bottles',
  'keys',
  'bags',
  'clothing',
  'wallets_cards',
  'sports',
  'personal',
]);

export const SchoolLocationIdEnum = z.enum([
  'science_lab',
  'library',
  'cafeteria',
  'gym',
  'playground',
  'classrooms_g1',
  'classrooms_g2',
  'computer_lab',
  'admin_office',
  'prayer_room',
]);

export const ItemTypeEnum = z.enum(['lost', 'found']);
export const ItemStatusEnum = z.enum(['open', 'matched', 'claimed', 'reunited', 'archived']);
export const CustodyStatusEnum = z.enum(['with_finder', 'at_office']);
export const UserRoleEnum = z.enum(['student', 'admin']);
export const ClaimStatusEnum = z.enum(['pending', 'approved', 'rejected', 'completed']);

// 1. Item Creation Schema
export const ItemCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'يجب أن يحتوي اسم الغرض على حرفين على الأقل')
    .max(100, 'اسم الغرض طويل جداً (الحد الأقصى 100 حرف)'),
  type: ItemTypeEnum,
  category: ItemCategoryEnum,
  locationId: SchoolLocationIdEnum,
  locationDetails: z
    .string()
    .trim()
    .max(150, 'تفاصيل الموقع طويلة جداً (الحد الأقصى 150 حرف)')
    .optional(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/, 'تاريخ غير صالح'),
  color: z
    .string()
    .trim()
    .min(1, 'يرجى تحديد اللون')
    .max(30, 'اسم اللون طويل جداً'),
  brand: z
    .string()
    .trim()
    .max(50, 'اسم الماركة طويل جداً')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'الوصف طويل جداً (الحد الأقصى 500 حرف)')
    .default('لا يوجد وصف إضافي'),
  imageUrl: z
    .string()
    .url('رابط الصورة غير صالح')
    .max(500)
    .optional(),
  secretQuestion: z
    .string()
    .trim()
    .max(150, 'السؤال السري طويل جداً')
    .optional(),
  secretAnswer: z
    .string()
    .trim()
    .max(150, 'الإجابة السرية طويلة جداً')
    .optional(),
  custody: CustodyStatusEnum.optional(),
});

export type ItemCreateInput = z.infer<typeof ItemCreateSchema>;

// 2. Claim Submission Schema
export const ClaimCreateSchema = z.object({
  itemId: z.string().trim().min(1, 'معرف الغرض مطلوب'),
  answerText: z
    .string()
    .trim()
    .min(2, 'يرجى كتابة إجابة تفصيلية لا تقل عن حرفين')
    .max(300, 'الإجابة طويلة جداً (الحد الأقصى 300 حرف)'),
});

export type ClaimCreateInput = z.infer<typeof ClaimCreateSchema>;

// 3. Handover PIN Verification Schema
export const HandoverVerifySchema = z.object({
  claimId: z.string().trim().min(1, 'معرف طلب الاسترداد مطلوب'),
  pin: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'رمز PIN يجب أن يتكون من 4 أرقام بالضبط'),
});

export type HandoverVerifyInput = z.infer<typeof HandoverVerifySchema>;

// 4. Query / Discovery Search Filter Schema
export const ItemQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: ItemTypeEnum.optional(),
  category: ItemCategoryEnum.optional(),
  locationId: SchoolLocationIdEnum.optional(),
  status: ItemStatusEnum.optional(),
  q: z.string().trim().max(100).optional(),
});

export type ItemQueryInput = z.infer<typeof ItemQuerySchema>;
