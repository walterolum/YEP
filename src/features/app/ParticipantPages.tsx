import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Flame,
  GraduationCap,
  Layers,
  Play,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  Field,
  Pagination,
  ProgressBar,
  Select,
  StatCard,
  StatusBadge,
  Tabs,
  TabPanel,
  Textarea,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { learningService, programmeService } from '@/services/programmeService';
import { sessionService } from '@/services/sessionService';
import type { ExchangeSession, Programme } from '@/types';
import { formatDate, formatDateTime, percent } from '@/utils/format';
import { DemoFigure, FilterToolbar, PanelEmpty, useAsyncAction, usePagination } from '@/features/app/shared';
function userEnrolments(state: ReturnType<typeof useDemoData>, userId: string) {
  return state.enrolments.filter((enrolment) => enrolment.userId === userId);
}

function findProgramme(state: ReturnType<typeof useDemoData>, programmeId?: string) {
  return state.programmes.find((programme) => programme.id === programmeId);
}

/* ------------------------------------------------------------------ */
/* Overview (Matching Image 2: Participant Portal Dashboard)           */
/* ------------------------------------------------------------------ */

export function ParticipantOverviewPage() {
  useDocumentTitle('Participant dashboard');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const firstName = user.name ? user.name.split(' ')[0] : 'Participant';
  const enrolments = userEnrolments(state, user.id);
  const team = state.teams.find((entry) => entry.memberIds.includes(user.id));
  const project = team ? state.projects.find((entry) => entry.teamId === team.id) : undefined;
  const approvedMilestones = project?.milestones.filter((m) => m.status === 'approved').length ?? 0;
  const certificatesCount = state.certificates.filter((c) => c.participantId === user.id).length || 5;

  // Real or demo sessions for participant
  const upcomingClasses = [
    {
      id: 'c1',
      date: '24 May',
      title: 'UI/UX Design Principles',
      instructor: 'Jane Cooper',
      time: '10:00 AM EAT',
      link: '#',
    },
    {
      id: 'c2',
      date: '25 May',
      title: 'Python Data Structures',
      instructor: 'Robert Fox',
      time: '02:00 PM EAT',
      link: '#',
    },
    {
      id: 'c3',
      date: '26 May',
      title: 'Marketing Analytics & Growth',
      instructor: 'Albert Flores',
      time: '11:00 AM EAT',
      link: '#',
    },
  ];

  // 4 Featured Courses matching Image 2
  const featuredCourses = [
    {
      id: 'course-uiux',
      title: 'UI/UX Design Fundamentals',
      instructor: 'Jane Cooper',
      instructorAvatar: 'JC',
      status: 'Continue',
      statusVariant: 'blue',
      progress: 75,
      lessons: '18/24 lessons',
      theme: 'Digital Literacy',
      bgGradient: 'from-slate-900 to-indigo-950',
      iconBg: 'bg-blue-600/30 text-blue-400',
    },
    {
      id: 'course-python',
      title: 'Python Programming for Beginners',
      instructor: 'Robert Fox',
      instructorAvatar: 'RF',
      status: 'In Progress',
      statusVariant: 'emerald',
      progress: 60,
      lessons: '12/20 lessons',
      theme: 'AI & Data Literacy',
      bgGradient: 'from-blue-950 to-slate-900',
      iconBg: 'bg-emerald-600/30 text-emerald-400',
    },
    {
      id: 'course-mktg',
      title: 'Digital Marketing Strategy',
      instructor: 'Albert Flores',
      instructorAvatar: 'AF',
      status: 'Continue',
      statusVariant: 'blue',
      progress: 40,
      lessons: '8/20 lessons',
      theme: 'Critical Thinking',
      bgGradient: 'from-indigo-950 to-blue-900',
      iconBg: 'bg-amber-600/30 text-amber-400',
    },
    {
      id: 'course-photo',
      title: 'Cross-Border Collaboration & Media',
      instructor: 'Brooklyn Simmons',
      instructorAvatar: 'BS',
      status: 'Not Started',
      statusVariant: 'slate',
      progress: 0,
      lessons: '0/16 lessons',
      theme: 'Intercultural Communication',
      bgGradient: 'from-slate-800 to-slate-950',
      iconBg: 'bg-slate-700/50 text-slate-300',
    },
  ];

  const handleJoinClass = (title: string) => {
    toast({
      title: 'Connecting to Live Classroom',
      description: `Opening virtual session room for ${title}. Microphone and camera check in progress.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar matching Image 2 (Welcome Greeting + Search Bar) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Let&apos;s continue your learning journey today.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for courses, lessons..."
            aria-label="Search for courses, lessons"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 2. Top 4 Stat Cards matching Image 2 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Enrolled Courses */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {enrolments.length > 0 ? enrolments.length : 12}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">Enrolled Courses</p>
            <p className="text-2xs font-medium text-slate-400 mt-0.5">4 in progress</p>
          </div>
        </div>

        {/* Card 2: Lessons Completed */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">24</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">Lessons Completed</p>
            <p className="text-2xs font-medium text-emerald-600 mt-0.5">This month</p>
          </div>
        </div>

        {/* Card 3: Hours Learned */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">18</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">Hours Learned</p>
            <p className="text-2xs font-medium text-indigo-600 mt-0.5">This month</p>
          </div>
        </div>

        {/* Card 4: Certificates Earned */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {certificatesCount}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700">Certificates Earned</p>
            <p className="text-2xs font-medium text-amber-600 mt-0.5">Keep it up!</p>
          </div>
        </div>
      </div>

      {/* 3. Wide Card: My Learning Progress matching Image 2 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Learning Progress</h2>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xs font-semibold text-slate-700">Overall Progress</span>
              <span className="text-2xs text-slate-400 font-medium">You&apos;re doing great! Keep it up.</span>
            </div>
          </div>
          <span className="text-lg font-black text-indigo-600">75%</span>
        </div>

        {/* Sleek horizontal progress bar */}
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 transition-all duration-700"
            style={{ width: '75%' }}
          />
        </div>

        {/* 4-dot Status Legend */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">12</p>
              <p className="text-2xs font-medium text-slate-500">In Progress</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">8</p>
              <p className="text-2xs font-medium text-slate-500">Completed</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">3</p>
              <p className="text-2xs font-medium text-slate-500">Not Started</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">75%</p>
              <p className="text-2xs font-medium text-slate-500">Overall Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Section: Left Courses Grid (8 cols) + Right Rail Widgets (4 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: My Courses (Image 2) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">My Courses</h2>
            <Link
              to="/app/programmes"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All Courses &rarr;
            </Link>
          </div>

          {/* 4 Course Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition hover:shadow-md hover:border-slate-200"
              >
                {/* Visual Banner Header */}
                <div className={`relative h-32 w-full bg-gradient-to-br ${course.bgGradient} p-4 flex flex-col justify-between text-white overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-black/40 px-2 py-0.5 text-2xs font-medium uppercase tracking-wider text-slate-200 backdrop-blur-xs">
                      {course.theme}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-2xs font-bold ${
                        course.statusVariant === 'blue'
                          ? 'bg-blue-500 text-white'
                          : course.statusVariant === 'emerald'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  {/* Course Graphic Silhouette */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-2xs font-bold text-white">
                        {course.instructorAvatar}
                      </div>
                      <span className="text-2xs font-medium text-slate-200">by {course.instructor}</span>
                    </div>
                    <span className="text-xs font-extrabold text-blue-300">{course.progress}%</span>
                  </div>
                </div>

                {/* Card Content & Action */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                      {course.title}
                    </h3>
                    <p className="text-2xs text-slate-400 mt-1">{course.lessons}</p>

                    <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          course.progress >= 70
                            ? 'bg-blue-600'
                            : course.progress >= 40
                            ? 'bg-emerald-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-2xs font-semibold text-slate-500">{course.progress}% Complete</span>
                    <Link
                      to="/app/learning"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      {course.progress > 0 ? 'Continue' : 'Start'} &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Level Two & Impact Project Banner */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-2xs font-bold text-amber-300 uppercase tracking-wider">
                  Level Two Virtual Exchange
                </span>
                <span className="text-2xs text-blue-200">Cross-Border Teams</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {project ? project.title : 'Uganda & East Africa Youth Impact Initiative'}
              </h3>
              <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
                {team
                  ? `Active in team "${team.name}" with ${approvedMilestones} of ${project?.milestones.length || 4} milestones approved.`
                  : 'Complete Level 1 Virtual Exchange modules to unlock team formation and develop community-led solutions.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/team"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition"
              >
                Team Workspace
              </Link>
              <Link
                to="/app/project"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Impact Project
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Live Classes, Recent Achievements, Study Streak (Image 2) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Upcoming Live Classes Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Upcoming Live Classes
              </h2>
              <Link
                to="/app/sessions"
                className="text-2xs font-semibold text-blue-600 hover:underline"
              >
                View Calendar
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {upcomingClasses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 rounded-xl border border-slate-100 p-2.5 transition hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-slate-100 text-center shrink-0">
                      <span className="text-xs font-black text-slate-900 leading-none">
                        {item.date.split(' ')[0]}
                      </span>
                      <span className="text-[0.6rem] font-bold uppercase tracking-wider text-slate-500 leading-tight">
                        {item.date.split(' ')[1]}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-2xs text-slate-400 truncate">{item.instructor}</p>
                      <p className="text-2xs font-semibold text-blue-600 mt-0.5">{item.time}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoinClass(item.title)}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recent Achievements
              </h2>
              <Link
                to="/app/certificates"
                className="text-2xs font-semibold text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Course Completed</p>
                  <p className="text-2xs text-slate-400 truncate">UI/UX Design Fundamentals</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Certificate Earned</p>
                  <p className="text-2xs text-slate-400 truncate">Python Programming</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Lesson Completed</p>
                  <p className="text-2xs text-slate-400 truncate">Customer Journey Mapping</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Flame className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900">Quiz Achiever</p>
                  <p className="text-2xs text-slate-400 truncate">Marketing Fundamentals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Study Streak Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Study Streak
            </h2>
            <p className="mt-1 text-2xs text-slate-400 font-medium">Great job! You&apos;re on a roll.</p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">7</span>
              <span className="text-xs font-semibold text-slate-600">Days in a row</span>
            </div>

            {/* 7 Checkmark Day Dots */}
            <div className="mt-4 flex items-center justify-between gap-1">
              {[
                { day: 'Mon', checked: true },
                { day: 'Tue', checked: true },
                { day: 'Wed', checked: true },
                { day: 'Thu', checked: true },
                { day: 'Fri', checked: true },
                { day: 'Sat', checked: true },
                { day: 'Sun', checked: true },
              ].map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      d.checked
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {d.checked ? <Check className="h-4 w-4" /> : null}
                  </div>
                  <span className="text-[0.65rem] font-semibold text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* My programmes                                                       */
/* ------------------------------------------------------------------ */

export function ParticipantProgrammesPage() {
  useDocumentTitle('My programmes');
  const { user } = useAuth();
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState('enrolled');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [theme, setTheme] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Programme | null>(null);

  const userId = user?.id ?? '';
  const enrolments = userEnrolments(state, userId);
  const enrolledIds = new Set(enrolments.map((enrolment) => enrolment.programmeId));
  const themes = Array.from(new Set(state.programmes.map((programme) => programme.theme))).sort();

  const filtered = state.programmes.filter((programme) => {
    const matchesQuery = `${programme.title} ${programme.summary} ${programme.theme} ${programme.skills.join(' ')}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesLevel = level === 'all' || programme.level === Number(level);
    const matchesTheme = theme === 'all' || programme.theme === theme;
    const matchesStatus = status === 'all' || programme.status === status;
    return matchesQuery && matchesLevel && matchesTheme && matchesStatus;
  });
  const pagination = usePagination(filtered, 6);

  if (!user) return null;

  function resetFilters() {
    setQuery('');
    setLevel('all');
    setTheme('all');
    setStatus('all');
  }

  async function enrol(programme: Programme) {
    await run(
      `enrol-${programme.id}`,
      () => programmeService.enrol(programme.id, userId),
      {
        successTitle: programme.status === 'waitlist' ? 'Added to the waitlist' : 'Enrolment confirmed',
        successDescription:
          programme.status === 'waitlist'
            ? 'This proposed programme is not open yet. A place is not guaranteed.'
            : 'This is a demonstration enrolment stored in your browser.',
        onSuccess: () => setSelected(null),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My programmes"
        description="Track your current enrolments and browse the proposed programme catalogue."
        eyebrow="Learning"
      />

      <Tabs
        ariaLabel="Programme views"
        active={tab}
        onChange={setTab}
        items={[
          { id: 'enrolled', label: 'My enrolments', count: enrolments.length },
          { id: 'catalogue', label: 'Browse catalogue', count: state.programmes.length },
        ]}
      />

      <TabPanel id="enrolled" active={tab}>
        {enrolments.length === 0 ? (
          <Card>
            <PanelEmpty
              title="No enrolments yet"
              description="Browse the catalogue to join a proposed Level One programme."
              action={<Button onClick={() => setTab('catalogue')}>Browse catalogue</Button>}
              icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />}
            />
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {enrolments.map((enrolment) => {
              const programme = findProgramme(state, enrolment.programmeId);
              if (!programme) return null;
              const modules = state.modules.filter((module) => module.programmeId === programme.id);
              const completed = state.progress[`${user.id}:${programme.id}`] ?? [];
              const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
              const nextLesson = modules.flatMap((module) => module.lessons).find((lesson) => !completed.includes(lesson.id));
              return (
                <Card key={enrolment.id} className="flex flex-col">
                  <CardHeader
                    title={programme.title}
                    description={programme.cohort}
                    action={<StatusBadge status={enrolment.status} />}
                  />
                  <CardBody className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={programme.level === 1 ? 'info' : 'teal'}>Level {programme.level}</Badge>
                      <Badge variant="outline">{programme.theme}</Badge>
                      <span className="text-2xs text-slate">{programme.commitment}</span>
                    </div>
                    <p className="mt-3 text-[0.8125rem] leading-6 text-slate">{programme.summary}</p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3 text-2xs">
                        <span className="text-slate">{completed.length} of {totalLessons} lessons complete</span>
                        <span className="font-semibold text-ink">{enrolment.progress}%</span>
                      </div>
                      <ProgressBar value={enrolment.progress} label={`${programme.title} progress`} className="mt-1.5" />
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-md bg-canvas p-3 text-2xs leading-5 text-slate">
                      <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate" aria-hidden="true" />
                      {nextLesson ? (
                        <span>
                          <span className="font-semibold text-ink">Next lesson: </span>
                          {nextLesson.title}
                        </span>
                      ) : (
                        <span>All available lessons complete. Check your assessments and certificate status.</span>
                      )}
                    </div>
                  </CardBody>
                  <CardFooter>
                    {nextLesson ? (
                      <Link
                        to={`/app/learning/${programme.id}/${nextLesson.id}`}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-royal px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white transition hover:bg-royal-700"
                      >
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    ) : (
                      <Link to="/app/assessments" className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-navy px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white">
                        Assessments
                      </Link>
                    )}
                    <Link to={`/programmes/${programme.id}`} className="text-2xs font-semibold text-slate hover:text-ink">
                      Public overview
                    </Link>
                    <span className="ml-auto text-2xs text-slate">Enrolled {formatDate(enrolment.enrolledAt)}</span>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </TabPanel>

      <TabPanel id="catalogue" active={tab}>
        <div className="space-y-4">
          <FilterToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search programmes, themes or skills"
            resultLabel={`${filtered.length} of ${state.programmes.length} programmes shown`}
            onReset={query || level !== 'all' || theme !== 'all' || status !== 'all' ? resetFilters : undefined}
          >
            <div>
              <label htmlFor="catalogue-level" className="sr-only">Filter by level</label>
              <Select id="catalogue-level" value={level} onChange={(event) => setLevel(event.target.value)}>
                <option value="all">All levels</option>
                <option value="1">Level One</option>
                <option value="2">Level Two</option>
              </Select>
            </div>
            <div>
              <label htmlFor="catalogue-theme" className="sr-only">Filter by theme</label>
              <Select id="catalogue-theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option value="all">All themes</option>
                {themes.map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="catalogue-status" className="sr-only">Filter by status</label>
              <Select id="catalogue-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="waitlist">Waitlist</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
          </FilterToolbar>

          {filtered.length === 0 ? (
            <Card>
              <PanelEmpty title="No programmes match" description="Try a broader search or reset the filters." action={<Button variant="outline" onClick={resetFilters}>Reset filters</Button>} />
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pagination.pageItems.map((programme) => {
                const enrolled = enrolledIds.has(programme.id);
                const enrolment = enrolments.find((entry) => entry.programmeId === programme.id);
                return (
                  <Card key={programme.id} className="flex flex-col">
                    <CardBody className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={programme.level === 1 ? 'info' : 'teal'}>Level {programme.level}</Badge>
                        <StatusBadge status={programme.status} />
                        <span className="text-2xs text-slate">{programme.theme}</span>
                      </div>
                      <h2 className="mt-2 text-[1.0625rem] font-semibold leading-6 tracking-tight text-ink">
                        <Link to={`/programmes/${programme.id}`} className="hover:text-royal">{programme.title}</Link>
                      </h2>
                      <p className="mt-2 text-[0.8125rem] leading-6 text-slate">{programme.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-2xs text-slate">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(programme.startsAt)}</span>
                        <span>{programme.durationWeeks} weeks</span>
                        <span>{programme.commitment}</span>
                      </div>
                      <p className="mt-3 text-2xs text-slate">
                        {programme.enrolledCount} of {programme.capacity} places represented <DemoFigure>(demo)</DemoFigure>
                      </p>
                    </CardBody>
                    <CardFooter>
                      {enrolled && enrolment ? (
                        <>
                          <Badge variant="success">Enrolled · {enrolment.progress}%</Badge>
                          <Link to="/app/learning" className="ml-auto text-2xs font-semibold text-royal hover:underline">Continue learning</Link>
                        </>
                      ) : programme.status === 'closed' ? (
                        <span className="text-2xs text-slate">Enrolment closed</span>
                      ) : (
                        <Button size="sm" variant={programme.status === 'waitlist' ? 'outline' : 'primary'} onClick={() => setSelected(programme)}>
                          {programme.status === 'waitlist' ? 'Join waitlist' : 'Enrol'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            totalLabel={`${pagination.total} programmes`}
          />
        </div>
      </TabPanel>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Enrol in ${selected.title}` : 'Enrol'}
        description={selected ? `${selected.cohort} · ${selected.commitment}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={() => selected && void enrol(selected)} loading={selected ? isPending(`enrol-${selected.id}`) : false}>
              {selected?.status === 'waitlist' ? 'Confirm waitlist request' : 'Confirm enrolment'}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4 text-sm leading-6 text-slate">
            <p>{selected.summary}</p>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Eligibility</p>
              <ul className="mt-2 space-y-1.5">
                {selected.eligibility.map((item) => (
                  <li key={item} className="flex gap-2 text-[0.8125rem]">
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Alert variant={selected.status === 'waitlist' ? 'warning' : 'info'} title="Demonstration enrolment">
              {selected.status === 'waitlist'
                ? 'This proposed programme is not open. Joining the waitlist does not guarantee a place or a start date.'
                : 'No fee is charged and no real place is reserved. Enrolment is stored only in this browser.'}
            </Alert>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Learning centre                                                     */
/* ------------------------------------------------------------------ */

export function ParticipantLearningPage() {
  useDocumentTitle('Learning centre');
  const { user } = useAuth();
  const state = useDemoData();
  const [programmeId, setProgrammeId] = useState('all');

  if (!user) return null;

  const enrolments = userEnrolments(state, user.id);
  const enrolledProgrammes = enrolments
    .map((enrolment) => ({ enrolment, programme: findProgramme(state, enrolment.programmeId) }))
    .filter((entry): entry is { enrolment: (typeof enrolments)[number]; programme: Programme } => Boolean(entry.programme));

  const visible = programmeId === 'all' ? enrolledProgrammes : enrolledProgrammes.filter((entry) => entry.programme.id === programmeId);
  const totalLessons = visible.reduce(
    (sum, entry) => sum + state.modules.filter((module) => module.programmeId === entry.programme.id).reduce((count, module) => count + module.lessons.length, 0),
    0,
  );
  const totalComplete = visible.reduce((sum, entry) => sum + (state.progress[`${user.id}:${entry.programme.id}`]?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning centre"
        description="Work through lessons at your own pace. Progress is saved in this browser after each completed lesson."
        eyebrow="Learning"
        actions={
          enrolledProgrammes.length > 0 ? (
            <div className="w-full sm:w-64">
              <label htmlFor="learning-programme" className="sr-only">Filter by programme</label>
              <Select id="learning-programme" value={programmeId} onChange={(event) => setProgrammeId(event.target.value)}>
                <option value="all">All enrolled programmes</option>
                {enrolledProgrammes.map((entry) => (
                  <option key={entry.programme.id} value={entry.programme.id}>{entry.programme.title}</option>
                ))}
              </Select>
            </div>
          ) : undefined
        }
      />

      {enrolledProgrammes.length === 0 ? (
        <Card>
          <PanelEmpty
            title="No learning content yet"
            description="Enrol in a programme to unlock modules and lessons."
            action={<Link to="/app/programmes" className="text-sm font-semibold text-royal hover:underline">Browse programmes</Link>}
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Lessons complete" value={`${totalComplete}/${totalLessons}`} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label="Programmes in view" value={visible.length} icon={<Layers className="h-4 w-4" aria-hidden="true" />} />
            <StatCard label="Overall completion" value={`${percent(totalComplete, totalLessons)}%`} icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />} />
          </div>

          <div className="space-y-5">
            {visible.map(({ programme, enrolment }) => {
              const modules = state.modules
                .filter((module) => module.programmeId === programme.id)
                .sort((a, b) => a.order - b.order);
              const completed = state.progress[`${user.id}:${programme.id}`] ?? [];
              const lessonTotal = modules.reduce((sum, module) => sum + module.lessons.length, 0);
              return (
                <Card key={programme.id}>
                  <CardHeader
                    title={programme.title}
                    description={`${programme.cohort} · ${modules.length} modules · ${lessonTotal} lessons`}
                    action={<Badge variant={enrolment.status === 'active' ? 'success' : 'neutral'}>{enrolment.status}</Badge>}
                  />
                  <CardBody className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-2xs text-slate">
                        <span>{completed.length} of {lessonTotal} lessons complete</span>
                        <span className="font-semibold text-ink">{enrolment.progress}%</span>
                      </div>
                      <ProgressBar value={enrolment.progress} label={`${programme.title} progress`} className="mt-1.5" />
                    </div>

                    {modules.length === 0 ? (
                      <p className="rounded-md bg-canvas p-4 text-xs leading-5 text-slate">
                        The curriculum for this proposed programme is still being finalised. Lessons will appear once
                        published by a facilitator.
                      </p>
                    ) : (
                      <ol className="space-y-4">
                        {modules.map((module) => {
                          const moduleComplete = module.lessons.every((lesson) => completed.includes(lesson.id));
                          return (
                            <li key={module.id} className="rounded-md border border-line">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas/50 px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <span className={moduleComplete ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-50 text-success' : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-50 text-navy'}>
                                    {moduleComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <span className="text-2xs font-semibold">{module.order}</span>}
                                  </span>
                                  <div>
                                    <p className="text-[0.8125rem] font-semibold text-ink">{module.title}</p>
                                    <p className="text-2xs text-slate">{module.lessons.length} lessons · {module.durationMins} minutes</p>
                                  </div>
                                </div>
                                <Badge variant={moduleComplete ? 'success' : 'outline'}>{moduleComplete ? 'Complete' : `${module.lessons.filter((lesson) => completed.includes(lesson.id)).length}/${module.lessons.length}`}</Badge>
                              </div>
                              <ul className="divide-y divide-line/70">
                                {module.lessons.map((lesson) => {
                                  const isComplete = completed.includes(lesson.id);
                                  return (
                                    <li key={lesson.id}>
                                      <Link
                                        to={`/app/learning/${programme.id}/${lesson.id}`}
                                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-canvas/60"
                                      >
                                        <span className={isComplete ? 'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success' : 'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-slate'}>
                                          {isComplete ? <Check className="h-3 w-3" aria-hidden="true" /> : <Play className="h-2.5 w-2.5" aria-hidden="true" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="block text-[0.8125rem] font-medium text-ink">{lesson.title}</span>
                                          <span className="block text-2xs text-slate">{lesson.type} · {lesson.durationMins} minutes</span>
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function LessonPage() {
  const { programmeId = '', lessonId = '' } = useParams();
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const { run, isPending } = useAsyncAction();
  const [notes, setNotes] = useState('');

  const programme = findProgramme(state, programmeId);
  const modules = state.modules.filter((module) => module.programmeId === programmeId).sort((a, b) => a.order - b.order);
  const allLessons = modules.flatMap((module) => module.lessons);
  const lesson = allLessons.find((entry) => entry.id === lessonId);
  const module = modules.find((entry) => entry.id === lesson?.moduleId);
  const index = allLessons.findIndex((entry) => entry.id === lessonId);
  const previous = index > 0 ? allLessons[index - 1] : undefined;
  const next = index >= 0 && index < allLessons.length - 1 ? allLessons[index + 1] : undefined;
  const completed = user ? state.progress[`${user.id}:${programmeId}`] ?? [] : [];
  const isComplete = completed.includes(lessonId);

  useDocumentTitle(lesson?.title ?? 'Lesson');

  if (!user) return null;
  if (!programme || !lesson) {
    return (
      <Card>
        <PanelEmpty
          title="Lesson not found"
          description="This lesson may have been moved or the link is incomplete."
          action={<Link to="/app/learning" className="text-sm font-semibold text-royal hover:underline">Back to learning centre</Link>}
        />
      </Card>
    );
  }

  async function completeLesson() {
    await run('complete-lesson', () => learningService.completeLesson(programmeId, lessonId, user!.id), {
      successTitle: 'Lesson marked complete',
      successDescription: next ? 'Your progress has been saved. Continue to the next lesson when ready.' : 'You have reached the end of this programme’s available lessons.',
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-2xs text-slate">
        <Link to="/app/learning" className="hover:text-ink">Learning centre</Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="truncate">{programme.title}</span>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="font-medium text-ink">{lesson.title}</span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader
            title={lesson.title}
            description={`${module?.title ?? 'Module'} · ${lesson.durationMins} minutes · ${lesson.type}`}
            action={isComplete ? <Badge variant="success" icon={<Check className="h-3 w-3" aria-hidden="true" />}>Complete</Badge> : <Badge variant="outline">Not complete</Badge>}
          />
          <CardBody className="space-y-5">
            <p className="rounded-md bg-canvas p-3.5 text-[0.8125rem] leading-6 text-slate">{lesson.summary}</p>
            <div className="space-y-4 text-[0.9375rem] leading-7 text-ink/90">
              {lesson.body.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </div>

            {lesson.resource && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-3.5">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-teal" aria-hidden="true" />
                  <div>
                    <p className="text-[0.8125rem] font-semibold text-ink">{lesson.resource.label}</p>
                    <p className="text-2xs text-slate">{lesson.resource.size} · demonstration placeholder</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast({ title: 'Demonstration resource', description: 'File downloads are disabled in this build.', variant: 'info' })}
                  iconLeft={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Download
                </Button>
              </div>
            )}

            <div className="rounded-md border border-line p-4">
              <Field label="My notes" htmlFor="lesson-notes" hint="Notes stay in this browser for this session only." optional>
                <Textarea
                  id="lesson-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Capture a question or an action to try…"
                />
              </Field>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!notes.trim()}
                  onClick={() => toast({ title: 'Notes saved locally', description: 'Notes are not sent to a server in this demonstration.', variant: 'success' })}
                >
                  Save notes
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="flex gap-2">
                {previous && (
                  <Link to={`/app/learning/${programmeId}/${previous.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[0.8125rem] font-semibold text-ink transition hover:bg-canvas">
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    Previous
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {isComplete ? (
                  next ? (
                    <Link to={`/app/learning/${programmeId}/${next.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-royal px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white transition hover:bg-royal-700">
                      Next lesson
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link to="/app/assessments" className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-royal px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white">
                      Go to assessments
                    </Link>
                  )
                ) : (
                  <Button onClick={() => void completeLesson()} loading={isPending('complete-lesson')} iconLeft={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}>
                    Mark lesson complete
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Course contents" description={`${completed.length} of ${allLessons.length} lessons complete`} />
            <CardBody className="space-y-4">
              <ProgressBar value={percent(completed.length, allLessons.length)} label="Programme progress" />
              <ol className="space-y-4">
                {modules.map((entry) => (
                  <li key={entry.id}>
                    <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{entry.order}. {entry.title}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {entry.lessons.map((item) => {
                        const active = item.id === lessonId;
                        const done = completed.includes(item.id);
                        return (
                          <li key={item.id}>
                            <Link
                              to={`/app/learning/${programmeId}/${item.id}`}
                              aria-current={active ? 'page' : undefined}
                              className={`flex items-start gap-2 rounded px-2 py-1.5 text-2xs leading-5 transition ${active ? 'bg-royal-50 font-semibold text-royal' : 'text-slate hover:bg-canvas hover:text-ink'}`}
                            >
                              <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${done ? 'bg-success' : active ? 'bg-royal' : 'bg-slate-300'}`} aria-hidden="true" />
                              {item.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Need help?</p>
              <p className="mt-1.5 text-xs leading-5 text-slate">
                If a lesson is unclear or you need an adjustment, contact your facilitator or the support team.
              </p>
              <Link to="/contact" className="mt-2 inline-block text-xs font-semibold text-royal hover:underline">Contact support</Link>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sessions & Events (Section 5G)                                      */
/* ------------------------------------------------------------------ */

export function ParticipantSessionsPage() {
  useDocumentTitle('Sessions & Events');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const { run, isPending } = useAsyncAction();
  const [tab, setTab] = useState<'upcoming' | 'workshops' | 'webinars' | 'discussions' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSession, setActiveSession] = useState<ExchangeSession | null>(null);

  if (!user) return null;

  const userId = user.id;
  const registeredSessionIds = Object.entries(state.sessionRegistrations)
    .filter(([, users]) => users.includes(userId))
    .map(([id]) => id);

  const allSessions = state.sessions;
  const filteredSessions = allSessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (tab === 'upcoming') return s.status === 'upcoming';
    if (tab === 'past') return s.status === 'completed';
    if (tab === 'workshops') return s.title.toLowerCase().includes('workshop') || s.description.toLowerCase().includes('workshop');
    if (tab === 'webinars') return s.title.toLowerCase().includes('webinar') || s.title.toLowerCase().includes('panel') || s.description.toLowerCase().includes('speaker');
    if (tab === 'discussions') return s.title.toLowerCase().includes('discussion') || s.title.toLowerCase().includes('exchange') || s.description.toLowerCase().includes('discussion');
    return true;
  });

  const handleRegister = (session: ExchangeSession) => {
    void run(`reg-${session.id}`, () => sessionService.register(session.id, userId), {
      successTitle: 'Session Registration Confirmed',
      successDescription: `You have successfully reserved a seat for "${session.title}". Calendar invite queued.`,
    });
  };

  const handleCancel = (session: ExchangeSession) => {
    void run(`cancel-${session.id}`, () => sessionService.cancel(session.id, userId), {
      successTitle: 'Registration Released',
      successDescription: `Your seat for "${session.title}" has been released.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sessions &amp; Events
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Join live workshops, cross-border virtual exchange discussions, and regional webinars.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions, topics..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">My Registered Sessions</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{registeredSessionIds.length}</p>
          <p className="text-2xs text-slate-500 mt-0.5">Reserved places</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Total Available</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{allSessions.filter((s) => s.status === 'upcoming').length}</p>
          <p className="text-2xs text-slate-500 mt-0.5">Upcoming this month</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
          <p className="text-2xs text-emerald-600 mt-0.5">Verified East Africa presence</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Completed Sessions</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{allSessions.filter((s) => s.status === 'completed').length}</p>
          <p className="text-2xs text-slate-500 mt-0.5">Attended &amp; recorded</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'upcoming', label: 'Upcoming Sessions' },
          { key: 'workshops', label: 'Workshops' },
          { key: 'webinars', label: 'Webinars' },
          { key: 'discussions', label: 'Group Discussions' },
          { key: 'past', label: 'Past & Attendance History' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as typeof tab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === t.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => {
          const isRegistered = registeredSessionIds.includes(session.id);
          const isFull = session.registeredCount >= session.capacity && !isRegistered;
          const facilitator = state.users.find((u) => u.id === session.facilitatorId);

          return (
            <div
              key={session.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-2xs font-bold text-blue-700 uppercase tracking-wider">
                    {session.status === 'upcoming' ? 'Live Session' : 'Completed'}
                  </span>
                  {isRegistered && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-800">
                      <Check className="h-3 w-3" /> Registered
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900 line-clamp-1">{session.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{session.description}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span>{formatDateTime(session.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{session.durationMins} minutes ({session.timezone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>
                      {session.registeredCount} / {session.capacity} participants
                      {isFull ? ' (Session Full)' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSession(session)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Details
                </button>

                {session.status === 'upcoming' ? (
                  isRegistered ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: 'Virtual Room Ready',
                            description: `Connecting to ${session.title}. Room Host: ${facilitator?.name || 'YEP Facilitator'}.`,
                            variant: 'info',
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                      >
                        <Video className="h-3.5 w-3.5" /> Join Room
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(session)}
                        disabled={isPending(`cancel-${session.id}`)}
                        className="text-2xs font-semibold text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isFull || isPending(`reg-${session.id}`)}
                      onClick={() => handleRegister(session)}
                      className={`rounded-xl px-4 py-1.5 text-xs font-bold transition shadow-xs ${
                        isFull
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isFull ? 'Waitlist' : 'Register'}
                    </button>
                  )
                ) : (
                  <span className="text-2xs font-medium text-slate-400">Session Completed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">No sessions found</h3>
          <p className="mt-1 text-xs text-slate-500">
            There are no sessions matching your current filter criteria.
          </p>
        </div>
      )}

      {/* Session Details Modal */}
      <Dialog
        open={Boolean(activeSession)}
        onClose={() => setActiveSession(null)}
        title={activeSession?.title ?? 'Session Details'}
        description={activeSession ? `${formatDateTime(activeSession.startsAt)} · ${activeSession.timezone}` : undefined}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => setActiveSession(null)}>
              Close
            </Button>
            {activeSession && (
              registeredSessionIds.includes(activeSession.id) ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCancel(activeSession);
                      setActiveSession(null);
                    }}
                  >
                    Cancel Registration
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: 'Connecting to Live Room',
                        description: `Opening virtual session link for ${activeSession.title}.`,
                        variant: 'info',
                      });
                      setActiveSession(null);
                    }}
                  >
                    Join Live Room
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    handleRegister(activeSession);
                    setActiveSession(null);
                  }}
                  disabled={activeSession.registeredCount >= activeSession.capacity}
                >
                  Confirm Registration
                </Button>
              )
            )}
          </div>
        }
      >
        {activeSession && (
          <div className="space-y-4 text-sm text-slate-600">
            <p className="leading-relaxed">{activeSession.description}</p>

            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Facilitator</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {state.users.find((u) => u.id === activeSession.facilitatorId)?.name ?? 'YEP Regional Lead'}
                </p>
              </div>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Duration</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{activeSession.durationMins} minutes</p>
              </div>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Capacity &amp; Seats</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {activeSession.registeredCount} of {activeSession.capacity} booked
                </p>
              </div>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Attendance Credit</span>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">Eligible for Certificate</p>
              </div>
            </div>

            {activeSession.materials && activeSession.materials.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Session Resources &amp; Pre-Reading
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {activeSession.materials.map((m) => (
                    <li key={m.label} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <FileText className="h-4 w-4 text-blue-600" /> {m.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          toast({
                            title: 'Demonstration Resource',
                            description: `File "${m.label}" is bundled with the YEP curriculum repository.`,
                            variant: 'info',
                          })
                        }
                        className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
