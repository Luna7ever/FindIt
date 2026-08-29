import { UserProfile, Item, Claim } from '@/types';
import { AuthorizationError } from '@/lib/errors/AppError';

/**
 * Centralized Role-Based Access Control (RBAC) & Data Privacy Layer
 */

export function canAccessAdmin(user: UserProfile | null | undefined): boolean {
  return user?.role === 'admin';
}

export function canManageReports(user: UserProfile | null | undefined): boolean {
  return user?.role === 'admin';
}

export function canModerateClaims(user: UserProfile | null | undefined): boolean {
  return user?.role === 'admin';
}

export function canViewPrivateClaimData(
  user: UserProfile | null | undefined,
  claim: Claim,
  item: Item
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (item.reportedBy?.id === user.id) return true;
  if (claim.claimant?.id === user.id) return true;
  return false;
}

export function canEditItem(user: UserProfile | null | undefined, item: Item): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return item.reportedBy?.id === user.id;
}

export function canDeleteItem(user: UserProfile | null | undefined, item: Item): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return item.reportedBy?.id === user.id;
}

export function canDirectReunite(user: UserProfile | null | undefined): boolean {
  return user?.role === 'admin';
}

export function canManageLocations(user: UserProfile | null | undefined): boolean {
  return user?.role === 'admin';
}

export function canGenerateAdminQR(user: UserProfile | null | undefined): boolean {
  return user?.role === 'admin';
}

export function assertAdmin(user: UserProfile | null | undefined, action = 'تنفيذ هذا الإجراء'): void {
  if (!canAccessAdmin(user)) {
    throw new AuthorizationError(`غير مصرح لك بـ ${action}. هذه الصلاحية مخصصة لإدارة المدرسة فقط.`);
  }
}

/**
 * Sanitizes item data for public viewing
 * Strips secretAnswer and sensitive details if viewer is not the creator or admin.
 */
export function sanitizeItemForViewer(item: Item, viewer: UserProfile | null | undefined): Item {
  const isOwner = viewer && item.reportedBy?.id === viewer.id;
  const isAdmin = viewer && viewer.role === 'admin';

  if (isOwner || isAdmin) {
    return item;
  }

  // Strip secret answer for all public viewers
  const { secretAnswer, ...safeItem } = item;
  return safeItem as Item;
}
