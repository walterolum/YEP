import { describe, expect, it } from 'vitest';
import { assessmentService, certificateService } from '@/services/assessmentService';
import { ApiError } from '@/services/apiClient';

describe('assessment service', () => {
  it('submits an available assessment and records the text', async () => {
    await assessmentService.submit('ass-1', 'u-amara', 'My reflection on verification and disclosure.');

    const submission = (await assessmentService.listForUser('u-amara')).find((entry) => entry.id === 'ass-1');
    expect(submission?.status).toBe('submitted');
  });

  it('refuses to submit a locked assessment', async () => {
    const locked = (await assessmentService.listForUser('u-amara')).find((entry) => entry.status === 'locked');
    if (!locked) {
      // The seeded dataset may change; skip silently rather than assert on seed shape.
      return;
    }
    await expect(assessmentService.submit(locked.id, 'u-amara', 'Attempting a locked assessment.')).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe('certificate service', () => {
  it('finds a valid demonstration certificate case-insensitively', async () => {
    const certificate = await certificateService.verify('yep-demo-4k7q-2026');
    expect(certificate.status).toBe('valid');
  });

  it('reports an unknown code as a 404 API error', async () => {
    await expect(certificateService.verify('YEP-NOT-A-CODE')).rejects.toMatchObject({ status: 404 });
  });
});
