/**
 * InternHub Persistent Database Module
 * Uses Node 22 native DatabaseSync (node:sqlite) with parameterized queries,
 * foreign key integrity, and safe idempotency.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { logger } from './logger.ts';

export interface InternshipRecord {
  id: number;
  title: string;
  company: string;
  location: string;
  domain: string;
  type: string;
  stipend: string;
  duration: string;
  description: string;
  requirements: string[]; // parsed from JSON
  responsibilities: string[]; // parsed from JSON
  deadline: string;
  is_active: number;
  created_at: string;
}

export interface ApplicationRecord {
  id: number;
  application_ref: string;
  internship_id: number;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  graduation_year: number;
  skills: string;
  cover_letter: string;
  status: string;
  created_at: string;
}

const DEFAULT_DB_PATH = process.env.DATABASE_PATH || './data/internhub.db';

export class DatabaseManager {
  private db: DatabaseSync;
  private dbPath: string;

  constructor(customPath?: string) {
    this.dbPath = customPath || DEFAULT_DB_PATH;
    const resolvedDir = path.dirname(path.resolve(this.dbPath));

    if (!fs.existsSync(resolvedDir)) {
      fs.mkdirSync(resolvedDir, { recursive: true });
    }

    this.db = new DatabaseSync(this.dbPath);
    this.init();
  }

  private init() {
    try {
      // 1. Enforce Foreign Keys
      this.db.exec('PRAGMA foreign_keys = ON;');
      this.db.exec('PRAGMA journal_mode = WAL;');

      // 2. Create Internships Table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS internships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          domain TEXT NOT NULL,
          type TEXT NOT NULL,
          stipend TEXT NOT NULL,
          duration TEXT NOT NULL,
          description TEXT NOT NULL,
          requirements TEXT NOT NULL,
          responsibilities TEXT NOT NULL,
          deadline TEXT NOT NULL,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Create Applications Table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          application_ref TEXT NOT NULL UNIQUE,
          internship_id INTEGER NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          college TEXT NOT NULL,
          degree TEXT NOT NULL,
          graduation_year INTEGER NOT NULL,
          skills TEXT NOT NULL,
          cover_letter TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'submitted',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
          UNIQUE (internship_id, email)
        );
      `);

      // 4. Create Indexes
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_internships_domain ON internships(domain);
        CREATE INDEX IF NOT EXISTS idx_internships_active ON internships(is_active);
        CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
        CREATE INDEX IF NOT EXISTS idx_applications_email_internship ON applications(email, internship_id);
        CREATE INDEX IF NOT EXISTS idx_applications_ref ON applications(application_ref);
      `);

      logger.info('Database initialized successfully', { path: this.dbPath });

      // 5. Seed only if empty (preserves production data)
      this.seedIfEmpty();
    } catch (err) {
      logger.error('Failed to initialize database schema', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  private seedIfEmpty() {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM internships').get() as { count: number };
    if (row && row.count > 0) {
      return;
    }

    logger.info('Seeding initial realistic internship listings...');

    const sampleInternships = [
      {
        title: 'Full-Stack Software Engineering Intern',
        company: 'CloudScale Technologies',
        location: 'Remote / San Francisco, CA',
        domain: 'Software Engineering',
        type: 'Remote',
        stipend: '$3,500 / month',
        duration: '12 Weeks (Summer 2026)',
        description: 'Join our core platform engineering team to build scalable microservices and intuitive developer dashboard interfaces using React, TypeScript, and Node.js.',
        requirements: JSON.stringify([
          'Proficiency with JavaScript/TypeScript, React, and Node.js or Express',
          'Understanding of relational databases and RESTful API architecture',
          'Familiarity with Git and modern CI/CD practices',
          'Pursuing BS/MS in Computer Science or related STEM field',
        ]),
        responsibilities: JSON.stringify([
          'Design, implement, and unit-test full-stack web features',
          'Collaborate with senior engineers on database query optimization',
          'Participate in agile sprints, daily standups, and bi-weekly code reviews',
          'Present a final capstone feature to company engineering leadership',
        ]),
        deadline: '2026-11-30',
      },
      {
        title: 'AI & Machine Learning Research Intern',
        company: 'Cognitive Dynamics AI',
        location: 'New York, NY (Hybrid)',
        domain: 'Data & AI',
        type: 'Hybrid',
        stipend: '$4,200 / month',
        duration: '16 Weeks (Fall 2026)',
        description: 'Collaborate with our research scientists on generative multimodal model evaluations, agentic workflow optimization, and high-throughput vector search pipelines.',
        requirements: JSON.stringify([
          'Strong background in Python, PyTorch, or TensorFlow',
          'Foundational understanding of transformer architectures and embeddings',
          'Experience with data visualization (Matplotlib, Seaborn) and pandas',
          'Enrolled in Computer Science, Data Science, or Mathematics',
        ]),
        responsibilities: JSON.stringify([
          'Benchmark LLM reasoning capabilities on domain-specific datasets',
          'Build end-to-end evaluation harnesses and automated scoring scripts',
          'Document algorithmic findings in internal technical memos',
          'Integrate model endpoints into customer-facing demonstration UI',
        ]),
        deadline: '2026-12-15',
      },
      {
        title: 'Product Design & UI/UX Systems Intern',
        company: 'PixelCraft Studio',
        location: 'Remote / Seattle, WA',
        domain: 'Product Design',
        type: 'Remote',
        stipend: '$3,000 / month',
        duration: '12 Weeks (Summer 2026)',
        description: 'Shape the next generation of our design system. You will conduct user research, craft accessible design components in Figma, and collaborate with engineers.',
        requirements: JSON.stringify([
          'Strong portfolio showcasing UI/UX case studies and wireframes',
          'Deep proficiency with Figma, auto-layout, and design token architectures',
          'Understanding of WCAG 2.2 accessibility standards and typography scale',
          'Basic understanding of HTML/CSS web layout constraints',
        ]),
        responsibilities: JSON.stringify([
          'Conduct user testing interviews and synthesize actionable feedback',
          'Design reusable component sets with interactive micro-animations',
          'Audit existing web application surfaces for contrast and keyboard flow',
          'Partner with front-end developers to review implementation fidelity',
        ]),
        deadline: '2026-11-20',
      },
      {
        title: 'Cloud Infrastructure & DevOps Intern',
        company: 'Apex Cloud Systems',
        location: 'Austin, TX (On-site)',
        domain: 'DevOps & Cloud',
        type: 'On-site',
        stipend: '$3,800 / month',
        duration: '12 Weeks (Summer 2026)',
        description: 'Work alongside site reliability engineers managing distributed Kubernetes clusters, Terraform infrastructure-as-code, and zero-downtime deployment pipelines.',
        requirements: JSON.stringify([
          'Familiarity with Linux operating systems and Bash scripting',
          'Fundamental understanding of Docker containerization and networking',
          'Basic knowledge of AWS or Google Cloud Platform primitives',
          'Eagerness to learn Prometheus metrics, Grafana, and OpenTelemetry',
        ]),
        responsibilities: JSON.stringify([
          'Automate deployment verification tests in GitHub Actions pipelines',
          'Assist in provisioning cloud environments using Terraform',
          'Monitor cluster health telemetry and configure alert thresholds',
          'Refactor container Dockerfiles for minimal image size and fast caching',
        ]),
        deadline: '2026-12-01',
      },
      {
        title: 'Cybersecurity Analyst & Defense Intern',
        company: 'Sentinel Security Labs',
        location: 'Boston, MA (Hybrid)',
        domain: 'Cybersecurity',
        type: 'Hybrid',
        stipend: '$3,600 / month',
        duration: '14 Weeks (Fall 2026)',
        description: 'Help defend critical digital infrastructure by performing vulnerability assessments, code audits, penetration testing scenarios, and threat modeling.',
        requirements: JSON.stringify([
          'Knowledge of OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, etc.)',
          'Understanding of TCP/IP networking, firewalls, and TLS/SSL protocols',
          'Familiarity with Python or Go for writing automated scanning scripts',
          'Student in Cybersecurity, Computer Engineering, or Information Systems',
        ]),
        responsibilities: JSON.stringify([
          'Perform automated and manual static code analysis (SAST)',
          'Assist security operations team in triaging incoming incident alerts',
          'Conduct simulated social engineering and phishing awareness audits',
          'Author remediating security guidelines for developer engineering teams',
        ]),
        deadline: '2026-12-10',
      },
      {
        title: 'Data Science & Quantitative Analytics Intern',
        company: 'Quantify Insights',
        location: 'Remote / Chicago, IL',
        domain: 'Data & AI',
        type: 'Remote',
        stipend: '$3,400 / month',
        duration: '10 Weeks (Summer 2026)',
        description: 'Extract actionable intelligence from petabyte-scale time series datasets, train predictive forecasting models, and present interactive analytics dashboards.',
        requirements: JSON.stringify([
          'Proficiency with SQL, relational schema design, and query optimization',
          'Experience with Python data stack (NumPy, pandas, Scikit-learn)',
          'Working knowledge of hypothesis testing and statistical regression',
          'Ability to communicate technical findings to non-technical partners',
        ]),
        responsibilities: JSON.stringify([
          'Build automated ETL pipelines ingesting raw telemetry data',
          'Develop predictive models to forecast customer demand trends',
          'Create self-service dashboards using modern visualization libraries',
          'Validate statistical significance of product A/B test experiments',
        ]),
        deadline: '2026-11-25',
      },
      {
        title: 'Mobile Application Engineering Intern (iOS/Android)',
        company: 'Veloce Interactive',
        location: 'Denver, CO (Hybrid)',
        domain: 'Software Engineering',
        type: 'Hybrid',
        stipend: '$3,200 / month',
        duration: '12 Weeks (Summer 2026)',
        description: 'Build polished, fluid mobile experiences used by over 2 million consumers. Focus on offline-first sync, reactive architectures, and silky 60fps animations.',
        requirements: JSON.stringify([
          'Experience building mobile apps with React Native, Swift, or Kotlin',
          'Familiarity with state management libraries and client caching',
          'Eye for micro-interactions, responsive touch targets, and fluid layout',
          'Passion for clean code architecture and automated testing',
        ]),
        responsibilities: JSON.stringify([
          'Implement core user-facing features on iOS and Android platforms',
          'Integrate secure biometric authentication and keychain storage',
          'Optimize app startup time and reduce memory footprint',
          'Write end-to-end automated UI integration tests',
        ]),
        deadline: '2026-12-05',
      },
      {
        title: 'Backend Systems & API Engineering Intern',
        company: 'Distributed Nexus',
        location: 'Remote / Toronto, ON',
        domain: 'Software Engineering',
        type: 'Remote',
        stipend: '$3,600 / month',
        duration: '14 Weeks (Fall 2026)',
        description: 'Design and harden high-throughput REST and gRPC service layers, implement caching strategies with Redis, and ensure fault-tolerant message handling.',
        requirements: JSON.stringify([
          'Solid proficiency in Node.js, Go, or Java',
          'Understanding of concurrency, asynchronous event loops, and locks',
          'Hands-on experience with SQL query indexing and performance tuning',
          'Dedication to writing comprehensive unit and integration test suites',
        ]),
        responsibilities: JSON.stringify([
          'Author robust REST API endpoints following strict OpenAPI specs',
          'Refactor legacy database queries to eliminate N+1 bottlenecks',
          'Implement idempotent webhook handlers and dead-letter queues',
          'Document API contracts and generate client SDK definitions',
        ]),
        deadline: '2026-12-20',
      },
    ];

    const insertStmt = this.db.prepare(`
      INSERT INTO internships (
        title, company, location, domain, type, stipend, duration, description, requirements, responsibilities, deadline, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    for (const item of sampleInternships) {
      insertStmt.run(
        item.title,
        item.company,
        item.location,
        item.domain,
        item.type,
        item.stipend,
        item.duration,
        item.description,
        item.requirements,
        item.responsibilities,
        item.deadline
      );
    }

    logger.info('Seeded 8 high-quality internship records.');
  }

  // --- Internships Queries ---

  getInternships(params: {
    search?: string;
    domain?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const conditions: string[] = ['is_active = 1'];
    const sqlParams: (string | number)[] = [];

    if (params.domain && params.domain !== 'All') {
      conditions.push('domain = ?');
      sqlParams.push(params.domain);
    }

    if (params.type && params.type !== 'All') {
      conditions.push('type = ?');
      sqlParams.push(params.type);
    }

    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      conditions.push('(title LIKE ? OR company LIKE ? OR description LIKE ? OR requirements LIKE ?)');
      sqlParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total Count query
    const countSql = `SELECT COUNT(*) as total FROM internships ${whereClause}`;
    const totalRow = this.db.prepare(countSql).get(...sqlParams) as { total: number };
    const total = totalRow ? totalRow.total : 0;

    // Pagination
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 6));
    const offset = (page - 1) * limit;

    const selectSql = `
      SELECT id, title, company, location, domain, type, stipend, duration, description,
             requirements, responsibilities, deadline, is_active, created_at
      FROM internships
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const rows = this.db.prepare(selectSql).all(...sqlParams, limit, offset) as Array<{
      id: number;
      title: string;
      company: string;
      location: string;
      domain: string;
      type: string;
      stipend: string;
      duration: string;
      description: string;
      requirements: string;
      responsibilities: string;
      deadline: string;
      is_active: number;
      created_at: string;
    }>;

    const items: InternshipRecord[] = rows.map(r => ({
      ...r,
      requirements: this.safeParseArray(r.requirements),
      responsibilities: this.safeParseArray(r.responsibilities),
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: offset + items.length < total,
        hasPrev: page > 1,
      },
    };
  }

  getInternshipById(id: number): InternshipRecord | null {
    const row = this.db.prepare(`
      SELECT id, title, company, location, domain, type, stipend, duration, description,
             requirements, responsibilities, deadline, is_active, created_at
      FROM internships
      WHERE id = ? AND is_active = 1
    `).get(id) as {
      id: number;
      title: string;
      company: string;
      location: string;
      domain: string;
      type: string;
      stipend: string;
      duration: string;
      description: string;
      requirements: string;
      responsibilities: string;
      deadline: string;
      is_active: number;
      created_at: string;
    } | undefined;

    if (!row) return null;

    return {
      ...row,
      requirements: this.safeParseArray(row.requirements),
      responsibilities: this.safeParseArray(row.responsibilities),
    };
  }

  createInternship(data: {
    title: string;
    company: string;
    location: string;
    domain: string;
    type: string;
    stipend: string;
    duration: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    deadline: string;
  }): InternshipRecord {
    const stmt = this.db.prepare(`
      INSERT INTO internships (
        title, company, location, domain, type, stipend, duration, description,
        requirements, responsibilities, deadline, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = stmt.run(
      data.title,
      data.company,
      data.location,
      data.domain,
      data.type,
      data.stipend,
      data.duration,
      data.description,
      JSON.stringify(data.requirements),
      JSON.stringify(data.responsibilities),
      data.deadline
    );

    const insertedId = Number(result.lastInsertRowid);
    return this.getInternshipById(insertedId)!;
  }

  updateInternship(
    id: number,
    data: {
      title: string;
      company: string;
      location: string;
      domain: string;
      type: string;
      stipend: string;
      duration: string;
      description: string;
      requirements: string[];
      responsibilities: string[];
      deadline: string;
    }
  ): InternshipRecord | null {
    const existing = this.getInternshipById(id);
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE internships
      SET title = ?, company = ?, location = ?, domain = ?, type = ?,
          stipend = ?, duration = ?, description = ?, requirements = ?,
          responsibilities = ?, deadline = ?
      WHERE id = ?
    `);

    stmt.run(
      data.title,
      data.company,
      data.location,
      data.domain,
      data.type,
      data.stipend,
      data.duration,
      data.description,
      JSON.stringify(data.requirements),
      JSON.stringify(data.responsibilities),
      data.deadline,
      id
    );

    return this.getInternshipById(id);
  }

  deleteInternship(id: number): boolean {
    const existing = this.getInternshipById(id);
    if (!existing) return false;

    // Soft delete to protect referential integrity while removing from public listings
    this.db.prepare('UPDATE internships SET is_active = 0 WHERE id = ?').run(id);
    return true;
  }

  // --- Applications Queries ---

  createApplication(data: {
    internshipId: number;
    fullName: string;
    email: string;
    phone: string;
    college: string;
    degree: string;
    graduationYear: number;
    skills: string;
    coverLetter: string;
  }): { success: boolean; applicationRef: string; id: number; error?: string; isDuplicate?: boolean } {
    // 1. Verify foreign key target exists
    const internship = this.getInternshipById(data.internshipId);
    if (!internship) {
      return { success: false, applicationRef: '', id: 0, error: 'The specified internship does not exist or has expired.' };
    }

    // 2. Check for duplicate application (email + internshipId)
    const existing = this.db.prepare(`
      SELECT id, application_ref FROM applications
      WHERE internship_id = ? AND email = ?
    `).get(data.internshipId, data.email) as { id: number; application_ref: string } | undefined;

    if (existing) {
      return {
        success: false,
        applicationRef: existing.application_ref,
        id: existing.id,
        isDuplicate: true,
        error: `An application with email "${data.email}" has already been submitted for this internship.`,
      };
    }

    // 3. Generate human-readable reference ID: APP-2026-XXXX
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const applicationRef = `APP-2026-${randomHex}`;

    try {
      const stmt = this.db.prepare(`
        INSERT INTO applications (
          application_ref, internship_id, full_name, email, phone, college,
          degree, graduation_year, skills, cover_letter, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
      `);

      const result = stmt.run(
        applicationRef,
        data.internshipId,
        data.fullName,
        data.email,
        data.phone,
        data.college,
        data.degree,
        data.graduationYear,
        data.skills,
        data.coverLetter
      );

      return {
        success: true,
        applicationRef,
        id: Number(result.lastInsertRowid),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('UNIQUE constraint failed')) {
        return {
          success: false,
          applicationRef: '',
          id: 0,
          isDuplicate: true,
          error: `An application with email "${data.email}" has already been submitted for this internship.`,
        };
      }
      throw err;
    }
  }

  getApplicationByRef(ref: string) {
    const row = this.db.prepare(`
      SELECT a.id, a.application_ref, a.internship_id, a.full_name, a.college, a.degree,
             a.graduation_year, a.status, a.created_at,
             i.title as internship_title, i.company as internship_company, i.location as internship_location
      FROM applications a
      JOIN internships i ON a.internship_id = i.id
      WHERE a.application_ref = ?
    `).get(ref) as {
      id: number;
      application_ref: string;
      internship_id: number;
      full_name: string;
      college: string;
      degree: string;
      graduation_year: number;
      status: string;
      created_at: string;
      internship_title: string;
      internship_company: string;
      internship_location: string;
    } | undefined;

    if (!row) return null;

    // Redact sensitive personal PII for public status lookup
    return {
      applicationRef: row.application_ref,
      internshipId: row.internship_id,
      internshipTitle: row.internship_title,
      company: row.internship_company,
      applicantNameMasked: `${row.full_name.slice(0, 2)}*** ${row.full_name.split(' ').slice(1).join(' ').slice(0, 1)}***`,
      college: row.college,
      degree: row.degree,
      status: row.status,
      submittedAt: row.created_at,
    };
  }

  getStats() {
    const activeInternships = this.db.prepare('SELECT COUNT(*) as count FROM internships WHERE is_active = 1').get() as { count: number };
    const totalApplications = this.db.prepare('SELECT COUNT(*) as count FROM applications').get() as { count: number };
    const partnerCompanies = this.db.prepare('SELECT COUNT(DISTINCT company) as count FROM internships WHERE is_active = 1').get() as { count: number };
    const domains = this.db.prepare('SELECT COUNT(DISTINCT domain) as count FROM internships WHERE is_active = 1').get() as { count: number };

    return {
      activeInternships: activeInternships ? activeInternships.count : 0,
      totalApplications: totalApplications ? totalApplications.count : 0,
      partnerCompanies: partnerCompanies ? partnerCompanies.count : 0,
      domains: domains ? domains.count : 0,
    };
  }

  healthCheck(): { healthy: boolean; details?: string } {
    try {
      const check = this.db.prepare('SELECT 1 as alive').get() as { alive: number } | undefined;
      return { healthy: check?.alive === 1 };
    } catch (err) {
      return { healthy: false, details: err instanceof Error ? err.message : String(err) };
    }
  }

  private safeParseArray(val: string): string[] {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [String(parsed)];
    } catch {
      return val.split('\n').filter(Boolean);
    }
  }
}

// Global singleton instance
export const db = new DatabaseManager();
