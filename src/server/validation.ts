/**
 * InternHub Input Validation and Sanitization Module
 * Pure logic decoupled for automated unit testing with node:test.
 */

export interface ApplicationInput {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  college?: unknown;
  degree?: unknown;
  graduationYear?: unknown;
  skills?: unknown;
  coverLetter?: unknown;
  internshipId?: unknown;
}

export interface SanitizedApplication {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  graduationYear: number;
  skills: string;
  coverLetter: string;
  internshipId: number;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export interface InternshipInput {
  title?: unknown;
  company?: unknown;
  location?: unknown;
  domain?: unknown;
  type?: unknown;
  stipend?: unknown;
  duration?: unknown;
  description?: unknown;
  requirements?: unknown;
  responsibilities?: unknown;
  deadline?: unknown;
}

export interface SanitizedInternship {
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

/**
 * Strips basic HTML/script tags to prevent XSS.
 */
export function sanitizeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validates an email address against strict format standards.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 compliant regex subset
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 100;
}

/**
 * Validates telephone number (allowing optional leading +, spaces, dashes, parentheses).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Validates application submission payload.
 */
export function validateApplicationInput(input: ApplicationInput): ValidationResult<SanitizedApplication> {
  const errors: Record<string, string> = {};

  const fullName = sanitizeString(input.fullName);
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (fullName.length > 80) {
    errors.fullName = 'Full name cannot exceed 80 characters.';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(fullName)) {
    errors.fullName = 'Full name can only contain letters, spaces, hyphens, and periods.';
  }

  const rawEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!rawEmail) {
    errors.email = 'Email address is required.';
  } else if (!isValidEmail(rawEmail)) {
    errors.email = 'Please provide a valid email address (e.g. name@university.edu).';
  }

  const rawPhone = typeof input.phone === 'string' ? input.phone.trim() : '';
  if (!rawPhone) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhone(rawPhone)) {
    errors.phone = 'Please provide a valid phone number with 7 to 15 digits.';
  }

  const college = sanitizeString(input.college);
  if (!college) {
    errors.college = 'College or University name is required.';
  } else if (college.length < 2) {
    errors.college = 'College name must be at least 2 characters.';
  } else if (college.length > 120) {
    errors.college = 'College name cannot exceed 120 characters.';
  }

  const degree = sanitizeString(input.degree);
  if (!degree) {
    errors.degree = 'Degree or Major is required.';
  } else if (degree.length < 2) {
    errors.degree = 'Degree must be at least 2 characters.';
  } else if (degree.length > 100) {
    errors.degree = 'Degree cannot exceed 100 characters.';
  }

  const gradYearNum = Number(input.graduationYear);
  const currentYear = new Date().getFullYear();
  if (!input.graduationYear || isNaN(gradYearNum)) {
    errors.graduationYear = 'Graduation year is required.';
  } else if (gradYearNum < currentYear - 2 || gradYearNum > currentYear + 8) {
    errors.graduationYear = `Graduation year must be between ${currentYear - 2} and ${currentYear + 8}.`;
  }

  const skills = sanitizeString(input.skills);
  if (!skills) {
    errors.skills = 'Key skills are required.';
  } else if (skills.length < 2) {
    errors.skills = 'Please list at least one skill.';
  } else if (skills.length > 250) {
    errors.skills = 'Skills description cannot exceed 250 characters.';
  }

  const coverLetter = sanitizeString(input.coverLetter);
  if (!coverLetter) {
    errors.coverLetter = 'Cover letter or statement of interest is required.';
  } else if (coverLetter.length < 30) {
    errors.coverLetter = 'Cover letter must be at least 30 characters explaining your interest.';
  } else if (coverLetter.length > 3000) {
    errors.coverLetter = 'Cover letter cannot exceed 3000 characters.';
  }

  const internshipId = Number(input.internshipId);
  if (!input.internshipId || isNaN(internshipId) || internshipId <= 0) {
    errors.internshipId = 'A valid internship must be selected.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          fullName,
          email: rawEmail,
          phone: rawPhone,
          college,
          degree,
          graduationYear: gradYearNum,
          skills,
          coverLetter,
          internshipId,
        }
      : undefined,
  };
}

/**
 * Validates internship creation/updating payload.
 */
export function validateInternshipInput(input: InternshipInput): ValidationResult<SanitizedInternship> {
  const errors: Record<string, string> = {};

  const title = sanitizeString(input.title);
  if (!title || title.length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  const company = sanitizeString(input.company);
  if (!company || company.length < 2) {
    errors.company = 'Company name must be at least 2 characters.';
  }

  const location = sanitizeString(input.location);
  if (!location) {
    errors.location = 'Location is required.';
  }

  const domain = sanitizeString(input.domain);
  if (!domain) {
    errors.domain = 'Domain is required.';
  }

  const type = sanitizeString(input.type);
  if (!type) {
    errors.type = 'Type is required (e.g. Remote, Hybrid, On-site).';
  }

  const stipend = sanitizeString(input.stipend);
  if (!stipend) {
    errors.stipend = 'Stipend details are required.';
  }

  const duration = sanitizeString(input.duration);
  if (!duration) {
    errors.duration = 'Duration is required.';
  }

  const description = sanitizeString(input.description);
  if (!description || description.length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }

  let requirements: string[] = [];
  if (Array.isArray(input.requirements)) {
    requirements = input.requirements.map(r => sanitizeString(r)).filter(Boolean);
  } else if (typeof input.requirements === 'string') {
    requirements = input.requirements.split('\n').map(r => sanitizeString(r)).filter(Boolean);
  }
  if (requirements.length === 0) {
    errors.requirements = 'At least one requirement is required.';
  }

  let responsibilities: string[] = [];
  if (Array.isArray(input.responsibilities)) {
    responsibilities = input.responsibilities.map(r => sanitizeString(r)).filter(Boolean);
  } else if (typeof input.responsibilities === 'string') {
    responsibilities = input.responsibilities.split('\n').map(r => sanitizeString(r)).filter(Boolean);
  }
  if (responsibilities.length === 0) {
    errors.responsibilities = 'At least one responsibility is required.';
  }

  const deadline = sanitizeString(input.deadline);
  if (!deadline) {
    errors.deadline = 'Application deadline is required.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          title,
          company,
          location,
          domain,
          type,
          stipend,
          duration,
          description,
          requirements,
          responsibilities,
          deadline,
        }
      : undefined,
  };
}

/**
 * Validates and sanitizes pagination query parameters safely.
 */
export function sanitizePagination(pageParam: unknown, limitParam: unknown) {
  let page = parseInt(String(pageParam), 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(String(limitParam), 10);
  if (isNaN(limit) || limit < 1) limit = 6;
  if (limit > 50) limit = 50; // Guard against denial-of-service / huge allocations

  return { page, limit, offset: (page - 1) * limit };
}
