import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

const themes = ['All', 'Agriculture', 'Education', 'Health', 'Climate action', 'Employment', 'Digital inclusion'] as const;

const examples = [
  {
    id: 'ex-1',
    theme: 'Climate action',
    title: 'Solar-aware school energy tracker',
    summary: 'A daily recording routine and weekly summary to help two schools make better use of solar energy.',
    stage: 'Example project',
  },
  {
    id: 'ex-2',
    theme: 'Health',
    title: 'Community water point reporting',
    summary: 'A privacy-preserving way for a water committee to track repairs and publish status updates.',
    stage: 'Example project',
  },
  {
    id: 'ex-3',
    theme: 'Employment',
    title: 'Digital skills bridge for market traders',
    summary: 'A short, trader-led curriculum built around the digital tasks traders actually perform.',
    stage: 'Example project',
  },
  {
    id: 'ex-4',
    theme: 'Agriculture',
    title: 'Rain-fed crop advisory pilot',
    summary: 'A low-bandwidth advisory format tested with smallholder farmers in two districts.',
    stage: 'Example concept',
  },
  {
    id: 'ex-5',
    theme: 'Education',
    title: 'Offline learning library',
    summary: 'A curated set of downloadable lessons for learners with limited connectivity.',
    stage: 'Example concept',
  },
  {
    id: 'ex-6',
    theme: 'Digital inclusion',
    title: 'Accessible civic information',
    summary: 'A prototype for presenting public service information in plain language and accessible formats.',
    stage: 'Example concept',
  },
];

export function ProjectShowcase({ limit = 6 }: { limit?: number }) {
  const [activeTheme, setActiveTheme] = useState<(typeof themes)[number]>('All');
  const filtered = activeTheme === 'All' ? examples : examples.filter((example) => example.theme === activeTheme);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter example projects by theme">
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setActiveTheme(theme)}
              aria-pressed={activeTheme === theme}
              className={cn(
                'rounded-full border px-3 py-1.5 text-2xs font-semibold transition',
                activeTheme === theme
                  ? 'border-navy bg-navy text-white'
                  : 'border-line bg-white text-slate hover:border-navy/30 hover:text-ink',
              )}
            >
              {theme}
            </button>
          ))}
        </div>
        <p className="text-2xs text-slate" aria-live="polite">
          {filtered.length} example{filtered.length === 1 ? '' : 's'} shown
        </p>
      </div>

      <ul className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, limit).map((example, index) => (
          <li key={example.id} className="group bg-white p-5 transition-colors hover:bg-canvas/70">
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xs font-semibold uppercase tracking-[0.1em] text-teal-700">{example.theme}</span>
              <span className="text-2xs font-medium text-slate">0{index + 1}</span>
            </div>
            <h3 className="mt-3 text-card font-semibold leading-6 text-ink">{example.title}</h3>
            <p className="mt-2 text-[0.8125rem] leading-6 text-slate">{example.summary}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="rounded border border-warning-100 bg-warning-50 px-2 py-0.5 text-2xs font-semibold text-warning">
                {example.stage}
              </span>
              <Link
                to="/impact-projects"
                className="inline-flex items-center gap-1 text-2xs font-semibold text-royal opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
              >
                Project stages
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-2xs leading-5 text-slate">
        These projects are fictional examples created to demonstrate the Level Two workspace. They are not real
        participant projects, and no outcome is claimed.
      </p>
    </div>
  );
}
