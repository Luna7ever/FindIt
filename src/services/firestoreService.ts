import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Item, Claim } from '@/types';
import { logger } from '@/lib/logging/logger';

const USERS_COLLECTION = 'users';
const ITEMS_COLLECTION = 'items';
const CLAIMS_COLLECTION = 'claims';

export const firestoreService = {
  /**
   * Save or update a student user profile in Firestore
   */
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      const userRef = doc(db, USERS_COLLECTION, profile.id);
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      logger.info('Firestore: User profile saved successfully', { userId: profile.id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save user profile', { error: String(error), userId: profile.id });
      return false;
    }
  },

  /**
   * Fetch a user profile by ID from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
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
   * Save a new lost/found item to Firestore
   */
  async saveItem(item: Item): Promise<boolean> {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, item.id);
      await setDoc(itemRef, {
        ...item,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      logger.info('Firestore: Item saved', { itemId: item.id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save item', { error: String(error), itemId: item.id });
      return false;
    }
  },

  /**
   * Update existing item fields in Firestore
   */
  async updateItem(itemId: string, updates: Partial<Item>): Promise<boolean> {
    try {
      const itemRef = doc(db, ITEMS_COLLECTION, itemId);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
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
      const claimRef = doc(db, CLAIMS_COLLECTION, claim.id);
      await setDoc(claimRef, {
        ...claim,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      logger.info('Firestore: Claim saved', { claimId: claim.id });
      return true;
    } catch (error) {
      logger.error('Firestore: Failed to save claim', { error: String(error), claimId: claim.id });
      return false;
    }
  },

  /**
   * Update claim fields in Firestore
   */
  async updateClaim(claimId: string, updates: Partial<Claim>): Promise<boolean> {
    try {
      const claimRef = doc(db, CLAIMS_COLLECTION, claimId);
      await updateDoc(claimRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
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
