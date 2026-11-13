import { describe, expect, it } from 'vitest';
import { demoDb } from '@/lib/demoDb';

const PARTICIPANT = 'u-amara';
const OPEN_PROGRAMME = 'prog-data-commons';

describe('demo store', () => {
  it('creates an enrolment and keeps it idempotent', () => {
    const before = demoDb.getState().enrolments.filter((entry) => entry.programmeId === OPEN_PROGRAMME).length;

    demoDb.enrol(OPEN_PROGRAMME, PARTICIPANT);
    demoDb.enrol(OPEN_PROGRAMME, PARTICIPANT);

    const after = demoDb.getState().enrolments.filter((entry) => entry.programmeId === OPEN_PROGRAMME);
    expect(after).toHaveLength(before + 1);
    expect(after.some((entry) => entry.userId === PARTICIPANT && entry.programmeId === OPEN_PROGRAMME)).toBe(true);
  });

  it('does not enrol a learner in a missing programme', () => {
    const before = demoDb.getState().enrolments.length;
    demoDb.enrol('prog-does-not-exist', PARTICIPANT);
    expect(demoDb.getState().enrolments).toHaveLength(before);
  });

  it('records an assessment submission against the learner', () => {
    demoDb.submitAssessment('ass-1', PARTICIPANT, 'A considered response to the responsible AI scenario.');

    const assessment = demoDb.getState().assessments.find((entry) => entry.id === 'ass-1');
    expect(assessment?.status).toBe('submitted');
    expect(assessment?.submittedAt).toBeTruthy();

    const submission = demoDb.getState().assessmentSubmissions['ass-1'];
    expect(submission.userId).toBe(PARTICIPANT);
    expect(submission.text).toContain('responsible AI');
  });

  it('appends a decision note when a privacy request is updated', () => {
    const before = demoDb.getState().privacyRequests.find((entry) => entry.id === 'pr-2');
    demoDb.updatePrivacyRequest('pr-2', 'completed', 'Export reviewed and shared through the secure portal.');

    const after = demoDb.getState().privacyRequests.find((entry) => entry.id === 'pr-2');
    expect(after?.status).toBe('completed');
    expect(after?.note).toContain(before?.note ?? '');
    expect(after?.note).toContain('secure portal');
  });

  it('changes a role without altering other accounts', () => {
    const otherRole = demoDb.getState().users.find((entry) => entry.id === 'u-grace')?.role;
    demoDb.assignRole('u-brian', 'mentor');

    expect(demoDb.getState().users.find((entry) => entry.id === 'u-brian')?.role).toBe('mentor');
    expect(demoDb.getState().users.find((entry) => entry.id === 'u-grace')?.role).toBe(otherRole);
  });

  it('toggles a saved talent profile on and off', () => {
    const before = demoDb.getState().savedTalent.includes('u-brian');
    demoDb.toggleSavedTalent('u-brian');
    expect(demoDb.getState().savedTalent.includes('u-brian')).toBe(!before);
    demoDb.toggleSavedTalent('u-brian');
    expect(demoDb.getState().savedTalent.includes('u-brian')).toBe(before);
  });
});
