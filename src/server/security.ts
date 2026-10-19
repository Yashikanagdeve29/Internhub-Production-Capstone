/**
 * InternHub Security & Authorization Module
 * Protects administrative routes and enforces rate limiting on public endpoints.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger.ts';

// Configurable Admin API Key
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'internhub_admin_secret_token_2026';

/**
 * Administrative Authentication Guard
 * Protects POST /api/internships, PUT /api/internships/:id, DELETE /api/internships/:id
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const headerKey = req.headers['x-admin-key'];
  const authHeader = req.headers['authorization'];

  let providedKey: string | undefined;

  if (typeof headerKey === 'string') {
    providedKey = headerKey.trim();
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.substring(7).trim();
  }

  if (!providedKey) {
    logger.warn('Unauthorized administrative access attempt blocked', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Administrative access requires an x-admin-key header or Bearer token.',
    });
  }

  if (providedKey !== ADMIN_KEY) {
    logger.warn('Forbidden administrative access attempt with invalid key', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Invalid administrative credentials.',
    });
  }

  next();
}

/**
 * In-memory sliding window rate limiter for application submissions.
 */
interface RateRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateRecord>();
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 mins
const MAX_ATTEMPTS = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 10;

export function applicationRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();

  let record = rateLimitStore.get(clientIp);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(clientIp, record);
  }

  // Filter timestamps within the window
  record.timestamps = record.timestamps.filter(ts => now - ts < WINDOW_MS);

  if (record.timestamps.length >= MAX_ATTEMPTS) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);

    logger.warn('Application rate limit exceeded', {
      ip: clientIp,
      attempts: record.timestamps.length,
      retryAfterSeconds,
    });

    res.setHeader('Retry-After', retryAfterSeconds.toString());
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `You have reached the maximum allowed internship applications from this network (${MAX_ATTEMPTS} per 15 minutes). Please try again in ${retryAfterSeconds} seconds.`,
      retryAfterSeconds,
    });
  }

  record.timestamps.push(now);
  next();
}

/**
 * Clears rate limiter store (useful in test runner).
 */
export function resetRateLimiterStore() {
  rateLimitStore.clear();
}
