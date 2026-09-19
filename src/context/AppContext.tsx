'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Item, 
  Claim, 
  UserProfile, 
  ItemStatus, 
  CustodyStatus, 
  UserRole,
  IntegrityAttempt,
  TrustTier,
  NotificationItem,
  ToastMessage,
  AppLanguage,
  AppTheme,
  SchoolActivity,
  ActivitySubmission,
  ActivityBadge,
  SchoolLocationId
} from '@/types';
import { 
  DEMO_USERS, 
  INITIAL_SEED_ITEMS, 
  INTEGRITY_SCENARIOS, 
  INITIAL_NOTIFICATIONS,
  SCHOOL_ACTIVITIES,
  ACTIVITY_BADGES,
  INITIAL_ACTIVITY_SUBMISSIONS
} from '@/lib/constants';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ItemService } from '@/services/itemService';
import { ClaimService } from '@/services/claimService';
import { HandoverService } from '@/services/handoverService';
import { IntegrityService, EvaluationResult, ScenarioStatus } from '@/services/integrityService';
import { canAccessAdmin, canDirectReunite, canDeleteItem } from '@/lib/auth/permissions';
import { AuthorizationError, NotFoundError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logging/logger';
import { cloudflareSyncService, SyncStatus } from '@/services/cloudflareSyncService';

interface AppContextType {
  items: Item[];
  claims: Claim[];
  currentUser: UserProfile;
  users: UserProfile[];
  integrityAttempts: IntegrityAttempt[];
  currentUserTrustTier: TrustTier;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'> & { id?: string }) => void;
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
  isQRScannerOpen: boolean;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  isCertificateModalOpen: boolean;
  certificateUser: UserProfile | null;
  openCertificateModal: (user?: UserProfile) => void;
  closeCertificateModal: () => void;
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
  submitIntegrityAttempt: (scenarioId: string, answers: Record<string, string> | string) => EvaluationResult;
  getScenarioStatusForCurrentUser: (scenarioId: string) => ScenarioStatus;
  resetScenarioCooldown: (scenarioId: string) => void;
  
  // School Activities System
  activitySubmissions: ActivitySubmission[];
  submitSchoolActivity: (activityId: string, notes?: string, locationId?: SchoolLocationId) => { success: boolean; submission: ActivitySubmission; isInstant: boolean };
  approveSchoolActivity: (submissionId: string) => void;
  rejectSchoolActivity: (submissionId: string) => void;
  getUserActivitySubmissions: (userId?: string) => ActivitySubmission[];
  getUserEarnedBadges: (userId?: string) => ActivityBadge[];
  
  resetDemoData: () => void;
  
  // Multilingual & Theme
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  resolvedTheme: 'light' | 'dark';
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;

  // Cloudflare D1 Synchronization
  syncStatus: SyncStatus;
  triggerCloudSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ITEMS_STORAGE_KEY = 'findit_items_v4';
const CLAIMS_STORAGE_KEY = 'findit_claims_v4';
const CURRENT_USER_KEY = 'findit_current_user_v4';
const USERS_STORAGE_KEY = 'findit_users_v4';
const INTEGRITY_ATTEMPTS_KEY = 'findit_integrity_attempts_v4';
const NOTIFICATIONS_STORAGE_KEY = 'findit_notifications_v4';
const ACTIVITIES_STORAGE_KEY = 'findit_activities_v4';
const LANGUAGE_STORAGE_KEY = 'findit_language_v4';
const THEME_STORAGE_KEY = 'findit_theme_v4';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>(INITIAL_SEED_ITEMS);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default: Malak (Student)
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [integrityAttempts, setIntegrityAttempts] = useState<IntegrityAttempt[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activitySubmissions, setActivitySubmissions] = useState<ActivitySubmission[]>(INITIAL_ACTIVITY_SUBMISSIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificateUser, setCertificateUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(cloudflareSyncService.getStatus());

  // Subscribe to Cloudflare Sync Status
  useEffect(() => {
    return cloudflareSyncService.subscribe(setSyncStatus);
  }, []);

  // Language & Theme State
  const [language, setLanguageState] = useState<AppLanguage>('ar');
  const [theme, setThemeState] = useState<AppTheme>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Load from LocalStorage once on client mount
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(ITEMS_STORAGE_KEY);
      const savedClaims = localStorage.getItem(CLAIMS_STORAGE_KEY);
      const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const savedIntegrity = localStorage.getItem(INTEGRITY_ATTEMPTS_KEY);
      const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const savedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;

      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      if (savedClaims) {
        setClaims(JSON.parse(savedClaims));
      }
      if (savedIntegrity) {
        setIntegrityAttempts(JSON.parse(savedIntegrity));
      }
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedActivities) {
        setActivitySubmissions(JSON.parse(savedActivities));
      }
      if (savedUsers) {
        const parsedUsers: UserProfile[] = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        if (savedUserId) {
          const found = parsedUsers.find((u) => u.id === savedUserId);
          if (found) setCurrentUser(found);
        }
      } else if (savedUserId) {
        const found = DEMO_USERS.find((u) => u.id === savedUserId);
        if (found) setCurrentUser(found);
      }

      // Language Auto-Detection
      if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      } else if (typeof navigator !== 'undefined') {
        const navLang = navigator.language.toLowerCase();
        if (navLang.startsWith('en')) {
          setLanguageState('en');
        } else {
          setLanguageState('ar');
        }
      }

      // Theme Auto-Detection
      if (savedTheme && (savedTheme === 'system' || savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      }

      // Detect system dark mode preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemPrefersDark(mql.matches);

        const handleChange = (e: MediaQueryListEvent) => {
          setSystemPrefersDark(e.matches);
        };
        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
      }

    } catch (e) {
      logger.error('Error loading state from localStorage', { error: String(e) });
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Compute resolved theme
  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return systemPrefersDark ? 'dark' : 'light';
  }, [theme, systemPrefersDark]);

  // Sync DOM with Theme
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Sync DOM with Language & Direction
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Translation helper
  const t = useCallback((key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['ar']?.[key] || key;
  }, [language]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const setLanguage = useCallback((newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.lang = newLang;
        root.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        if (document.body) {
          document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        }
      }
    } catch {}
  }, []);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const willBeDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (willBeDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    } catch {}
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
      localStorage.setItem(INTEGRITY_ATTEMPTS_KEY, JSON.stringify(integrityAttempts));
    } catch (e) {
      logger.error('Error saving integrity attempts to localStorage', { error: String(e) });
    }
  }, [integrityAttempts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      logger.error('Error saving notifications to localStorage', { error: String(e) });
    }
  }, [notifications, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activitySubmissions));
    } catch (e) {
      logger.error('Error saving activity submissions to localStorage', { error: String(e) });
    }
  }, [activitySubmissions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      logger.error('Error saving users to localStorage', { error: String(e) });
    }
  }, [users, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CURRENT_USER_KEY, currentUser.id);
    } catch (e) {
      logger.error('Error saving current user to localStorage', { error: String(e) });
    }
  }, [currentUser, isLoaded]);

  // Bidirectional Pull & Merge from Cloudflare
  const pullAndMerge = useCallback(async () => {
    try {
      const remoteData = await cloudflareSyncService.pullFromCloudflare();
      if (!remoteData) return;

      if (Array.isArray(remoteData.items) && remoteData.items.length > 0) {
        setItems((current) => {
          const map = new Map(current.map((item) => [item.id, item]));
          let hasNew = false;
          remoteData.items!.forEach((remoteItem) => {
            const existing = map.get(remoteItem.id);
            if (!existing) {
              map.set(remoteItem.id, remoteItem);
              hasNew = true;
            } else if (remoteItem.updatedAt && (!existing.updatedAt || remoteItem.updatedAt > existing.updatedAt)) {
              map.set(remoteItem.id, { ...existing, ...remoteItem });
              hasNew = true;
            }
          });
          return hasNew ? Array.from(map.values()) : current;
        });
      }

      if (Array.isArray(remoteData.claims) && remoteData.claims.length > 0) {
        setClaims((current) => {
          const map = new Map(current.map((claim) => [claim.id, claim]));
          let hasNew = false;
          remoteData.claims!.forEach((remoteClaim) => {
            const existing = map.get(remoteClaim.id);
            if (!existing) {
              map.set(remoteClaim.id, remoteClaim);
              hasNew = true;
            } else if (remoteClaim.updatedAt && (!existing.updatedAt || remoteClaim.updatedAt > existing.updatedAt)) {
              map.set(remoteClaim.id, { ...existing, ...remoteClaim });
              hasNew = true;
            }
          });
          return hasNew ? Array.from(map.values()) : current;
        });
      }
    } catch (e) {
      // Safe local fallback
    }
  }, []);

  // Initial pull and periodic multi-device sync
  useEffect(() => {
    if (!isLoaded) return;
    pullAndMerge();

    const interval = setInterval(() => {
      pullAndMerge();
    }, 10000); // Check for updates every 10 seconds

    return () => clearInterval(interval);
  }, [isLoaded, pullAndMerge]);

  // Background Cloudflare D1 Push Effect
  useEffect(() => {
    if (!isLoaded) return;
    cloudflareSyncService.scheduleSync(() => ({
      items,
      claims,
      activitySubmissions,
    }));
  }, [items, claims, activitySubmissions, isLoaded]);

  // Explicit Cloud Sync Action
  const triggerCloudSync = useCallback(async () => {
    setToasts((prev) => [
      ...prev,
      {
        id: `toast-${Date.now()}`,
        title: language === 'ar' ? 'جارِ المزامنة السحابية...' : 'Syncing with Cloudflare...',
        message: language === 'ar' ? 'يتم الاتصال بقاعدة بيانات Cloudflare D1 Edge وتبادل البيانات' : 'Connecting to Cloudflare D1 Edge database & exchanging data',
        type: 'info',
        duration: 2500,
      },
    ]);

    const result = await cloudflareSyncService.syncToCloudflare({
      items,
      claims,
      activitySubmissions,
    });

    await pullAndMerge();

    if (result.success) {
      setToasts((prev) => [
        ...prev,
        {
          id: `toast-${Date.now()}`,
          title: language === 'ar' ? 'اكتملت المزامنة السحابية' : 'Cloud Sync Complete',
          message: language === 'ar' ? 'تم تبادل ومزامنة جميع البلاغات بين الأجهزة بنجاح' : 'All reports & claims synchronized across devices',
          type: 'success',
          duration: 4000,
        },
      ]);
    } else {
      setToasts((prev) => [
        ...prev,
        {
          id: `toast-${Date.now()}`,
          title: language === 'ar' ? 'نمط عدم الاتصال (Local-First)' : 'Offline Local-First Mode',
          message: language === 'ar' ? 'التطبيق يعمل محلياً بكفاءة 100%، وستتم المزامنة تلقائياً عند الاتصال' : 'Working locally at 100% efficiency, will sync when connection is restored',
          type: 'warning',
          duration: 4000,
        },
      ]);
    }
  }, [items, claims, activitySubmissions, language, pullAndMerge]);

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

  const currentUserTrustTier = useMemo(() => {
    return IntegrityService.calculateTrustTier(currentUser.goodwillPoints || 0);
  }, [currentUser.goodwillPoints]);

  const getScenarioStatusForCurrentUser = useCallback((scenarioId: string): ScenarioStatus => {
    return IntegrityService.getScenarioStatus(currentUser.id, scenarioId, integrityAttempts);
  }, [currentUser.id, integrityAttempts]);

  const submitIntegrityAttempt = useCallback((scenarioId: string, answers: Record<string, string> | string): EvaluationResult => {
    const scenario = INTEGRITY_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) throw new NotFoundError('السيناريو المطلوب غير موجود');

    const status = IntegrityService.getScenarioStatus(currentUser.id, scenarioId, integrityAttempts);
    if (!status.canAttempt) {
      if (status.reason === 'passed_already') {
        throw new Error('تم اجتياز هذا السيناريو بنجاح مسبقاً، وتُمنح نقاط النزاهة مرة واحدة فقط.');
      }
      if (status.reason === 'in_cooldown') {
        throw new Error('السيناريو في فترة انتظار مؤقتة حالياً، يرجى المحاولة لاحقاً.');
      }
    }

    const answersRecord: Record<string, string> = 
      typeof answers === 'string' 
        ? { [scenario.questions[0]?.id || 'decision']: answers } 
        : answers;

    const evaluation = IntegrityService.evaluateAttempt(scenario, answersRecord);
    const newAttempt = IntegrityService.createAttemptRecord(
      currentUser.id,
      scenarioId,
      evaluation.scorePercentage,
      evaluation.isPassed,
      answersRecord
    );

    setIntegrityAttempts((prev) => [newAttempt, ...prev]);

    if (evaluation.isPassed && evaluation.pointsToAward > 0) {
      const awardedPoints = evaluation.pointsToAward;
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === currentUser.id) {
            const newCompleted = Array.from(new Set([...(u.integrityScenariosCompleted || []), scenarioId]));
            return {
              ...u,
              goodwillPoints: (u.goodwillPoints || 0) + awardedPoints,
              isTrusted: true,
              integrityScenariosCompleted: newCompleted,
            };
          }
          return u;
        })
      );
      setCurrentUser((prev) => ({
        ...prev,
        goodwillPoints: (prev.goodwillPoints || 0) + awardedPoints,
        isTrusted: true,
        integrityScenariosCompleted: Array.from(new Set([...(prev.integrityScenariosCompleted || []), scenarioId])),
      }));
    }

    return evaluation;
  }, [currentUser, integrityAttempts]);

  const resetScenarioCooldown = useCallback((scenarioId: string) => {
    setIntegrityAttempts((prev) =>
      prev.filter((a) => !(a.studentId === currentUser.id && a.scenarioId === scenarioId && !a.isPassed))
    );
    logger.info('Reset cooldown for scenario in demo mode', { scenarioId, userId: currentUser.id });
  }, [currentUser.id]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const addNotification = useCallback((
    notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'> & { id?: string }
  ) => {
    const newNotif: NotificationItem = {
      id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    duration = 4500
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const openQRScanner = useCallback(() => setIsQRScannerOpen(true), []);
  const closeQRScanner = useCallback(() => setIsQRScannerOpen(false), []);

  const openCertificateModal = useCallback((user?: UserProfile) => {
    setCertificateUser(user || currentUser);
    setIsCertificateModalOpen(true);
  }, [currentUser]);

  const closeCertificateModal = useCallback(() => {
    setIsCertificateModalOpen(false);
  }, []);

  // ========================================================
  // SCHOOL ACTIVITIES & QUESTS METHODS
  // ========================================================
  const submitSchoolActivity = useCallback((
    activityId: string,
    notes?: string,
    locationId?: SchoolLocationId
  ) => {
    const activity = SCHOOL_ACTIVITIES.find((a) => a.id === activityId);
    if (!activity) {
      throw new NotFoundError('النشاط المطلوب غير موجود');
    }

    const isInstant = activity.verificationType === 'instant';
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const newSubmission: ActivitySubmission = {
      id: submissionId,
      activityId,
      userId: currentUser.id,
      userName: currentUser.name,
      userGrade: currentUser.grade,
      status: isInstant ? 'approved' : 'pending',
      submittedAt: new Date().toISOString(),
      notes: notes?.trim(),
      locationId: locationId || activity.targetLocationId,
      awardedPoints: activity.points,
      reviewedBy: isInstant ? 'النظام الذكي (فوري)' : undefined,
      reviewedAt: isInstant ? new Date().toISOString() : undefined,
    };

    setActivitySubmissions((prev) => [newSubmission, ...prev]);

    if (isInstant) {
      // Award points immediately
      const points = activity.points;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id
            ? { ...u, goodwillPoints: (u.goodwillPoints || 0) + points }
            : u
        )
      );
      setCurrentUser((prev) => ({
        ...prev,
        goodwillPoints: (prev.goodwillPoints || 0) + points,
      }));

      addNotification({
        title: language === 'en' ? 'Activity Points Earned! 🌟' : 'تم احتساب نقاط النشاط! 🌟',
        message: language === 'en'
          ? `You completed "${activity.title}" and earned +${points} points.`
          : `أكملت نشاط "${activity.title}" وحصلت على +${points} نقطة أمانة.`,
        type: 'points',
        linkUrl: '/activities',
      });

      addToast(
        language === 'en' ? 'Activity Completed! 🎉' : 'تم إنجاز النشاط بنجاح! 🎉',
        language === 'en'
          ? `+${points} points added to your score!`
          : `تمت إضافة +${points} نقطة إلى رصيدك وترتيبك!`,
        'success'
      );
    } else {
      // Supervised activity pending approval
      addNotification({
        title: language === 'en' ? 'Activity Under Review 📋' : 'توثيق النشاط قيد المراجعة 📋',
        message: language === 'en'
          ? `Your submission for "${activity.title}" was received and is awaiting administrative approval.`
          : `تم استلام تقريرك لنشاط "${activity.title}" وهو بانتظار اعتماد إدارة المدرسة.`,
        type: 'system',
        linkUrl: '/activities',
      });

      addToast(
        language === 'en' ? 'Report Submitted 📋' : 'تم إرسال التوثيق 📋',
        language === 'en'
          ? 'Your activity report is awaiting admin review.'
          : 'تم إرسال تقرير النشاط للإدارة للاعتماد ومنح النقاط.',
        'info'
      );
    }

    return { success: true, submission: newSubmission, isInstant };
  }, [currentUser, language, addNotification, addToast]);

  const approveSchoolActivity = useCallback((submissionId: string) => {
    const sub = activitySubmissions.find((s) => s.id === submissionId);
    if (!sub) return;

    setActivitySubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'approved',
              reviewedBy: currentUser.role === 'admin' ? currentUser.name : 'م. مشيرة',
              reviewedAt: new Date().toISOString(),
            }
          : s
      )
    );

    const points = sub.awardedPoints;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === sub.userId
          ? { ...u, goodwillPoints: (u.goodwillPoints || 0) + points }
          : u
      )
    );

    if (currentUser.id === sub.userId) {
      setCurrentUser((prev) => ({
        ...prev,
        goodwillPoints: (prev.goodwillPoints || 0) + points,
      }));
    }

    const activity = SCHOOL_ACTIVITIES.find((a) => a.id === sub.activityId);

    addNotification({
      title: language === 'en' ? 'Activity Approved! 🎉' : 'تم اعتماد النشاط المدرسي! 🎉',
      message: language === 'en'
        ? `Administration approved your work in "${activity?.title || 'School Activity'}" (+${points} pts).`
        : `اعتمدت إدارة المدرسة مشاركتك في "${activity?.title || 'النشاط المدرسي'}" وتم منحك +${points} نقطة.`,
      type: 'points',
      linkUrl: '/activities',
    });

    addToast(
      language === 'en' ? 'Activity Approved' : 'تم اعتماد النشاط',
      language === 'en' ? `Awarded +${points} points to ${sub.userName}` : `تم منح +${points} نقطة للطالب (${sub.userName})`,
      'success'
    );
  }, [activitySubmissions, currentUser, language, addNotification, addToast]);

  const rejectSchoolActivity = useCallback((submissionId: string) => {
    setActivitySubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'rejected',
              reviewedBy: currentUser.role === 'admin' ? currentUser.name : 'م. مشيرة',
              reviewedAt: new Date().toISOString(),
            }
          : s
      )
    );
    addToast(
      language === 'en' ? 'Activity Rejected' : 'تم رفض الطلب',
      language === 'en' ? 'Activity submission was marked as rejected' : 'تم رفض توثيق النشاط',
      'warning'
    );
  }, [currentUser, language, addToast]);

  const getUserActivitySubmissions = useCallback((userId?: string) => {
    const targetId = userId || currentUser.id;
    return activitySubmissions.filter((s) => s.userId === targetId);
  }, [activitySubmissions, currentUser.id]);

  const getUserEarnedBadges = useCallback((userId?: string) => {
    const targetId = userId || currentUser.id;
    const user = users.find((u) => u.id === targetId) || currentUser;
    const userSubmissions = activitySubmissions.filter((s) => s.userId === targetId && s.status === 'approved');
    
    return ACTIVITY_BADGES.filter((badge) => {
      const pointsInCategory = userSubmissions
        .filter((s) => {
          const act = SCHOOL_ACTIVITIES.find((a) => a.id === s.activityId);
          return act?.category === badge.category;
        })
        .reduce((sum, s) => sum + s.awardedPoints, 0);

      return pointsInCategory >= badge.requiredPoints / 2 || (user.goodwillPoints || 0) >= badge.requiredPoints;
    });
  }, [activitySubmissions, currentUser, users]);

  const resetDemoData = useCallback(() => {
    setItems(INITIAL_SEED_ITEMS);
    setClaims([]);
    setUsers(DEMO_USERS);
    setCurrentUser(DEMO_USERS[0]);
    setIntegrityAttempts([]);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivitySubmissions(INITIAL_ACTIVITY_SUBMISSIONS);
    localStorage.removeItem(ITEMS_STORAGE_KEY);
    localStorage.removeItem(CLAIMS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(INTEGRITY_ATTEMPTS_KEY);
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
  }, []);

  return (
    <AppContext.Provider
      value={{
        items,
        claims,
        currentUser,
        users,
        integrityAttempts,
        currentUserTrustTier,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        toasts,
        addToast,
        removeToast,
        isQRScannerOpen,
        openQRScanner,
        closeQRScanner,
        isCertificateModalOpen,
        certificateUser,
        openCertificateModal,
        closeCertificateModal,
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
        submitIntegrityAttempt,
        getScenarioStatusForCurrentUser,
        resetScenarioCooldown,
        
        // School Activities
        activitySubmissions,
        submitSchoolActivity,
        approveSchoolActivity,
        rejectSchoolActivity,
        getUserActivitySubmissions,
        getUserEarnedBadges,

        resetDemoData,

        // Multilingual & Theme
        language,
        setLanguage,
        theme,
        setTheme,
        resolvedTheme,
        t,
        dir,
        isRtl: dir === 'rtl',

        // Cloudflare D1 Sync
        syncStatus,
        triggerCloudSync,
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

