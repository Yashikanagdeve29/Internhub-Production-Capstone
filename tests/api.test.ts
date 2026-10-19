import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseManager } from '../src/server/db.ts';

// Use an isolated temporary test database
const TEST_DB_PATH = path.resolve('./data/test_internhub.db');

test('DatabaseManager initialization, seeding and query isolation', async (t) => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const testDb = new DatabaseManager(TEST_DB_PATH);

  await t.test('Health check succeeds on newly created database', () => {
    const health = testDb.healthCheck();
    assert.equal(health.healthy, true);
  });

  await t.test('Initial seed populates internships correctly', () => {
    const result = testDb.getInternships({ limit: 10 });
    assert.ok(result.items.length >= 8, 'Should have at least 8 seeded internships when limit is 10');
    assert.equal(result.pagination.total >= 8, true);
  });

  await t.test('Domain filtering returns only matching domain records', () => {
    const result = testDb.getInternships({ domain: 'Data & AI' });
    assert.ok(result.items.length > 0);
    for (const item of result.items) {
      assert.equal(item.domain, 'Data & AI');
    }
  });

  await t.test('Search query matches title or company', () => {
    const result = testDb.getInternships({ search: 'CloudScale' });
    assert.ok(result.items.length >= 1);
    assert.equal(result.items[0].company, 'CloudScale Technologies');
  });

  await t.test('Application submission persists in database and returns reference', () => {
    const appResult = testDb.createApplication({
      internshipId: 1,
      fullName: 'Taylor Morgan',
      email: 'taylor.morgan@univ.edu',
      phone: '+1 (555) 789-0123',
      college: 'University of Washington',
      degree: 'B.S. Software Engineering',
      graduationYear: 2026,
      skills: 'Go, Docker, React, SQL',
      coverLetter: 'Passionate full-stack developer with 2 internships experience seeking to contribute to distributed systems.',
    });

    assert.equal(appResult.success, true);
    assert.ok(appResult.applicationRef.startsWith('APP-2026-'));
    assert.ok(appResult.id > 0);

    // Verify lookup by ref
    const lookup = testDb.getApplicationByRef(appResult.applicationRef);
    assert.ok(lookup);
    assert.equal(lookup?.applicationRef, appResult.applicationRef);
    assert.equal(lookup?.college, 'University of Washington');
    // Ensure PII masking is applied in public lookup
    assert.ok(lookup?.applicantNameMasked.includes('***'));
  });

  await t.test('Duplicate application with identical email and internship is rejected', () => {
    const duplicateAttempt = testDb.createApplication({
      internshipId: 1,
      fullName: 'Taylor Morgan',
      email: 'taylor.morgan@univ.edu', // Same email and same internship
      phone: '+1 (555) 789-0123',
      college: 'University of Washington',
      degree: 'B.S. Software Engineering',
      graduationYear: 2026,
      skills: 'Go, Docker',
      coverLetter: 'Attempting duplicate submission to test database constraints.',
    });

    assert.equal(duplicateAttempt.success, false);
    assert.equal(duplicateAttempt.isDuplicate, true);
    assert.ok(duplicateAttempt.error?.includes('already been submitted'));
  });

  await t.test('Submitting to non-existent internship fails gracefully', () => {
    const invalidAttempt = testDb.createApplication({
      internshipId: 999999, // Does not exist
      fullName: 'Ghost Candidate',
      email: 'ghost@example.com',
      phone: '+1 (555) 000-0000',
      college: 'Virtual Tech',
      degree: 'B.S.',
      graduationYear: 2027,
      skills: 'None',
      coverLetter: 'Submitting to a missing internship ID to verify foreign key check.',
    });

    assert.equal(invalidAttempt.success, false);
    assert.ok(invalidAttempt.error?.includes('does not exist'));
  });

  // Cleanup test database file
  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch {
      // Ignore cleanup error
    }
  }
});
