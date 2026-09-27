import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Item, Claim, WeeklyChallenge } from '@/types';
import { logger } from '@/lib/logging/logger';
import { normalizeToIntegrityScenario, DEFAULT_WEEKLY_CHALLENGES } from '@/lib/challengesData';

const USERS_COLLECTION = 'users';
const ITEMS_COLLECTION = 'items';
const CLAIMS_COLLECTION = 'claims';
const CHALLENGES_COLLECTION = 'weekly_challenges';

/**
 * Sanitizes object by recursively omitting undefined values so Firestore setDoc/updateDoc never errors
 */
function cleanFirestoreData<T>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return clean;
  for (const [key, val] of Object.entries(obj as Record<string, any>)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        clean[key] = cleanFirestoreData(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

export const firestoreService = {
  /**
   * Save or update a student user profile in Firestore
   */
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      if (!profile || !profile.id) {
        logger.error('Firestore: Cannot save profile without ID');
        return false;
      }
      const sanitized = cleanFirestoreData({
        ...profile,
        updatedAt: new Date().toISOString()
      });
      const userRef = doc(db, USERS_COLLECTION, profile.id);
      await setDoc(userRef, sanitized, { merge: true });
      logger.info('Firestore: User profile saved successfully', { userId: profile.id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save user profile', { error: String(error), userId: profile?.id });
      return false;
    }
  },

  /**
   * Fetch a user profile by ID from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!userId) return null;
      const userRef = doc(db, USERS_COLLECTION, userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      logger.error('Firestore: Failed to fetch user profile', { error: String(error), userId });
      return null;
    }
  },

  /**
   * Fetch all registered users from Firestore
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snapshot = await getDocs(collection(db, USERS_COLLECTION));
      const userList: UserProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as UserProfile;
        if (data && data.id && data.name) {
          userList.push(data);
        }
      });
      return userList;
    } catch (error) {
      logger.error('Firestore: Failed to fetch all users', { error: String(error) });
      return [];
    }
  },

  /**
   * Save a new lost/found item to Firestore
   */
  async saveItem(item: Item): Promise<boolean> {
    try {
      if (!item || !item.id) return false;
      const sanitized = cleanFirestoreData({
        ...item,
        updatedAt: new Date().toISOString()
      });
      const itemRef = doc(db, ITEMS_COLLECTION, item.id);
      await setDoc(itemRef, sanitized, { merge: true });
      logger.info('Firestore: Item saved', { itemId: item.id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save item', { error: String(error), itemId: item?.id });
      return false;
    }
  },

  /**
   * Update existing item fields in Firestore
   */
  async updateItem(itemId: string, updates: Partial<Item>): Promise<boolean> {
    try {
      if (!itemId) return false;
      const sanitized = cleanFirestoreData({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      const itemRef = doc(db, ITEMS_COLLECTION, itemId);
      await updateDoc(itemRef, sanitized);
      logger.info('Firestore: Item updated', { itemId });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to update item', { error: String(error), itemId });
      return false;
    }
  },

  /**
   * Save a claim to Firestore
   */
  async saveClaim(claim: Claim): Promise<boolean> {
    try {
      if (!claim || !claim.id) return false;
      const sanitized = cleanFirestoreData({
        ...claim,
        updatedAt: new Date().toISOString()
      });
      const claimRef = doc(db, CLAIMS_COLLECTION, claim.id);
      await setDoc(claimRef, sanitized, { merge: true });
      logger.info('Firestore: Claim saved', { claimId: claim.id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save claim', { error: String(error), claimId: claim?.id });
      return false;
    }
  },

  /**
   * Update claim fields in Firestore
   */
  async updateClaim(claimId: string, updates: Partial<Claim>): Promise<boolean> {
    try {
      if (!claimId) return false;
      const sanitized = cleanFirestoreData({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
      await updateDoc(claimRef, sanitized);
      logger.info('Firestore: Claim updated', { claimId });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to update claim', { error: String(error), claimId });
      return false;
    }
  },

  /**
   * Listen to real-time changes on Items collection
   */
  subscribeToItems(onUpdate: (items: Item[]) => void): () => void {
    try {
      const itemsQuery = query(collection(db, ITEMS_COLLECTION), orderBy('createdAt', 'desc'));
      return onSnapshot(itemsQuery, (snapshot) => {
        const itemsList: Item[] = [];
        snapshot.forEach((d) => {
          itemsList.push(d.data() as Item);
        });
        if (itemsList.length > 0) {
          onUpdate(itemsList);
        }
      }, (error) => {
        logger.warn('Firestore items subscription error', { error: String(error) });
      });
    } catch (error) {
      logger.warn('Firestore subscribeToItems failed to initialize', { error: String(error) });
      return () => {};
    }
  },

  /**
   * Listen to real-time changes on Claims collection
   */
  subscribeToClaims(onUpdate: (claims: Claim[]) => void): () => void {
    try {
      const claimsQuery = query(collection(db, CLAIMS_COLLECTION), orderBy('createdAt', 'desc'));
      return onSnapshot(claimsQuery, (snapshot) => {
        const claimsList: Claim[] = [];
        snapshot.forEach((d) => {
          claimsList.push(d.data() as Claim);
        });
        if (claimsList.length > 0) {
          onUpdate(claimsList);
        }
      }, (error) => {
        logger.warn('Firestore claims subscription error', { error: String(error) });
      });
    } catch (error) {
      logger.warn('Firestore subscribeToClaims failed to initialize', { error: String(error) });
      return () => {};
    }
  },

  /**
   * Save student's scenario responses and behavioral research data to Firestore
   */
  async saveIntegrityResearchData(record: {
    studentId: string;
    studentName: string;
    studentGrade?: string;
    weekId: string;
    completedAt: string;
    totalPointsEarned: number;
    accuracyPercentage: number;
    idealAnswersCount: number;
    totalScenarios: number;
    answers: Record<string, { optionId: string; isIdeal: boolean; score: number; answeredAt?: string }>;
  }): Promise<boolean> {
    try {
      if (!record || !record.studentId || !record.weekId) return false;
      const docId = `${record.studentId}_${record.weekId}`;
      const docRef = doc(db, 'integrity_responses', docId);
      const sanitized = cleanFirestoreData({
        ...record,
        updatedAt: new Date().toISOString()
      });
      await setDoc(docRef, sanitized, { merge: true });
      logger.info('Firestore: Integrity research responses saved', { docId });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save integrity research data', { error: String(error) });
      return false;
    }
  },

  /**
   * Record challenge completion and update user total points and completed challenges
   */
  async recordChallengeCompletion(
    userId: string,
    weekId: string,
    pointsEarned: number
  ): Promise<boolean> {
    try {
      if (!userId || !weekId) return false;
      const userRef = doc(db, USERS_COLLECTION, userId);
      const snapshot = await getDoc(userRef);
      const existing = snapshot.exists() ? (snapshot.data() as UserProfile) : null;

      const currentPoints = existing?.total_points ?? existing?.goodwillPoints ?? 0;
      const newTotalPoints = currentPoints + pointsEarned;
      const existingChallenges = existing?.completed_challenges || [];
      const completedChallenges = Array.from(new Set([...existingChallenges, weekId]));

      const sanitized = cleanFirestoreData({
        total_points: newTotalPoints,
        goodwillPoints: newTotalPoints,
        completed_challenges: completedChallenges,
        isTrusted: true,
        updatedAt: new Date().toISOString()
      });

      await setDoc(userRef, sanitized, { merge: true });
      logger.info('Firestore: Challenge completion recorded', { userId, weekId, newTotalPoints });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to record challenge completion', { error: String(error), userId });
      return false;
    }
  },

  /**
   * Get all weekly challenges from Firestore
   */
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    try {
      const q = query(collection(db, CHALLENGES_COLLECTION), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // If empty in Firestore, automatically seed default challenges and return them
        await this.seedDefaultWeeklyChallenges();
        return DEFAULT_WEEKLY_CHALLENGES;
      }
      const challenges: WeeklyChallenge[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const rawScenarios = data.scenarios || [];
        const normalizedScenarios = rawScenarios.map((s: any, idx: number) => 
          normalizeToIntegrityScenario(s, idx)
        );
        challenges.push({
          id: d.id,
          week_id: data.week_id || d.id,
          theme_title: data.theme_title || 'تحدي النزاهة الأسبوعي',
          order: typeof data.order === 'number' ? data.order : 1,
          is_active: Boolean(data.is_active),
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description,
          badge_name: data.badge_name,
          pledge_text: data.pledge_text,
          scenarios: normalizedScenarios,
        });
      });
      return challenges;
    } catch (error) {
      logger.warn('Firestore: Failed to fetch weekly challenges, using fallback', { error: String(error) });
      return DEFAULT_WEEKLY_CHALLENGES;
    }
  },

  /**
   * Get the currently active weekly challenge
   */
  async getActiveWeeklyChallenge(): Promise<WeeklyChallenge | null> {
    try {
      const challenges = await this.getWeeklyChallenges();
      if (!challenges || challenges.length === 0) return null;
      const active = challenges.find((c) => c.is_active) || challenges[0];
      return active || null;
    } catch (error) {
      logger.warn('Firestore: Failed to get active challenge', { error: String(error) });
      return DEFAULT_WEEKLY_CHALLENGES[0];
    }
  },

  /**
   * Save or update a weekly challenge in Firestore
   */
  async saveWeeklyChallenge(challenge: WeeklyChallenge): Promise<boolean> {
    try {
      if (!challenge || !challenge.week_id) return false;
      const sanitized = cleanFirestoreData({
        ...challenge,
        updatedAt: new Date().toISOString()
      });
      const challengeRef = doc(db, CHALLENGES_COLLECTION, challenge.week_id);
      await setDoc(challengeRef, sanitized, { merge: true });
      logger.info('Firestore: Weekly challenge saved', { weekId: challenge.week_id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save weekly challenge', { error: String(error), weekId: challenge?.week_id });
      return false;
    }
  },

  /**
   * Seed default Week 1 and Week 2 challenges into Firestore if not present
   */
  async seedDefaultWeeklyChallenges(): Promise<boolean> {
    try {
      for (const challenge of DEFAULT_WEEKLY_CHALLENGES) {
        const sanitized = cleanFirestoreData({
          ...challenge,
          updatedAt: new Date().toISOString()
        });
        const challengeRef = doc(db, CHALLENGES_COLLECTION, challenge.week_id);
        await setDoc(challengeRef, sanitized, { merge: true });
      }
      logger.info('Firestore: Successfully seeded default weekly challenges');
      return true;
    } catch (error) {
      logger.warn('Firestore: Could not seed weekly challenges', { error: String(error) });
      return false;
    }
  }
};

