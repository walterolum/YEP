import { demoDb } from '@/lib/demoDb';
import type { Assessment, Certificate } from '@/types';
import { ApiError, DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const assessmentService = {
  async listForUser(userId: string): Promise<Assessment[]> {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      const programmeIds = state.enrolments
        .filter((enrolment) => enrolment.userId === userId)
        .map((enrolment) => enrolment.programmeId);
      return demoDelay(
        state.assessments.filter((assessment) => programmeIds.includes(assessment.programmeId)),
        220,
      );
    }
    return apiRequest<Assessment[]>('/me/assessments');
  },

  async submit(assessmentId: string, userId: string, text: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/assessments/${assessmentId}/submissions`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      return;
    }
    await demoDelay(null, 600);
    const assessment = demoDb.getState().assessments.find((entry) => entry.id === assessmentId);
    if (!assessment) throw new ApiError({ status: 404, code: 'ASSESSMENT_NOT_FOUND', message: 'Assessment not found.' });
    if (assessment.status === 'locked') {
      throw new ApiError({ status: 409, code: 'ASSESSMENT_LOCKED', message: 'This assessment is not yet available.' });
    }
    demoDb.submitAssessment(assessmentId, userId, text);
  },
};

export const certificateService = {
  async listForUser(userId: string): Promise<Certificate[]> {
    if (DEMO_MODE) {
      return demoDelay(
        demoDb.getState().certificates.filter((certificate) => certificate.participantId === userId),
        200,
      );
    }
    return apiRequest<Certificate[]>('/me/certificates');
  },

  async verify(code: string): Promise<Certificate> {
    if (!DEMO_MODE) {
      return apiRequest<Certificate>(`/certificates/verify/${encodeURIComponent(code)}`);
    }
    await demoDelay(null, 600);
    const normalised = code.trim().toUpperCase();
    if (!normalised) {
      throw new ApiError({ status: 422, code: 'CODE_REQUIRED', message: 'Enter a certificate verification code.' });
    }
    const certificate = demoDb.getState().certificates.find((entry) => entry.code.toUpperCase() === normalised);
    if (!certificate) {
      throw new ApiError({
        status: 404,
        code: 'CERTIFICATE_NOT_FOUND',
        message: 'No certificate matches that code in the demonstration registry.',
      });
    }
    return certificate;
  },
};
