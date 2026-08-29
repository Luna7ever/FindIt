import { ItemStatus, ClaimStatus } from '@/types';
import { StateTransitionError } from '@/lib/errors/AppError';

/**
 * Deterministic State Machine for Item and Claim Lifecycles
 */

const VALID_ITEM_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  open: ['matched', 'claimed', 'reunited', 'archived'],
  matched: ['open', 'claimed', 'reunited', 'archived'],
  claimed: ['open', 'reunited', 'archived'],
  reunited: [], // Terminal state
  archived: ['open'], // Admin can unarchive
};

const VALID_CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  pending: ['approved', 'rejected'],
  approved: ['completed', 'rejected'],
  rejected: ['pending'], // Admin can reopen for review
  completed: [], // Terminal state
};

export function validateItemTransition(currentStatus: ItemStatus, nextStatus: ItemStatus): void {
  if (currentStatus === nextStatus) return;
  const allowed = VALID_ITEM_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new StateTransitionError(currentStatus, nextStatus);
  }
}

export function validateClaimTransition(currentStatus: ClaimStatus, nextStatus: ClaimStatus): void {
  if (currentStatus === nextStatus) return;
  const allowed = VALID_CLAIM_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new StateTransitionError(currentStatus, nextStatus);
  }
}

export function canTransitionItem(currentStatus: ItemStatus, nextStatus: ItemStatus): boolean {
  if (currentStatus === nextStatus) return true;
  return (VALID_ITEM_TRANSITIONS[currentStatus] || []).includes(nextStatus);
}

export function canTransitionClaim(currentStatus: ClaimStatus, nextStatus: ClaimStatus): boolean {
  if (currentStatus === nextStatus) return true;
  return (VALID_CLAIM_TRANSITIONS[currentStatus] || []).includes(nextStatus);
}
