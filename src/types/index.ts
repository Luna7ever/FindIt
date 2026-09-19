export type UserRole = 'student' | 'admin';

export type ItemType = 'lost' | 'found';

export type ItemCategory = 
  | 'electronics' 
  | 'stationery' 
  | 'books' 
  | 'clothing' 
  | 'wallets_cards' 
  | 'sports' 
  | 'personal'
  | 'keys'
  | 'bags'
  | 'bottles';

export type ItemStatus = 'open' | 'matched' | 'claimed' | 'reunited' | 'archived';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type CustodyStatus = 'with_finder' | 'at_office';

export type SchoolLocationId = 
  | 'science_lab' 
  | 'library' 
  | 'cafeteria' 
  | 'gym' 
  | 'playground' 
  | 'classrooms_g1' 
  | 'classrooms_g2' 
  | 'admin_office' 
  | 'prayer_room'
  | 'computer_lab';

export interface SchoolLocation {
  id: SchoolLocationId;
  name: string;
  building: string;
  floor: string;
  icon: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade: string;
  avatar: string;
  returnedCount: number;
  isTrusted: boolean;
  goodwillPoints: number;
  integrityScenariosCompleted?: string[];
}

export interface DominantColor {
  name: string; // 'black', 'blue', 'red', 'green', 'white', etc.
  rgb: [number, number, number];
  hex: string;
  percentage: number; // 0 - 100
}

export interface ExtractedEntities {
  brand?: string;
  model?: string;
  serialNumber?: string;
  studentName?: string;
}

export interface OcrParsedResult {
  rawText: string;
  normalizedTokens: string[];
  entities: ExtractedEntities;
  confidence: number; // 0 - 1
}

export interface ShapeVector {
  aspectRatio: number;
  solidity: number;
  edgeComplexity: number;
}

export interface VisualFeatures {
  dominantColors: DominantColor[];
  colorHistogram: number[]; // 9-bin canonical color frequencies
  detectedText?: string;
  ocr?: OcrParsedResult;
  shape?: ShapeVector;
  processedAt: string;
}

export interface MultimodalSubScores {
  color: number;       // S_color (0 - 100)
  ocrText: number;     // S_text_ocr (0 - 100)
  category: number;    // S_category (0 - 100)
  location: number;    // S_location (0 - 100)
  temporal: number;    // S_temporal (0 - 100)
}

export interface MultimodalWeights {
  visual: number;      // default: 0.25
  ocr: number;         // default: 0.25
  category: number;    // default: 0.20
  location: number;    // default: 0.15
  temporal: number;    // default: 0.15
}

export interface Item {
  id: string;
  title: string;
  type: ItemType;
  category: ItemCategory;
  locationId: SchoolLocationId;
  locationDetails?: string;
  date: string;
  color: string;
  brand?: string;
  description: string;
  imageUrl?: string;
  secretQuestion?: string;
  secretAnswer?: string;
  custody?: CustodyStatus;
  status: ItemStatus;
  reportedBy: UserProfile;
  createdAt: string;
  updatedAt?: string;
  reunitedAt?: string;
  matchedItemId?: string;
  visualFeatures?: VisualFeatures;
  isAiVerified?: boolean;
}

export interface Claim {
  id: string;
  itemId: string;
  claimant: UserProfile;
  answerText: string;
  status: ClaimStatus;
  handoverPin: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface MatchScoreBreakdown {
  totalScore: number;
  categoryScore: number;
  locationScore: number;
  featuresScore: number;
  timeScore: number;
  matchReasons: string[];
  subScores?: MultimodalSubScores;
  weights?: MultimodalWeights;
  isMultimodal?: boolean;
}

export interface MatchResult {
  targetItem: Item;
  matchedItem: Item;
  breakdown: MatchScoreBreakdown;
}

export type TrustTier = 'bronze' | 'silver' | 'gold';

export interface IntegrityOption {
  id: string;
  text: string;
  score: number; // 100 for ideal, 50 for acceptable, 0 for unacceptable
  feedback: string;
  whyWrong?: string;
  correctActionText?: string;
}

export interface IntegrityQuestion {
  id: string;
  order: number;
  question: string;
  explanation: string;
  options: IntegrityOption[];
}

export interface ScenarioVisualDetails {
  locationBadge: string;
  roomLabel: string;
  promptNote: string;
  sceneImageUrl?: string;
}

export interface CharacterSpeaker {
  name: string;
  role: string;
  avatarEmoji: string;
  emotion: string;
}

export interface IntegrityScenario {
  id: string;
  title: string;
  topicTitle: string;
  shortDescription: string;
  detailedDilemma: string;
  dilemmaQuote: string;
  cognitiveBasis: string;
  visualDetails: ScenarioVisualDetails;
  characterSpeaker?: CharacterSpeaker;
  locationId: SchoolLocationId;
  videoUrl?: string;
  audioUrl?: string;
  duration: string;
  badgeName: string;
  pointsAwarded: number;
  questions: IntegrityQuestion[];
}

export interface IntegrityAttempt {
  id: string;
  studentId: string;
  scenarioId: string;
  scorePercentage: number;
  isPassed: boolean;
  attemptedAt: string;
  cooldownUntil?: string;
  answers: Record<string, string>; // questionId -> optionId
}

export type NotificationType = 'match' | 'claim' | 'points' | 'integrity' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface LeaderboardStudentEntry {
  rank: number;
  user: UserProfile;
  points: number;
  returnedCount: number;
  tier: TrustTier;
  scenariosCompletedCount: number;
}

export interface LeaderboardClassEntry {
  rank: number;
  grade: string;
  totalPoints: number;
  returnedCount: number;
  studentsCount: number;
}

export type AppLanguage = 'ar' | 'en';
export type AppTheme = 'system' | 'light' | 'dark';

// ========================================================
// SCHOOL ACTIVITIES & VOLUNTEERING SYSTEM
// ========================================================
export type ActivityCategory = 'volunteer' | 'integrity' | 'environment' | 'academic_support';
export type ActivityVerificationType = 'instant' | 'supervised';
export type ActivityStatus = 'pending' | 'approved' | 'rejected';

export interface SchoolActivity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  points: number;
  verificationType: ActivityVerificationType;
  iconName: string;
  badgeReward?: string;
  targetLocationId?: SchoolLocationId;
  estimatedMinutes: number;
  frequency: 'daily' | 'weekly' | 'once';
}

export interface ActivitySubmission {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userGrade: string;
  status: ActivityStatus;
  submittedAt: string;
  notes?: string;
  locationId?: SchoolLocationId;
  awardedPoints: number;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ActivityBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredPoints: number;
  category: ActivityCategory;
}

