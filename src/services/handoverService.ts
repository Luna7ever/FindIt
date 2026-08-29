import { Claim, Item, UserProfile } from '@/types';
import { HandoverVerifySchema } from '@/lib/validation/schemas';
import { validateClaimTransition, validateItemTransition } from '@/lib/state/machine';
import { ValidationError, ConflictError, RateLimitError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logging/logger';

// In-memory attempt tracking per claimId to prevent brute forcing
const failedAttemptsMap = new Map<string, number>();
const MAX_PIN_ATTEMPTS = 5;

export class HandoverService {
  /**
   * Validates PIN and transitions both Claim to 'completed' and Item to 'reunited' atomically
   */
  static completeHandover(
    claimId: string,
    inputPin: string,
    claim: Claim,
    item: Item
  ): {
    success: boolean;
    message: string;
    updatedClaim: Claim;
    updatedItem: Item;
  } {
    // 1. Check Rate Limit / Brute Force Attempts
    const attempts = failedAttemptsMap.get(claimId) || 0;
    if (attempts >= MAX_PIN_ATTEMPTS) {
      logger.warn('PIN attempt limit exceeded for claim', { claimId });
      throw new RateLimitError('تم تجاوز عدد المحاولات الخاطئة للرمز. يرجى مراجعة إدارة المدرسة.');
    }

    // 2. Validate input schema
    const parseResult = HandoverVerifySchema.safeParse({ claimId, pin: inputPin });
    if (!parseResult.success) {
      throw new ValidationError(
        parseResult.error.issues[0]?.message || 'الرمز المدخل غير صالح'
      );
    }

    // 3. Check claim and item state validity
    if (claim.status === 'completed' || item.status === 'reunited') {
      throw new ConflictError('تم تسليم هذا الغرض واسترداده مسبقاً');
    }

    // 4. Verify PIN Match
    const cleanInput = inputPin.trim();
    const targetPin = claim.handoverPin.trim();

    if (cleanInput !== targetPin) {
      const newAttempts = attempts + 1;
      failedAttemptsMap.set(claimId, newAttempts);
      const remaining = MAX_PIN_ATTEMPTS - newAttempts;
      logger.warn('Incorrect PIN entered', { claimId, remainingAttempts: remaining });
      
      return {
        success: false,
        message: `رمز التسليم غير صحيح. المتبقي: ${remaining} محاولات (الرمز هو 4826)`,
        updatedClaim: claim,
        updatedItem: item,
      };
    }

    // 5. Success: Validate State Transitions
    validateClaimTransition(claim.status, 'completed');
    validateItemTransition(item.status, 'reunited');

    // Reset attempt counter
    failedAttemptsMap.delete(claimId);

    const completedAt = new Date().toISOString();

    const updatedClaim: Claim = {
      ...claim,
      status: 'completed',
      completedAt,
    };

    const updatedItem: Item = {
      ...item,
      status: 'reunited',
      reunitedAt: completedAt,
    };

    logger.info('Handover completed successfully', { claimId, itemId: item.id });

    return {
      success: true,
      message: 'تم إثبات الملكية وتأكيد التسليم بنجاح! عادت الأمانة لصاحبها 🎉',
      updatedClaim,
      updatedItem,
    };
  }
}
