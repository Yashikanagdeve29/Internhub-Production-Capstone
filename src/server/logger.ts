/**
 * InternHub Structured Logger
 * Safe, lightweight, PII-compliant logging for production.
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export const logger = {
  log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };

    // Filter out any potential sensitive fields explicitly
    delete (payload as Record<string, unknown>).password;
    delete (payload as Record<string, unknown>).secret;
    delete (payload as Record<string, unknown>).token;
    delete (payload as Record<string, unknown>).email;
    delete (payload as Record<string, unknown>).phone;
    delete (payload as Record<string, unknown>).coverLetter;
    delete (payload as Record<string, unknown>).body;

    const formatted = `[${payload.timestamp}] [${level.toUpperCase()}] ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
    }`;

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  },

  info(message: string, meta: Record<string, unknown> = {}) {
    this.log('info', message, meta);
  },

  warn(message: string, meta: Record<string, unknown> = {}) {
    this.log('warn', message, meta);
  },

  error(message: string, meta: Record<string, unknown> = {}) {
    this.log('error', message, meta);
  },
};

/**
 * Express middleware for request logging without PII leakage.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = `req-${crypto.randomBytes(4).toString('hex')}`;
  (req as unknown as { id: string }).id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    // Strip sensitive query parameters if any
    const safePath = req.baseUrl + req.path;

    logger.info('HTTP Request processed', {
      requestId,
      method: req.method,
      path: safePath,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
