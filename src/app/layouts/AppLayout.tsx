import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { AppSidebar, MobileSidebar } from '@/components/navigation/AppSidebar';
import { AppTopbar } from '@/components/navigation/AppTopbar';
import { DemoBanner } from '@/components/feedback/DemoBanner';
import { AppSurfaceProvider } from '@/app/providers/AppSurface';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <AppSurfaceProvider>
      <div className="app-surface min-h-screen">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <DemoBanner />
        <div className="relative lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="sticky top-0 hidden h-screen lg:block">
            <AppSidebar />
          </aside>
          <div className="flex min-h-screen min-w-0 flex-col">
            <AppTopbar onOpenNav={() => setMobileOpen(true)} />
            <main
              id="main-content"
              className="relative mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
            >
              <div key={location.pathname} className="app-page-enter">
                <Outlet />
              </div>
            </main>
            <footer className="app-footer px-4 py-4 text-2xs text-slate sm:px-6 lg:px-8">
              <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden="true" />
                  YouthRise · Demonstration environment · Proposed programme
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/accessibility" className="font-medium transition hover:text-royal">
                    Accessibility
                  </Link>
                  <Link to="/privacy" className="font-medium transition hover:text-royal">
                    Privacy
                  </Link>
                  <Link to="/verify" className="font-medium transition hover:text-royal">
                    Verify certificate
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </AppSurfaceProvider>
  );
}
