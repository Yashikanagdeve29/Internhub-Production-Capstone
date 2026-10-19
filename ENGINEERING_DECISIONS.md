# InternHub Capstone — Engineering Decisions & Architectural Trade-Offs

**Project:** InternHub — Full-Stack Internship Portal  
**Document Type:** Architectural Decision Record (ADR) & Technical Rationale  
**Author:** Senior Full-Stack Software Engineer  
**Date:** October 19, 2026  

---

## 1. Architectural Overview

InternHub is architected as a modular, full-stack web application designed for high performance, maintainability, accessibility, and security:
- **Client Layer:** Modular React 19 components with TypeScript, styled using Tailwind CSS v4, adhering to WCAG 2.2 AA accessibility standards.
- **Server Layer:** Node.js v22 + Express REST API providing standardized endpoints (`/api/*`), structured request logging, and robust security middleware.
- **Persistence Layer:** Persistent SQLite 3 engine using Node 22 native `DatabaseSync`, configured with Write-Ahead Logging (WAL) and foreign key integrity.

---

## 2. Core Engineering Decisions

### 1. Why Vanilla JavaScript in Early Milestones & Evolution to React/TypeScript?
- **Foundational Standard:** Milestone 1 utilized semantic HTML, modern CSS, and Vanilla JavaScript to establish foundational web standard compliance without framework abstraction overhead.
- **Type-Safe Component Architecture:** For Milestone 3 and the Capstone Production Deliverable, the frontend was elevated to React 19 and TypeScript with Vite. This provided strict type-safety across shared API contracts, declarative state transitions for interactive modal dialogs (Details, Application Form, Status Lookup, Admin Portal, and Health Monitor), and robust keyboard focus management while preserving the underlying REST API contracts.

### 2. Why Node.js and Express.js?
- **Universal JavaScript Ecosystem:** Having TypeScript across both frontend and backend enables shared type definitions (`src/types.ts`) and zero context switching for the engineering team.
- **Fast, Non-Blocking REST API:** Express provides a lightweight, battle-tested HTTP layer with rich middleware composition for security headers (Helmet), CORS, JSON payload limits, structured logging, and rate limiting.

### 3. Why SQLite for Local & Container Persistence?
- **Zero-Configuration Embedded Storage:** SQLite requires no separate database daemon or complex network topology, storing data deterministically on disk at `./data/internhub.db`.
- **Node 22 Native Support:** Leveraging Node 22's built-in `node:sqlite` (`DatabaseSync`) eliminates third-party native C++ compilation bindings (which often fail across varying OS container images) while delivering near-instant query execution.
- **ACID Compliance & Foreign Keys:** With `PRAGMA foreign_keys = ON;` and WAL mode enabled, SQLite provides ACID transactional guarantees and referential integrity between applications and internship listings.

### 4. Why PostgreSQL When Necessary?
- **Cloud Scale & Horizontal Concurrency:** In distributed serverless hosting environments (e.g. multi-instance Cloud Run or Kubernetes pods) where container filesystems are ephemeral or stateless, a managed relational database such as PostgreSQL (Google Cloud SQL or Supabase) provides connection pooling, concurrent multi-master writes, and automated cloud snapshots.
- **Migration Path:** InternHub's schema is intentionally relational and parameterized, enabling straightforward migration to PostgreSQL with minimal ORM or driver adjustments.

### 5. Why Dual Client & Server-Side Validation?
- **Immediate User Experience (Client-Side):** Real-time client-side feedback prevents user frustration by highlighting incomplete or improperly formatted fields (e.g., malformed email, phone numbers under 7 digits, cover letters under 30 characters) before network submission.
- **Absolute Data Integrity & Security (Server-Side):** Client-side validation can be bypassed by malicious actors via direct curl or Postman requests. Server-side validation independently sanitizes inputs, enforces length thresholds, checks graduation year boundaries, and prevents duplicate applications, ensuring that malformed payloads never compromise database integrity.

### 6. Why Rate Limiting?
- **Denial of Service & Spam Mitigation:** Publicly accessible application forms are high-value targets for automated spam bots and credential stuffing.
- **Sliding Window Protection:** InternHub implements an in-memory sliding window rate limiter on `POST /api/applications` that restricts clients to a maximum of 10 applications per 15 minutes per IP address, responding with HTTP 429 Too Many Requests and an RFC-compliant `Retry-After` header.

### 7. Why Parameterized Queries?
- **SQL Injection Elimination:** Dynamic SQL string concatenation allows attackers to inject malicious SQL syntax (e.g., `' OR '1'='1`). By using parameterized queries with `?` placeholders, SQLite strictly treats user inputs as scalar data values, making SQL injection mathematically impossible.

### 8. Why PII Redaction in Logging?
- **Compliance & Privacy:** Production logs often end up in centralized observability aggregators (Datadog, CloudWatch, GCP Cloud Logging) where multiple engineers and automated tools have read access.
- **Zero Sensitive Data Leaks:** InternHub's structured logger explicitly strips candidate email addresses, telephone numbers, and cover letter text from log payloads, preserving privacy while logging essential diagnostic telemetry (HTTP method, route, status code, duration, request ID).

---

## 3. Trade-Offs & Technical Constraints

| Decision | Benefit | Trade-Off / Constraint | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **SQLite on Disk** | Simple setup, zero external dependencies, ultra-fast reads. | Ephemeral container filesystems lose data on redeployment if persistent volumes are not mounted. | Database directory `./data` is outside static web assets; documented clear migration steps to PostgreSQL for serverless deployments. |
| **In-Memory Rate Limiting** | Zero Redis latency; instantaneous rate checks without external cache services. | Resets upon server restart; does not synchronize state across multiple horizontal instances. | Ideal for single-node deployments; can be swapped with a Redis-backed rate limiter for distributed clusters. |
| **Admin Key Authentication** | Direct, deterministic protection of administrative write routes (`POST /api/internships`). | Static API key rather than full OAuth 2.0 / JWT login. | Sufficient for capstone; securely configured via `ADMIN_API_KEY` environment variable. |

---

## 4. Future Roadmap & Production Enhancements

1. **Candidate Resume Uploads:** Integration with Google Cloud Storage or AWS S3 presigned URLs for secure PDF resume attachments with antivirus scanning.
2. **Automated Recruiter Email Notifications:** Integration with transactional email providers (SendGrid or AWS SES) to send automated confirmation emails with application status tracking links.
3. **Multi-Role Authentication (RBAC):** Transition from admin API keys to full JWT session management with distinct roles: Candidate, Recruiter, and System Administrator.
