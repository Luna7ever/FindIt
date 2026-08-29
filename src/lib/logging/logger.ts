/**
 * Structured Production Logger for FindIt
 * Redacts sensitive fields (PINs, passwords, secret answers) automatically.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = new Set([
  'pin',
  'handoverpin',
  'secretanswer',
  'password',
  'token',
  'authorization',
  'apikey',
  'creditcard',
]);

function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? sanitizeData(context) : undefined;

    if (level === 'error') {
      console.error(
        JSON.stringify({ timestamp, level, message, context: sanitizedContext })
      );
    } else if (level === 'warn') {
      console.warn(
        JSON.stringify({ timestamp, level, message, context: sanitizedContext })
      );
    } else if (level === 'info') {
      console.log(
        JSON.stringify({ timestamp, level, message, context: sanitizedContext })
      );
    } else if (!this.isProduction) {
      console.debug(
        JSON.stringify({ timestamp, level, message, context: sanitizedContext })
      );
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
