import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';

export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  return (
    <div className="auth-page min-h-[100svh] bg-[#071324] text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-[#071324]/80 px-4 py-3 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-2xs font-semibold text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Secure Enterprise Portal
          </span>
          <span className="hidden text-2xs text-navy-200 sm:inline">
            Encrypted session · SameSite HttpOnly protection
          </span>
        </div>

        <Link
          to="/"
          aria-label="Back to the YouthRise website"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-2xs font-semibold text-navy-100 transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-royal"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to website</span>
        </Link>
      </header>

      {/* Main Unified Split Card matching Image 2 */}
      <main id="main-content" className="relative z-10 flex flex-1 items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl shadow-black/60 grid lg:grid-cols-[1.05fr_1fr]">
          
          {/* Left Column: Deep Navy Branding with Flowing Waves and Students (Image 2) */}
          <aside
            className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#07152B] via-[#091C38] to-[#040C1A] p-6 sm:p-8 lg:p-10 text-white"
            aria-label="YEP Platform overview"
          >
            {/* Ambient Flowing Curves Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {/* Organic glowing wave ribbon - Gold */}
              <svg
                className="absolute -right-20 top-1/4 h-[32rem] w-[32rem] text-amber-500/20 filter blur-2xl"
                viewBox="0 0 200 200"
                fill="currentColor"
              >
                <path d="M43.3,-62.7C55.6,-54.6,65,-41.8,70.5,-27.3C75.9,-12.8,77.4,3.4,72.7,17.7C67.9,32,56.9,44.4,43.9,53.2C30.9,62.1,15.5,67.4,-0.4,67.9C-16.3,68.5,-32.5,64.2,-44.6,54.7C-56.7,45.2,-64.7,30.5,-69.1,14.6C-73.5,-1.3,-74.3,-18.4,-67.2,-31.8C-60.2,-45.1,-45.3,-54.7,-30.9,-61.8C-16.5,-68.8,-2.6,-73.3,10.6,-71.4C23.8,-69.5,31,-69.8,43.3,-62.7Z" transform="translate(100 100)" />
              </svg>
              {/* Organic glowing wave ribbon - Cyan */}
              <svg
                className="absolute -left-10 bottom-10 h-72 w-72 text-cyan-500/15 filter blur-xl"
                viewBox="0 0 200 200"
                fill="currentColor"
              >
                <path d="M37.8,-53.6C49.9,-46.3,61.4,-36.8,66.8,-24.1C72.2,-11.5,71.5,4.3,66.6,18.7C61.7,33.1,52.6,46,40.3,55.1C27.9,64.2,14,69.5,-0.6,70.3C-15.1,71.1,-30.2,67.4,-42.6,58.5C-55,49.6,-64.7,35.5,-68.9,19.8C-73.1,4.1,-71.7,-13.2,-64.4,-27.1C-57.1,-41,-43.8,-51.5,-30.1,-58C-16.4,-64.5,-2.3,-67,11.2,-65.4C24.7,-63.9,25.7,-60.9,37.8,-53.6Z" transform="translate(100 100)" />
              </svg>
            </div>

            {/* Top: YEP Logo */}
            <div className="relative z-10">
              <Logo variant="light" size="lg" to="/" />
            </div>

            {/* Middle: Empowering Headline & Flowing Wave Motif */}
            <div className="relative z-10 my-8">
              {isRegister ? (
                <>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.15]">
                    Together <br />
                    We Grow <br />
                    <span className="text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.4)]">
                      Stronger
                    </span>
                  </h2>
                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-sm">
                    Join the YEP community and unlock opportunities for learning, skills and impact across East Africa.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.15]">
                    Empowering <br />
                    Young People <br />
                    <span className="text-amber-400 drop-shadow-[0_2px_12px_rgba(251,191,36,0.4)]">
                      Building a Better <br />
                      Tomorrow
                    </span>
                  </h2>
                  <p className="mt-4 text-xs sm:text-sm font-medium tracking-wide text-cyan-200">
                    Learn. Grow. Lead.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300 max-w-sm">
                    Join a community of empowered youth creating lasting impact.
                  </p>
                </>
              )}
            </div>

            {/* Flowing Golden Wave Divider and Youth Picture as in Image 2 */}
            <div className="relative z-10 mt-auto pt-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-navy-950/40 p-2 shadow-xl backdrop-blur-sm">
                {/* Wavy golden ribbon SVG frame */}
                <svg
                  className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
                  viewBox="0 0 400 200"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,80 C120,140 240,20 400,90 L400,200 L0,200 Z"
                    fill="url(#gold-flow-grad)"
                  />
                  <defs>
                    <linearGradient id="gold-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="relative flex items-center gap-3.5">
                  <img
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-amber-400/40 shadow-md shrink-0"
                    src="https://images.pexels.com/photos/30677717/pexels-photo-30677717.jpeg?auto=compress&cs=tinysrgb&w=400&fit=crop"
                    alt="East African Youth Collaborating"
                    loading="lazy"
                    onError={(e) => {
                      // Graceful fallback if image unavailable
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      East Africa Regional Network
                    </p>
                    <p className="text-2xs text-slate-300 mt-0.5 leading-snug">
                      Uganda · Kenya · Rwanda · Tanzania · Burundi · South Sudan
                    </p>
                    <p className="text-[0.65rem] text-cyan-300 font-semibold mt-1">
                      5,240+ Empowered Youth &amp; 320+ Completed Programs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Clean White Form Container matching Image 2 */}
          <section
            className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 bg-white text-ink"
            aria-label="Account access form"
          >
            <div className="w-full">
              <Outlet />
            </div>

            {/* Bottom Footer inside Card */}
            <div className="mt-8 border-t border-slate-100 pt-4 text-center">
              <p className="text-2xs text-slate-400">
                © 2026 YEP. All rights reserved.
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* Global Page Footer */}
      <footer className="relative z-20 border-t border-white/10 bg-[#071324]/80 px-4 py-3 sm:px-8 text-2xs text-navy-200">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p>
            YouthRise · Demonstration build · Compliant with Uganda DPPA 2019
          </p>
          <nav aria-label="Legal navigation" className="flex items-center gap-3">
            <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
            <span>·</span>
            <Link to="/terms" className="transition hover:text-white">Terms</Link>
            <span>·</span>
            <Link to="/accessibility" className="transition hover:text-white">Accessibility</Link>
            <span>·</span>
            <Link to="/verify" className="transition hover:text-white">Verify Certificate</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
