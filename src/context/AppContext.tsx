'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Item, Claim, UserProfile, ItemStatus, CustodyStatus, UserRole } from '@/types';
import { DEMO_USERS, INITIAL_SEED_ITEMS } from '@/lib/constants';
import { ItemService } from '@/services/itemService';
import { ClaimService } from '@/services/claimService';
import { HandoverService } from '@/services/handoverService';
import { canAccessAdmin, canDirectReunite, canDeleteItem } from '@/lib/auth/permissions';
import { AuthorizationError, NotFoundError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logging/logger';

interface AppContextType {
  items: Item[];
  claims: Claim[];
  currentUser: UserProfile;
  users: UserProfile[];
  setCurrentUserById: (userId: string) => void;
  switchUserRole: (role: UserRole) => void;
  addItem: (itemData: unknown) => Item;
  getItemById: (id: string) => Item | undefined;
  updateItemStatus: (id: string, status: ItemStatus) => void;
  updateItemCustody: (id: string, custody: CustodyStatus) => void;
  deleteItem: (id: string) => void;
  adminDirectReunite: (id: string) => void;
  submitClaim: (itemId: string, answerText: string) => Claim;
  approveClaim: (claimId: string) => void;
  rejectClaim: (claimId: string) => void;
  completeHandover: (claimId: string, inputPin: string) => { success: boolean; message: string };
  getClaimForCurrentUserAndItem: (itemId: string) => Claim | undefined;
  getClaimsForMyItems: () => { claim: Claim; item: Item }[];
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ITEMS_STORAGE_KEY = 'findit_items_v4';
const CLAIMS_STORAGE_KEY = 'findit_claims_v4';
const CURRENT_USER_KEY = 'findit_current_user_v4';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>(INITIAL_SEED_ITEMS);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default: Malak (Student)
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage once on client mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      const savedClaims = localStorage.getItem(CLAIMS_STORAGE_KEY);
      const savedUserId = localStorage.getItem(CURRENT_USER_KEY);

      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      if (savedClaims) {
        setClaims(JSON.parse(savedClaims));
      }
      if (savedUserId) {
        const found = DEMO_USERS.find((u) => u.id === savedUserId);
        if (found) setCurrentUser(found);
      }
    } catch (e) {
      logger.error('Error loading state from localStorage', { error: String(e) });
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      logger.error('Error saving items to localStorage', { error: String(e) });
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
    } catch (e) {
      logger.error('Error saving claims to localStorage', { error: String(e) });
    }
  }, [claims, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CURRENT_USER_KEY, currentUser.id);
    } catch (e) {
      logger.error('Error saving current user to localStorage', { error: String(e) });
    }
  }, [currentUser, isLoaded]);

  const setCurrentUserById = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      logger.info('Switched active user', { userId: user.id, role: user.role });
    }
  }, [users]);

  const switchUserRole = useCallback((role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      logger.info('Switched user role', { role: targetUser.role });
    }
  }, [users]);

  const addItem = useCallback((itemData: unknown): Item => {
    const newItem = ItemService.createItem(itemData, currentUser);
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, [currentUser]);

  const getItemById = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  const updateItemStatus = useCallback((id: string, status: ItemStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }, []);

  const updateItemCustody = useCallback((id: string, custody: CustodyStatus) => {
    if (!canAccessAdmin(currentUser)) {
      throw new AuthorizationError('فقط إدارة المدرسة يمكنها تغيير حالة حيازة الأمانات');
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, custody } : item))
    );
    logger.info('Item custody updated', { itemId: id, custody });
  }, [currentUser]);

  const deleteItem = useCallback((id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) throw new NotFoundError('البلاغ', id);

    if (!canDeleteItem(currentUser, item)) {
      throw new AuthorizationError('غير مصرح لك بحذف هذا البلاغ');
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    setClaims((prev) => prev.filter((c) => c.itemId !== id));
    logger.info('Item deleted', { itemId: id });
  }, [items, currentUser]);

  const adminDirectReunite = useCallback((id: string) => {
    if (!canDirectReunite(currentUser)) {
      throw new AuthorizationError('فقط إدارة المدرسة يمكنها تأكيد التسليم المباشر');
    }

    const completedAt = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'reunited', reunitedAt: completedAt } : item
      )
    );
    logger.info('Item reunited via admin direct confirmation', { itemId: id });
  }, [currentUser]);

  const submitClaim = useCallback((itemId: string, answerText: string): Claim => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) throw new NotFoundError('الغرض', itemId);

    const newClaim = ClaimService.submitClaim(
      { itemId, answerText },
      currentUser,
      targetItem,
      claims
    );

    setClaims((prev) => [newClaim, ...prev]);
    updateItemStatus(itemId, 'claimed');
    return newClaim;
  }, [items, claims, currentUser, updateItemStatus]);

  const approveClaim = useCallback((claimId: string) => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) throw new NotFoundError('طلب الاسترداد', claimId);

    const item = items.find((i) => i.id === claim.itemId);
    if (!item) throw new NotFoundError('الغرض', claim.itemId);

    const approvedClaim = ClaimService.approveClaim(claim, item, currentUser);
    setClaims((prev) => prev.map((c) => (c.id === claimId ? approvedClaim : c)));
  }, [claims, items, currentUser]);

  const rejectClaim = useCallback((claimId: string) => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) throw new NotFoundError('طلب الاسترداد', claimId);

    const item = items.find((i) => i.id === claim.itemId);
    if (!item) throw new NotFoundError('الغرض', claim.itemId);

    const rejectedClaim = ClaimService.rejectClaim(claim, item, currentUser);
    setClaims((prev) => prev.map((c) => (c.id === claimId ? rejectedClaim : c)));
    updateItemStatus(claim.itemId, 'open');
  }, [claims, items, currentUser, updateItemStatus]);

  const completeHandover = useCallback((
    claimId: string,
    inputPin: string
  ): { success: boolean; message: string } => {
    const claim = claims.find((c) => c.id === claimId);
    if (!claim) throw new NotFoundError('طلب الاسترداد', claimId);

    const item = items.find((i) => i.id === claim.itemId);
    if (!item) throw new NotFoundError('الغرض', claim.itemId);

    const result = HandoverService.completeHandover(claimId, inputPin, claim, item);

    if (result.success) {
      setClaims((prev) => prev.map((c) => (c.id === claimId ? result.updatedClaim : c)));
      setItems((prev) => prev.map((i) => (i.id === item.id ? result.updatedItem : i)));

      // Award points to finder
      if (item.reportedBy) {
        const finderId = item.reportedBy.id;
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === finderId) {
              return {
                ...u,
                returnedCount: (u.returnedCount || 0) + 1,
                goodwillPoints: (u.goodwillPoints || 0) + 50,
                isTrusted: true,
              };
            }
            return u;
          })
        );
      }
    }

    return { success: result.success, message: result.message };
  }, [claims, items]);

  const getClaimForCurrentUserAndItem = useCallback((itemId: string): Claim | undefined => {
    return claims.find(
      (c) => c.itemId === itemId && c.claimant.id === currentUser.id
    );
  }, [claims, currentUser.id]);

  const getClaimsForMyItems = useCallback((): { claim: Claim; item: Item }[] => {
    if (currentUser.role === 'admin') {
      return claims.map((claim) => ({
        claim,
        item: items.find((i) => i.id === claim.itemId)!,
      })).filter((entry) => !!entry.item);
    }

    const myItemIds = new Set(
      items.filter((i) => i.reportedBy.id === currentUser.id).map((i) => i.id)
    );
    return claims
      .filter((c) => myItemIds.has(c.itemId) || c.claimant.id === currentUser.id)
      .map((claim) => ({
        claim,
        item: items.find((i) => i.id === claim.itemId)!,
      }))
      .filter((entry) => !!entry.item);
  }, [currentUser, items, claims]);

  const resetDemoData = useCallback(() => {
    setItems(INITIAL_SEED_ITEMS);
    setClaims([]);
    setUsers(DEMO_USERS);
    setCurrentUser(DEMO_USERS[0]);
    localStorage.removeItem(ITEMS_STORAGE_KEY);
    localStorage.removeItem(CLAIMS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  return (
    <AppContext.Provider
      value={{
        items,
        claims,
        currentUser,
        users,
        setCurrentUserById,
        switchUserRole,
        addItem,
        getItemById,
        updateItemStatus,
        updateItemCustody,
        deleteItem,
        adminDirectReunite,
        submitClaim,
        approveClaim,
        rejectClaim,
        completeHandover,
        getClaimForCurrentUserAndItem,
        getClaimsForMyItems,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
