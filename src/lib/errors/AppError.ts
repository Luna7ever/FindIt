/**
 * FindIt Application Error Hierarchy
 * Standardized typed errors with user-facing messages and HTTP-equivalent codes.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'يرجى تسجيل الدخول للمتابعة') {
    super(message, 'AUTHENTICATION_REQUIRED', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'غير مصرح لك بالقيام بهذه العملية') {
    super(message, 'PERMISSION_DENIED', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'العنصر المطلوب', id?: string) {
    super(
      id ? `${resource} بالمعرف (${id}) غير موجود` : `${resource} غير موجود`,
      'NOT_FOUND',
      404
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class StateTransitionError extends AppError {
  constructor(fromStatus: string, toStatus: string) {
    super(
      `لا يمكن الانتقال من الحالة (${fromStatus}) إلى الحالة (${toStatus}) مباشرة`,
      'INVALID_STATE_TRANSITION',
      422
    );
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'تم تجاوز عدد المحاولات المسموح بها، يرجى الانتظار قليلاً') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}
