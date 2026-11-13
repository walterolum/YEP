import { demoDb } from '@/lib/demoDb';
import type { BadgeAward } from '@/types';
import { DEMO_MODE, apiRequest, demoDelay } from './apiClient';

const DEMO_CATALOGUE: Omit<BadgeAward, 'earned' | 'awardedAt'>[] = [
  {
    code: 'FIRST_EXCHANGE',
    name: 'First Exchange',
    description: 'Completed a Level One virtual exchange session.',
    criteria: 'Attend one Level One session.',
  },
  {
    code: 'TEAM_PLAYER',
    name: 'Team Player',
    description: 'Joined a Level Two Impact Project team.',
    criteria: 'Become a member of a Level Two team.',
  },
  {
    code: 'PROGRAMME_COMPLETION',
    name: 'Programme Completed',
    description: 'Finished every requirement of a programme and earned a certificate.',
    criteria: 'A valid certificate is issued for the programme.',
  },
];

/**
 * Badges complement certificates: a certificate proves programme completion,
 * a badge marks a smaller milestone that a participant can show on a profile.
 */
export const badgeService = {
  /** The full catalogue, each entry marked with whether the caller has earned it. */
  async catalogue(userId: string): Promise<BadgeAward[]> {
    if (!DEMO_MODE) {
      return apiRequest<BadgeAward[]>('/badges');
    }
    const state = demoDb.getState();
    const attended = Object.values(state.sessionRegistrations).some((ids) => ids.includes(userId));
    const inTeam = state.teams.some((team) => team.memberIds.includes(userId));
    const certified = state.certificates.some(
      (certificate) => certificate.participantId === userId && certificate.status === 'valid',
    );
    const earned: Record<string, boolean> = {
      FIRST_EXCHANGE: attended,
      TEAM_PLAYER: inTeam,
      PROGRAMME_COMPLETION: certified,
    };
    const awardedAt = new Date().toISOString();
    return demoDelay(
      DEMO_CATALOGUE.map((badge) => ({
        ...badge,
        earned: Boolean(earned[badge.code]),
        awardedAt: earned[badge.code] ? awardedAt : null,
      })),
      220,
    );
  },

  /** Badges the caller actually holds, newest first. */
  async listForUser(userId: string): Promise<BadgeAward[]> {
    if (!DEMO_MODE) {
      return apiRequest<BadgeAward[]>('/me/badges');
    }
    const catalogue = await badgeService.catalogue(userId);
    return catalogue.filter((badge) => badge.earned);
  },
};
