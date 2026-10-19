export interface Internship {
  id: number;
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
  is_active: number;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  error?: string;
  message?: string;
  validationErrors?: Record<string, string>;
}

export interface PortalStats {
  activeInternships: number;
  totalApplications: number;
  partnerCompanies: number;
  domains: number;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  graduationYear: string;
  skills: string;
  coverLetter: string;
  internshipId: number;
}

export interface ApplicationSubmissionResult {
  applicationId: number;
  applicationRef: string;
  internshipId: number;
  internshipTitle: string;
  company: string;
  submittedAt: string;
  status: string;
}

export interface ApplicationLookupResult {
  applicationRef: string;
  internshipId: number;
  internshipTitle: string;
  company: string;
  applicantNameMasked: string;
  college: string;
  degree: string;
  status: string;
  submittedAt: string;
}

export interface HealthCheckData {
  success: boolean;
  status: string;
  service: string;
  database: string;
  timestamp: string;
  version: string;
  uptime: number;
}
