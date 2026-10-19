/**
 * InternHub REST API Routes
 * Implements standard endpoints, validation, pagination, and error handling.
 */

import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import {
  validateApplicationInput,
  validateInternshipInput,
  sanitizePagination,
} from './validation.ts';
import { requireAdminAuth, applicationRateLimiter } from './security.ts';
import { logger } from './logger.ts';

export const apiRouter = Router();

/**
 * 1. Health Monitoring Endpoint
 * GET /api/health
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  const dbHealth = db.healthCheck();

  if (!dbHealth.healthy) {
    logger.error('Health check failed: database unavailable', { details: dbHealth.details });
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      service: 'InternHub API',
      database: 'disconnected',
      error: 'Essential database connectivity check failed.',
    });
  }

  return res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'InternHub API',
    database: 'connected',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * 2. Portal Statistics
 * GET /api/stats
 */
apiRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    logger.error('Failed to query statistics', { error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Unable to retrieve statistics at this time.',
    });
  }
});

/**
 * 3. List Internships with Search, Domain/Type Filtering, & Pagination
 * GET /api/internships
 */
apiRouter.get('/internships', (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;

    const { page, limit } = sanitizePagination(req.query.page, req.query.limit);

    const result = db.getInternships({
      search,
      domain,
      type,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      filters: {
        search: search || '',
        domain: domain || 'All',
        type: type || 'All',
      },
    });
  } catch (err) {
    logger.error('Failed to retrieve internships', { error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve internship listings.',
    });
  }
});

/**
 * 4. Get Single Internship Details
 * GET /api/internships/:id
 */
apiRouter.get('/internships/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid internship ID. Expected a positive integer.',
    });
  }

  try {
    const internship = db.getInternshipById(id);
    if (!internship) {
      return res.status(404).json({
        success: false,
        error: `Internship with ID ${id} was not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (err) {
    logger.error('Error fetching internship details', { id, error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Internal server error while loading internship details.',
    });
  }
});

/**
 * 5. Submit Application (Rate limited, strictly validated, duplicate protected)
 * POST /api/applications
 */
apiRouter.post('/applications', applicationRateLimiter, (req: Request, res: Response) => {
  try {
    const validation = validateApplicationInput(req.body);

    if (!validation.isValid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed. Please correct the highlighted errors.',
        validationErrors: validation.errors,
      });
    }

    const { data } = validation;
    const result = db.createApplication({
      internshipId: data.internshipId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      college: data.college,
      degree: data.degree,
      graduationYear: data.graduationYear,
      skills: data.skills,
      coverLetter: data.coverLetter,
    });

    if (!result.success) {
      if (result.isDuplicate) {
        return res.status(409).json({
          success: false,
          error: 'Duplicate Application',
          message: result.error,
          existingApplicationRef: result.applicationRef,
        });
      }

      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to submit application.',
      });
    }

    const targetInternship = db.getInternshipById(data.internshipId);

    logger.info('Application submitted successfully', {
      applicationRef: result.applicationRef,
      internshipId: data.internshipId,
    });

    return res.status(201).json({
      success: true,
      message: 'Your internship application has been successfully recorded.',
      data: {
        applicationId: result.id,
        applicationRef: result.applicationRef,
        internshipId: data.internshipId,
        internshipTitle: targetInternship?.title || 'Selected Internship',
        company: targetInternship?.company || 'Partner Organization',
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      },
    });
  } catch (err) {
    logger.error('Unexpected error handling application submission', { error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while processing your application. Please try again.',
    });
  }
});

/**
 * 6. Application Status Lookup (Privacy-preserved)
 * GET /api/applications/lookup/:ref
 */
apiRouter.get('/applications/lookup/:ref', (req: Request, res: Response) => {
  const ref = req.params.ref ? req.params.ref.trim().toUpperCase() : '';
  if (!ref || !ref.startsWith('APP-')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid application reference. Reference format should look like APP-2026-XXXX.',
    });
  }

  try {
    const record = db.getApplicationByRef(ref);
    if (!record) {
      return res.status(404).json({
        success: false,
        error: `No application found with reference ID "${ref}".`,
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (err) {
    logger.error('Error looking up application status', { error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Failed to look up application status.',
    });
  }
});

/**
 * 7. Administrative Endpoint: Create Internship
 * POST /api/internships (Protected)
 */
apiRouter.post('/internships', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const validation = validateInternshipInput(req.body);
    if (!validation.isValid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for new internship listing.',
        validationErrors: validation.errors,
      });
    }

    const created = db.createInternship(validation.data);
    logger.info('Admin created new internship listing', { id: created.id, title: created.title });

    return res.status(201).json({
      success: true,
      message: 'Internship posting created successfully.',
      data: created,
    });
  } catch (err) {
    logger.error('Failed to create internship', { error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Server error while creating internship.',
    });
  }
});

/**
 * 8. Administrative Endpoint: Update Internship
 * PUT /api/internships/:id (Protected)
 */
apiRouter.put('/internships/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid internship ID.',
    });
  }

  try {
    const validation = validateInternshipInput(req.body);
    if (!validation.isValid || !validation.data) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for internship update.',
        validationErrors: validation.errors,
      });
    }

    const updated = db.updateInternship(id, validation.data);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Internship with ID ${id} was not found.`,
      });
    }

    logger.info('Admin updated internship listing', { id });
    return res.status(200).json({
      success: true,
      message: 'Internship updated successfully.',
      data: updated,
    });
  } catch (err) {
    logger.error('Failed to update internship', { id, error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Server error while updating internship.',
    });
  }
});

/**
 * 9. Administrative Endpoint: Delete Internship
 * DELETE /api/internships/:id (Protected)
 */
apiRouter.delete('/internships/:id', requireAdminAuth, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid internship ID.',
    });
  }

  try {
    const deleted = db.deleteInternship(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Internship with ID ${id} was not found.`,
      });
    }

    logger.info('Admin archived internship listing', { id });
    return res.status(200).json({
      success: true,
      message: `Internship ${id} successfully removed from public listings.`,
    });
  } catch (err) {
    logger.error('Failed to delete internship', { id, error: String(err) });
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting internship.',
    });
  }
});

/**
 * 10. Catch-all 404 for unknown API routes
 */
apiRouter.all('*', (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});
