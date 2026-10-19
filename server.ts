/**
 * InternHub Server Entry Point
 * Full-stack Express server with Vite middlewares in development,
 * robust security headers, structured logging, and persistent REST API.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './src/server/routes.ts';
import { requestLogger, logger } from './src/server/logger.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

export async function createServer() {
  const app = express();

  // 1. Production Security Headers (Permissive CSP for AI Studio iframe & Vite bundles)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "ws:", "wss:", "*"],
          frameAncestors: ["*"], // Allows AI Studio iframe preview
        },
      },
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Frameguard disabled to allow preview inside AI Studio workspace iframe
    })
  );

  // 2. CORS Handling
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  app.use(
    cors({
      origin: allowedOrigin === '*' ? true : allowedOrigin.split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    })
  );

  // 3. Body Parsing with Strict Payload Limits (prevents memory exhaustion DOS)
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 4. Request Logging Middleware (PII-redacted)
  app.use(requestLogger);

  // 5. Mount API Routes
  app.use('/api', apiRouter);

  // 6. Frontend Serving: Vite dev server in development, static build in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // 7. Global Centralized Error Handler (No stack trace leaks)
  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled Server Exception', {
      error: err instanceof Error ? err.message : String(err),
      path: req.path,
      method: req.method,
    });

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Our engineering team has been notified.',
    });
  });

  return app;
}

// Start Server when invoked directly
if (process.env.NODE_ENV !== 'test') {
  createServer()
    .then(app => {
      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`InternHub Production-Ready Server running at http://0.0.0.0:${PORT}`, {
          environment: process.env.NODE_ENV || 'development',
          port: PORT,
        });
      });
    })
    .catch(err => {
      logger.error('Fatal server startup failure', { error: String(err) });
      process.exit(1);
    });
}
