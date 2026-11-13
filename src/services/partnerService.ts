import { demoDb } from '@/lib/demoDb';
import type { Nomination, TalentProfile } from '@/types';
import { DEMO_MODE, apiRequest, demoDelay } from './apiClient';

export const nominationService = {
  async list(): Promise<Nomination[]> {
    if (DEMO_MODE) return demoDelay(demoDb.getState().nominations, 200);
    return apiRequest<Nomination[]>('/partner/nominations');
  },

  async create(payload: Omit<Nomination, 'id' | 'status' | 'nominatedAt'>): Promise<Nomination> {
    if (!DEMO_MODE) {
      return apiRequest<Nomination>('/partner/nominations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    await demoDelay(null, 550);
    demoDb.createNomination(payload);
    return demoDb.getState().nominations[0];
  },
};

export const employerService = {
  async searchTalent(filters: { query?: string; skill?: string; certificate?: string }): Promise<TalentProfile[]> {
    if (DEMO_MODE) {
      const state = demoDb.getState();
      const profiles = state.talentProfiles.filter((profile) => {
        const user = state.users.find((entry) => entry.id === profile.userId);
        if (!user || profile.visibility === 'hidden') return false;
        const matchesQuery =
          !filters.query ||
          `${user.name} ${profile.headline} ${profile.skills.join(' ')} ${profile.projectSummary}`
            .toLowerCase()
            .includes(filters.query.toLowerCase());
        const matchesSkill = !filters.skill || filters.skill === 'all' || profile.skills.includes(filters.skill);
        const matchesCertificate =
          !filters.certificate ||
          filters.certificate === 'all' ||
          profile.certificateStatus === filters.certificate;
        return matchesQuery && matchesSkill && matchesCertificate;
      });
      return demoDelay(profiles, 260);
    }
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.skill) params.set('skill', filters.skill);
    if (filters.certificate) params.set('certificate', filters.certificate);
    return apiRequest<TalentProfile[]>(`/employer/talent?${params.toString()}`);
  },

  async toggleSaved(userId: string, saved?: boolean): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/employer/saved-talent/${userId}`, {
        method: saved === false ? 'DELETE' : 'PUT',
      });
      return;
    }
    await demoDelay(null, 250);
    const currentlySaved = demoDb.getState().savedTalent.includes(userId);
    if (saved === undefined || saved !== currentlySaved) {
      demoDb.toggleSavedTalent(userId);
    }
  },

  async requestIntroduction(employerId: string, talentUserId: string, note: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/employer/talent/${talentUserId}/introductions`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      return;
    }
    await demoDelay(null, 420);
    demoDb.requestIntroduction(employerId, talentUserId, note);
  },
};

export const partnerService = {
  async requestBriefing(partnerId: string, programmeId: string, note: string): Promise<void> {
    if (!DEMO_MODE) {
      await apiRequest<void>(`/partner/programmes/${programmeId}/briefing-requests`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      return;
    }
    await demoDelay(null, 420);
    demoDb.requestProgrammeBriefing(partnerId, programmeId, note);
  },
};
