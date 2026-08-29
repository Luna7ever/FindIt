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
  reunitedAt?: string;
  matchedItemId?: string;
}

export interface Claim {
  id: string;
  itemId: string;
  claimant: UserProfile;
  answerText: string;
  status: ClaimStatus;
  handoverPin: string;
  createdAt: string;
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
}

export interface MatchResult {
  targetItem: Item;
  matchedItem: Item;
  breakdown: MatchScoreBreakdown;
}
