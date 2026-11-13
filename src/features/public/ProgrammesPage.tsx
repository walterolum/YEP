import { ArrowRight, ArrowUpRight, CalendarDays, GraduationCap, Layers, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero, PublicCTA } from '@/components/public/PageHero';
import { Badge, Button, EmptyState, Input, Select, StatusBadge } from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, pluralise } from '@/utils/format';
import type { Programme } from '@/types';

const levelLabels = { 1: 'Level One', 2: 'Level Two' } as const;

function ProgrammeRow({ programme }: { programme: Programme }) {
  return (
    <article className="group grid gap-5 border-t border-line py-6 lg:grid-cols-[1fr_16rem] lg:gap-10">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={programme.level === 1 ? 'info' : 'teal'}>{levelLabels[programme.level]}</Badge>
          <StatusBadge status={programme.status} />
          <span className="text-2xs text-slate">{programme.theme}</span>
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">
          <Link to={`/programmes/${programme.id}`} className="transition hover:text-royal">
            {programme.title}
          </Link>
        </h2>
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-7 text-slate">{programme.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-2xs text-slate">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Starts {formatDate(programme.startsAt)}
          </span>
          <span>{programme.durationWeeks} weeks</span>
          <span>{programme.commitment}</span>
          <span>{programme.moduleCount > 0 ? pluralise(programme.moduleCount, 'module') : 'Modules announced soon'}</span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 lg:items-end lg:text-right">
        <div className="text-2xs text-slate">
          <p className="font-semibold text-ink">{programme.cohort}</p>
          <p className="mt-1">
            {programme.enrolledCount > 0
              ? `${programme.enrolledCount} of ${programme.capacity} places represented`
              : `${programme.capacity} places planned · enrolment not open`}
          </p>
          <p className="mt-1 text-slate-400">Demonstration figures</p>
        </div>
        <Link
          to={`/programmes/${programme.id}`}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-royal hover:underline"
        >
          View programme
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function ProgrammesPage() {
  useDocumentTitle('Programmes and learning');
  const state = useDemoData();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [theme, setTheme] = useState('all');
  const [sort, setSort] = useState('start');

  const themes = useMemo(() => Array.from(new Set(state.programmes.map((programme) => programme.theme))).sort(), [state.programmes]);

  const filtered = useMemo(() => {
    const result = state.programmes.filter((programme) => {
      const matchesQuery = `${programme.title} ${programme.summary} ${programme.theme} ${programme.skills.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesLevel = level === 'all' || programme.level === Number(level);
      const matchesStatus = status === 'all' || programme.status === status;
      const matchesTheme = theme === 'all' || programme.theme === theme;
      return matchesQuery && matchesLevel && matchesStatus && matchesTheme;
    });
    return result.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'level') return a.level - b.level || a.title.localeCompare(b.title);
      return +new Date(a.startsAt) - +new Date(b.startsAt);
    });
  }, [state.programmes, query, level, status, theme, sort]);

  const filtersActive = query || level !== 'all' || status !== 'all' || theme !== 'all' || sort !== 'start';

  function resetFilters() {
    setQuery('');
    setLevel('all');
    setStatus('all');
    setTheme('all');
    setSort('start');
  }

  return (
    <>
      <PageHero
        eyebrow="Programmes and learning"
        title="Find the right starting point."
        description="Browse proposed Level One learning and Level Two impact programmes. Enrolment is subject to eligibility, capacity and confirmation. This catalogue is demonstration data."
        breadcrumbs={[{ label: 'Programmes' }]}
        aside={
          <div className="rounded-lg border border-line bg-white p-4 text-xs shadow-xs">
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-slate">At a glance</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-navy">{state.programmes.length}</p>
            <p className="mt-1 text-slate">proposed programmes in the demonstration catalogue</p>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
              <Badge variant="info">Level One</Badge>
              <Badge variant="teal">Level Two</Badge>
              <Badge variant="warning">Demo data</Badge>
            </div>
          </div>
        }
      />

      <section className="border-b border-line bg-canvas py-6" aria-label="Programme filters">
        <div className="container-editorial">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
            <div>
              <label htmlFor="programme-search" className="sr-only">
                Search programmes
              </label>
              <Input
                id="programme-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search programmes, themes or skills"
                prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                suffix={
                  query ? (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="inline-flex h-7 w-7 items-center justify-center rounded text-slate hover:bg-canvas hover:text-ink"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : undefined
                }
              />
            </div>
            <div>
              <label htmlFor="programme-level" className="sr-only">
                Filter by level
              </label>
              <Select id="programme-level" value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="all">All levels</option>
                <option value="1">Level One</option>
                <option value="2">Level Two</option>
              </Select>
            </div>
            <div>
              <label htmlFor="programme-theme" className="sr-only">
                Filter by theme
              </label>
              <Select id="programme-theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option value="all">All themes</option>
                {themes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="programme-status" className="sr-only">
                Filter by enrolment status
              </label>
              <Select id="programme-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="waitlist">Waitlist</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div>
              <label htmlFor="programme-sort" className="sr-only">
                Sort programmes
              </label>
              <Select id="programme-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="start">Soonest start</option>
                <option value="title">Title A–Z</option>
                <option value="level">Level</option>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-2xs text-slate" aria-live="polite">
              {filtered.length} of {state.programmes.length} programmes shown
            </p>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={resetFilters} iconLeft={<X className="h-3.5 w-3.5" aria-hidden="true" />}>
                Reset filters
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-8 lg:py-12" aria-labelledby="catalogue-heading">
        <div className="container-editorial">
          <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-[0.1em] text-slate">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <h2 id="catalogue-heading">Programme catalogue</h2>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="h-5 w-5" aria-hidden="true" />}
              title="No programmes match those filters"
              description="Try a broader search, reset the filters or browse all proposed programmes."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
              className="rounded-lg border border-line bg-white"
            />
          ) : (
            <div className="mt-4 border-b border-line">
              {filtered.map((programme) => (
                <ProgrammeRow key={programme.id} programme={programme} />
              ))}
            </div>
          )}

          <div className="mt-10 grid gap-5 rounded-lg border border-line bg-canvas p-5 sm:p-6 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-teal" aria-hidden="true" />
                <h2 className="text-lg font-semibold tracking-tight text-ink">Not sure which level fits?</h2>
              </div>
              <p className="mt-2 max-w-xl text-[0.8125rem] leading-6 text-slate">
                Start with Level One if you want foundational digital and collaboration skills. Level Two is for
                participants who have completed Level One requirements and want to work on a team-based community
                project.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link to="/how-it-works" className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-4 py-2 text-[0.8125rem] font-semibold text-ink transition hover:border-navy/30">
                Compare the journey
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-1.5 rounded-md bg-royal px-4 py-2 text-[0.8125rem] font-semibold text-white transition hover:bg-royal-700">
                Create an account
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <p className="mt-4 text-2xs leading-5 text-slate">
            All programme titles, dates, participant counts and module outlines are demonstration content. They do not
            represent confirmed YouthRise offerings or real enrolment figures.
          </p>
        </div>
      </section>

      <PublicCTA
        title="Learning is better with a team."
        description="Explore the virtual exchange model, see how mentors support teams, or create a demonstration account to test the full participant journey."
        primaryLabel="Join YouthRise"
        secondaryLabel="Explore virtual exchange"
        secondaryTo="/virtual-exchange"
      />
    </>
  );
}
