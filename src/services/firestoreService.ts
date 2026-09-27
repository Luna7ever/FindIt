import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Item, Claim } from '@/types';
import { logger } from '@/lib/logging/logger';

const USERS_COLLECTION = 'users';
const ITEMS_COLLECTION = 'items';
const CLAIMS_COLLECTION = 'claims';

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
  }
};
