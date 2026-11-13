import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RequireAuth, RequireRole } from '@/app/guards';
import { AppProviders } from '@/app/providers/AppProviders';
import { DEMO_PASSWORD } from '@/lib/demoAccounts';
import { authService } from '@/services/authService';

function renderRoutes(initialPath: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<h1>Sign in screen</h1>} />
          <Route path="/app" element={<RequireAuth />}>
            <Route index element={<h1>Participant home</h1>} />
            <Route element={<RequireRole roles={['facilitator']} />}>
              <Route path="facilitator" element={<h1>Facilitator home</h1>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe('route guards', () => {
  it('sends an anonymous visitor to sign in', async () => {
    renderRoutes('/app');
    expect(await screen.findByRole('heading', { name: 'Sign in screen' })).toBeInTheDocument();
  });

  it('allows a participant into the shared workspace', async () => {
    await authService.login('amara@yep.demo', DEMO_PASSWORD);
    renderRoutes('/app');
    expect(await screen.findByRole('heading', { name: 'Participant home' })).toBeInTheDocument();
  });

  it('redirects a participant away from a facilitator route', async () => {
    await authService.login('amara@yep.demo', DEMO_PASSWORD);
    renderRoutes('/app/facilitator');
    expect(await screen.findByRole('heading', { name: 'Participant home' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Facilitator home' })).not.toBeInTheDocument();
  });

  it('allows a facilitator into the facilitator workspace', async () => {
    await authService.login('daniel@yep.demo', DEMO_PASSWORD);
    renderRoutes('/app/facilitator');
    expect(await screen.findByRole('heading', { name: 'Facilitator home' })).toBeInTheDocument();
  });
});
