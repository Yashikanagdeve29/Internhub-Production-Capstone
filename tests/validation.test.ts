import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidPhone,
  sanitizeString,
  validateApplicationInput,
  validateInternshipInput,
  sanitizePagination,
} from '../src/server/validation.ts';

test('Email validation handles standard and edge case formats', () => {
  assert.equal(isValidEmail('student@university.edu'), true);
  assert.equal(isValidEmail('jane.doe+dev@company.co.uk'), true);
  assert.equal(isValidEmail('invalid-email-no-at'), false);
  assert.equal(isValidEmail('@nodomain.com'), false);
  assert.equal(isValidEmail('spaces in@email.com'), false);
  assert.equal(isValidEmail(''), false);
});

test('Phone validation checks digit length boundaries', () => {
  assert.equal(isValidPhone('+1 (555) 234-5678'), true);
  assert.equal(isValidPhone('9876543210'), true);
  assert.equal(isValidPhone('+44 20 7946 0958'), true);
  assert.equal(isValidPhone('12345'), false); // too short (< 7)
  assert.equal(isValidPhone('123456789012345678'), false); // too long (> 15)
  assert.equal(isValidPhone('abc-def-ghij'), false);
});

test('sanitizeString strips angle brackets and trims whitespace', () => {
  assert.equal(sanitizeString('  Hello World  '), 'Hello World');
  assert.equal(sanitizeString('<script>alert("XSS")</script>Test'), 'alert("XSS")Test');
  assert.equal(sanitizeString(null), '');
  assert.equal(sanitizeString(undefined), '');
});

test('validateApplicationInput succeeds with valid applicant data', () => {
  const result = validateApplicationInput({
    fullName: 'Alex Rivera',
    email: 'alex.rivera@cs.stanford.edu',
    phone: '+1 (415) 555-0192',
    college: 'Stanford University',
    degree: 'B.S. in Computer Science',
    graduationYear: 2027,
    skills: 'TypeScript, React, Python, PostgreSQL',
    coverLetter: 'I am deeply passionate about full-stack systems engineering and excited to contribute my experience in building scalable microservices and accessible frontend applications.',
    internshipId: 1,
  });

  assert.equal(result.isValid, true);
  assert.equal(Object.keys(result.errors).length, 0);
  assert.equal(result.data?.fullName, 'Alex Rivera');
  assert.equal(result.data?.graduationYear, 2027);
});

test('validateApplicationInput catches missing and invalid fields', () => {
  const result = validateApplicationInput({
    fullName: '',
    email: 'bademail',
    phone: '123',
    college: '',
    degree: '',
    graduationYear: 1999, // out of range
    skills: '',
    coverLetter: 'Short', // under 30 chars
    internshipId: -5,
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.fullName, 'Expect error for fullName');
  assert.ok(result.errors.email, 'Expect error for email');
  assert.ok(result.errors.phone, 'Expect error for phone');
  assert.ok(result.errors.college, 'Expect error for college');
  assert.ok(result.errors.degree, 'Expect error for degree');
  assert.ok(result.errors.graduationYear, 'Expect error for graduationYear');
  assert.ok(result.errors.skills, 'Expect error for skills');
  assert.ok(result.errors.coverLetter, 'Expect error for coverLetter');
  assert.ok(result.errors.internshipId, 'Expect error for internshipId');
});

test('validateInternshipInput validates administrative internship payload', () => {
  const valid = validateInternshipInput({
    title: 'Security Research Intern',
    company: 'Apex Security',
    location: 'Remote',
    domain: 'Cybersecurity',
    type: 'Remote',
    stipend: '$3,500/mo',
    duration: '12 weeks',
    description: 'Help audit secure protocols and test cloud infrastructure against vulnerabilities.',
    requirements: ['Python experience', 'Networking fundamentals'],
    responsibilities: ['Write SAST scanners', 'Assist in penetration tests'],
    deadline: '2026-12-31',
  });

  assert.equal(valid.isValid, true);
  assert.equal(valid.data?.title, 'Security Research Intern');
});

test('sanitizePagination prevents excessive allocations and negative pages', () => {
  const normal = sanitizePagination(2, 10);
  assert.deepEqual(normal, { page: 2, limit: 10, offset: 10 });

  const invalidPage = sanitizePagination(-3, 10);
  assert.equal(invalidPage.page, 1);
  assert.equal(invalidPage.offset, 0);

  const excessiveLimit = sanitizePagination(1, 9999);
  assert.equal(excessiveLimit.limit, 50); // clamped to 50
});
