import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Building,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Internship, ApplicationSubmissionResult } from '../types.ts';

interface ApplicationModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  internship,
  isOpen,
  onClose,
  onApplicationSubmitted,
}) => {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [skills, setSkills] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // UI / Status State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<ApplicationSubmissionResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset form when opened for a new internship
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setTouched({});
      setServerError(null);
      setSubmissionSuccess(null);
      setCopied(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, internship?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  // Client-side field validator
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Full name can only contain letters, spaces, and hyphens.';
        return null;
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address.';
        return null;
      case 'phone': {
        if (!value.trim()) return 'Phone number is required.';
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) return 'Phone must contain between 7 and 15 digits.';
        return null;
      }
      case 'college':
        if (!value.trim()) return 'College / University is required.';
        if (value.trim().length < 2) return 'College name must be at least 2 characters.';
        return null;
      case 'degree':
        if (!value.trim()) return 'Degree / Major is required.';
        if (value.trim().length < 2) return 'Degree must be at least 2 characters.';
        return null;
      case 'graduationYear': {
        const year = Number(value);
        const currYear = new Date().getFullYear();
        if (!value || isNaN(year)) return 'Graduation year is required.';
        if (year < currYear - 2 || year > currYear + 8) return `Graduation year must be between ${currYear - 2} and ${currYear + 8}.`;
        return null;
      }
      case 'skills':
        if (!value.trim()) return 'Key skills are required.';
        if (value.trim().length < 2) return 'Please enter at least one skill.';
        return null;
      case 'coverLetter':
        if (!value.trim()) return 'Cover letter statement is required.';
        if (value.trim().length < 30) return `Cover letter must be at least 30 characters (${value.trim().length}/30).`;
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, value);
    setErrors(prev => {
      const next = { ...prev };
      if (errorMsg) next[field] = errorMsg;
      else delete next[field];
      return next;
    });
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'fullName') setFullName(value);
    if (field === 'email') setEmail(value);
    if (field === 'phone') setPhone(value);
    if (field === 'college') setCollege(value);
    if (field === 'degree') setDegree(value);
    if (field === 'graduationYear') setGraduationYear(value);
    if (field === 'skills') setSkills(value);
    if (field === 'coverLetter') setCoverLetter(value);

    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors(prev => {
        const next = { ...prev };
        if (errorMsg) next[field] = errorMsg;
        else delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internship) return;

    // Validate all fields
    const formValues: Record<string, string> = {
      fullName,
      email,
      phone,
      college,
      degree,
      graduationYear,
      skills,
      coverLetter,
    };

    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    for (const [key, val] of Object.entries(formValues)) {
      newTouched[key] = true;
      const errorMsg = validateField(key, val);
      if (errorMsg) newErrors[key] = errorMsg;
    }

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setServerError('Please review the form and correct the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId: internship.id,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
          degree: degree.trim(),
          graduationYear: Number(graduationYear),
          skills: skills.trim(),
          coverLetter: coverLetter.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 409) {
          setServerError(
            `Duplicate submission: ${result.message || 'You have already applied for this role with this email address.'}`
          );
        } else if (response.status === 429) {
          setServerError(
            `Rate limit exceeded: ${result.message || 'Too many submissions. Please wait before attempting again.'}`
          );
        } else {
          setServerError(result.error || 'Failed to submit application. Please check your data and retry.');
        }
        setIsSubmitting(false);
        return;
      }

      // Successful submission
      setSubmissionSuccess(result.data);
      setIsSubmitting(false);
      onApplicationSubmitted();
    } catch (err) {
      setServerError('Network error while connecting to InternHub server. Please verify your connection and try again.');
      setIsSubmitting(false);
    }
  };

  const copyRefToClipboard = () => {
    if (submissionSuccess?.applicationRef) {
      navigator.clipboard.writeText(submissionSuccess.applicationRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen || !internship) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-heading"
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure Application Portal</span>
            </div>
            <h3 id="application-modal-heading" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              Apply for {internship.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{internship.company}</span>
              <span>•</span>
              <span>{internship.location}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            aria-label="Close application form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {submissionSuccess ? (
            /* Genuine Confirmation State */
            <div className="py-6 px-2 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Application Successfully Recorded
                </span>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-3">
                  Thank You, {fullName.split(' ')[0]}!
                </h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                  Your application for <span className="font-semibold text-slate-800">{submissionSuccess.internshipTitle}</span> has been securely stored in our persistent SQLite database.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Application Reference ID
                  </span>
                  <button
                    type="button"
                    onClick={copyRefToClipboard}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    aria-label="Copy application reference ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-lg font-bold text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span>{submissionSuccess.applicationRef}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Keep this reference code to check your recruitment status anytime on InternHub.
                </p>
              </div>

              {/* Next Steps Timeline */}
              <div className="border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  What Happens Next?
                </h5>
                <ol className="relative border-l border-indigo-200 ml-2 space-y-3 text-xs text-slate-600">
                  <li className="ml-4">
                    <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="font-bold text-slate-800 block">Application Ingestion Complete</span>
                    Your credentials have been indexed into our persistent database.
                  </li>
                  <li className="ml-4">
                    <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-slate-300" />
                    <span className="font-bold text-slate-800 block">Resume & Portfolio Review</span>
                    Recruiters at {submissionSuccess.company} will review submissions within 3–5 business days.
                  </li>
                  <li className="ml-4">
                    <div className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full bg-slate-300" />
                    <span className="font-bold text-slate-800 block">Interview Invitation</span>
                    Shortlisted candidates receive an email invitation for the technical evaluation round.
                  </li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Done & Back to Portal
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Top Server Error Announcement */}
              {serverError && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block">Submission Alert</span>
                    <span>{serverError}</span>
                  </div>
                </div>
              )}

              {/* Section 1: Candidate Identity */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  1. Candidate Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="form-full-name" className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="form-full-name"
                      value={fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={(e) => handleBlur('fullName', e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      aria-required="true"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'error-fullName' : undefined}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                        errors.fullName && touched.fullName
                          ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.fullName && touched.fullName && (
                      <p id="error-fullName" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="form-email" className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="form-email"
                      value={email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={(e) => handleBlur('email', e.target.value)}
                      placeholder="alex.rivera@university.edu"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                        errors.email && touched.email
                          ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.email && touched.email && (
                      <p id="error-email" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="form-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="form-phone"
                      value={phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={(e) => handleBlur('phone', e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'error-phone' : undefined}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                        errors.phone && touched.phone
                          ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.phone && touched.phone && (
                      <p id="error-phone" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Education & Background */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  2. Academic Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* College */}
                  <div className="sm:col-span-2">
                    <label htmlFor="form-college" className="block text-xs font-bold text-slate-700 mb-1">
                      College / University <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="form-college"
                      value={college}
                      onChange={(e) => handleChange('college', e.target.value)}
                      onBlur={(e) => handleBlur('college', e.target.value)}
                      placeholder="e.g. Stanford University"
                      aria-required="true"
                      aria-invalid={!!errors.college}
                      aria-describedby={errors.college ? 'error-college' : undefined}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                        errors.college && touched.college
                          ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.college && touched.college && (
                      <p id="error-college" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                        {errors.college}
                      </p>
                    )}
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label htmlFor="form-graduation-year" className="block text-xs font-bold text-slate-700 mb-1">
                      Grad Year <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="form-graduation-year"
                      value={graduationYear}
                      onChange={(e) => handleChange('graduationYear', e.target.value)}
                      onBlur={(e) => handleBlur('graduationYear', e.target.value)}
                      aria-required="true"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                    </select>
                  </div>

                  {/* Degree */}
                  <div className="sm:col-span-3">
                    <label htmlFor="form-degree" className="block text-xs font-bold text-slate-700 mb-1">
                      Degree & Major <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="form-degree"
                      value={degree}
                      onChange={(e) => handleChange('degree', e.target.value)}
                      onBlur={(e) => handleBlur('degree', e.target.value)}
                      placeholder="e.g. B.S. Computer Science or Software Engineering"
                      aria-required="true"
                      aria-invalid={!!errors.degree}
                      aria-describedby={errors.degree ? 'error-degree' : undefined}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                        errors.degree && touched.degree
                          ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                      }`}
                    />
                    {errors.degree && touched.degree && (
                      <p id="error-degree" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                        {errors.degree}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Profile & Skills */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  3. Technical Background
                </h4>
                <div>
                  <label htmlFor="form-skills" className="block text-xs font-bold text-slate-700 mb-1">
                    Key Technical Skills <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="form-skills"
                    value={skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    onBlur={(e) => handleBlur('skills', e.target.value)}
                    placeholder="e.g. TypeScript, React, Node.js, SQL, Git, Docker"
                    aria-required="true"
                    aria-invalid={!!errors.skills}
                    aria-describedby={errors.skills ? 'error-skills' : undefined}
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                      errors.skills && touched.skills
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.skills && touched.skills && (
                    <p id="error-skills" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                      {errors.skills}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="form-cover-letter" className="block text-xs font-bold text-slate-700">
                      Statement of Interest / Cover Letter <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {coverLetter.trim().length} chars (min 30)
                    </span>
                  </div>
                  <textarea
                    id="form-cover-letter"
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => handleChange('coverLetter', e.target.value)}
                    onBlur={(e) => handleBlur('coverLetter', e.target.value)}
                    placeholder="Explain why you are excited about this role, your relevant coursework or projects, and what you aim to contribute..."
                    aria-required="true"
                    aria-invalid={!!errors.coverLetter}
                    aria-describedby={errors.coverLetter ? 'error-coverLetter' : undefined}
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 transition-all focus:outline-none focus:ring-2 resize-y ${
                      errors.coverLetter && touched.coverLetter
                        ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.coverLetter && touched.coverLetter && (
                    <p id="error-coverLetter" className="text-xs text-rose-600 mt-1 font-medium" role="alert">
                      {errors.coverLetter}
                    </p>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Privacy Protected:</strong> Your information is stored securely in our persistent database and only accessible by authorized recruiters.
                </span>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating & Recording...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
