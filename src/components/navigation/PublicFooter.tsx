import { ArrowUpRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'About YouthRise', to: '/about' },
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Programmes & learning', to: '/programmes' },
      { label: 'Mentorship', to: '/mentorship' },
    ],
  },
  {
    title: 'Programme',
    links: [
      { label: 'Level One virtual exchange', to: '/virtual-exchange' },
      { label: 'Level Two impact projects', to: '/impact-projects' },
      { label: 'Impact & stories', to: '/impact' },
      { label: 'Responsible AI & safety', to: '/responsible-ai' },
    ],
  },
  {
    title: 'Support & legal',
    links: [
      { label: 'Frequently asked questions', to: '/faq' },
      { label: 'Contact', to: '/contact' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of use', to: '/terms' },
      { label: 'Accessibility statement', to: '/accessibility' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="surface-dark border-t border-white/10">
      <div className="absolute inset-0 grid-paper-dark opacity-30" aria-hidden="true" />
      <div className="container-editorial relative grid gap-10 py-14 lg:grid-cols-[1.4fr_2fr]">
        <div className="max-w-sm">
          <Logo variant="light" />
          <p className="mt-5 text-sm leading-6 text-navy-200">
            A proposed youth digital empowerment and virtual exchange platform for East Africa — connecting learning,
            mentorship, collaborative projects and verifiable recognition.
          </p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-2xs leading-5 text-navy-200">
            <p className="font-semibold text-cyan-200">Demonstration build</p>
            <p className="mt-1">
              Statistics, projects, certificates, partners and testimonials shown are illustrative unless explicitly
              verified. No real institutional endorsement is implied.
            </p>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-navy-200">
            <Mail className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            <span>
              Contact (demonstration): <span className="text-white">hello@youthrise.example</span>
            </span>
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-2xs font-semibold uppercase tracking-[0.14em] text-cyan-200">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[0.8125rem] leading-5 text-navy-200 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-editorial flex flex-col gap-3 py-5 text-2xs text-navy-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 YouthRise (proposed). Demonstration interface.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/verify" className="inline-flex items-center gap-1 transition hover:text-white">
              Verify a certificate
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:block" />
            <span>Social channels will be listed once verified.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
