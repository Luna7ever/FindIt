import { Claim, Item, UserProfile } from '@/types';
import { ClaimCreateSchema } from '@/lib/validation/schemas';
import { validateClaimTransition, validateItemTransition } from '@/lib/state/machine';
import { canModerateClaims } from '@/lib/auth/permissions';
import { ValidationError, ConflictError, AuthorizationError, NotFoundError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logging/logger';

export class ClaimService {
  /**
   * Submits a claim with verification answer and duplicate protection
   */
  static submitClaim(
    input: unknown,
    user: UserProfile,
    targetItem: Item,
    existingClaims: Claim[]
  ): Claim {
    // 1. Validate Schema
    const parseResult = ClaimCreateSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        parseResult.error.issues[0]?.message || 'بيانات إثبات الملكية غير صالحة'
      );
    }
    const { itemId, answerText } = parseResult.data;

    // 2. Validate Item is eligible for claim
    if (targetItem.status === 'reunited') {
      throw new ConflictError('هذا الغرض تم استرداده مسبقاً ولا يمكن تقديم طلب جديد عليه');
    }

    if (targetItem.reportedBy?.id === user.id) {
      throw new ConflictError('لا يمكنك تقديم طلب استرداد على غرض قمت أنت بالإبلاغ عنه');
    }

    // 3. Idempotency / Duplicate Prevention: Check if student already has a pending claim for this item
    const duplicateClaim = existingClaims.find(
      (c) => c.itemId === itemId && c.claimant?.id === user.id && c.status === 'pending'
    );
    if (duplicateClaim) {
      throw new ConflictError('لديك طلب استرداد قيد المراجعة بالفعل لهذا الغرض');
    }

    // 4. Create Claim Record
    const newClaim: Claim = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId,
      claimant: user,
      answerText,
      status: 'pending',
      handoverPin: '4826', // Deterministic demo PIN
      createdAt: new Date().toISOString(),
    };

    logger.info('Claim submitted successfully', { claimId: newClaim.id, itemId });
    return newClaim;
  }

  /**
   * Approves a claim and moves state to 'approved'
   */
  static approveClaim(
    claim: Claim,
    item: Item,
    user: UserProfile
  ): Claim {
    const isFinder = item.reportedBy?.id === user.id;
    const isAdmin = canModerateClaims(user);

    if (!isFinder && !isAdmin) {
      throw new AuthorizationError('فقط صاحب البلاغ أو إدارة المدرسة يمكنهم اعتماد طلب الاسترداد');
    }

    validateClaimTransition(claim.status, 'approved');

    const approvedClaim: Claim = {
      ...claim,
      status: 'approved',
      approvedAt: new Date().toISOString(),
    };

    logger.info('Claim approved', { claimId: claim.id, approvedBy: user.id });
    return approvedClaim;
  }

  /**
   * Rejects a claim and resets item state if needed
   */
  static rejectClaim(
    claim: Claim,
    item: Item,
    user: UserProfile
  ): Claim {
    const isFinder = item.reportedBy?.id === user.id;
    const isAdmin = canModerateClaims(user);

    if (!isFinder && !isAdmin) {
      throw new AuthorizationError('فقط صاحب البلاغ أو إدارة المدرسة يمكنهم رفض طلب الاسترداد');
    }

    validateClaimTransition(claim.status, 'rejected');

    const rejectedClaim: Claim = {
      ...claim,
      status: 'rejected',
    };

    logger.info('Claim rejected', { claimId: claim.id, rejectedBy: user.id });
    return rejectedClaim;
  }
}
