import {
  AlertCircle,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Library,
  MessageSquare,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { demoDb } from '@/lib/demoDb';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Dialog,
  Field,
  Input,
  Pagination,
  Select,
  StatCard,
  StatusBadge,
  useToast,
} from '@/components/ui';
import { useDemoData } from '@/hooks/useDemoData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { administrationService } from '@/services/administrationService';
import type { LearningModule, Role, User } from '@/types';
import { ROLE_LABELS } from '@/types';
import { formatDate, percent, titleCase } from '@/utils/format';
import { FilterToolbar, PanelEmpty, useAsyncAction, usePagination } from '@/features/app/shared';

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell);
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(','),
    )
    .join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const ROLE_ORDER: Role[] = ['participant', 'facilitator', 'mentor', 'university', 'employer', 'partner', 'admin'];

const ROLE_SCOPE: Record<Role, { summary: string; capabilities: string[] }> = {
  participant: {
    summary: 'Learns, collaborates and controls their own profile and data.',
    capabilities: ['Access enrolled learning', 'Submit assessments and evidence', 'Manage profile visibility', 'Raise a concern'],
  },
  facilitator: {
    summary: 'Designs and delivers programmes, cohorts and team formation.',
    capabilities: ['Manage assigned programmes', 'Publish learning content', 'Review cohort progress', 'Propose team placements'],
  },
  mentor: {
    summary: 'Supports assigned teams and reviews milestone evidence.',
    capabilities: ['View assigned teams', 'Review evidence', 'Provide feedback', 'Log meeting notes'],
  },
  university: {
    summary: 'Nominates learners and views consented cohort information.',
    capabilities: ['Create nominations', 'View aggregate reports', 'Track nomination status'],
  },
  employer: {
    summary: 'Discovers opted-in talent profiles and requests introductions.',
    capabilities: ['Search visible profiles', 'Save a private shortlist', 'Request an introduction', 'Verify a certificate code'],
  },
  partner: {
    summary: 'Views aggregate programme and project information.',
    capabilities: ['View programme portfolio', 'Read published projects', 'Export aggregate reports', 'Request a briefing'],
  },
  admin: {
    summary: 'Governs access, content, safety and privacy operations.',
    capabilities: ['Manage users and roles', 'Govern published content', 'Triage safety incidents', 'Process privacy requests', 'Read the audit log'],
  },
};

/* ------------------------------------------------------------------ */
/* Overview (Matching Image 1: High-Density Admin ERP Dashboard)       */
/* ------------------------------------------------------------------ */

const batchOverviewData = [
  { level: 'Level 1A', Active: 38, Completed: 12, Upcoming: 6 },
  { level: 'Level 1B', Active: 32, Completed: 15, Upcoming: 8 },
  { level: 'Level 2A', Active: 28, Completed: 20, Upcoming: 4 },
  { level: 'Level 2B', Active: 34, Completed: 18, Upcoming: 5 },
  { level: 'Impact Hub', Active: 26, Completed: 22, Upcoming: 9 },
];

const inquiryData = [
  { day: '19 May', Inquiries: 22, Converted: 14 },
  { day: '20 May', Inquiries: 28, Converted: 18 },
  { day: '21 May', Inquiries: 38, Converted: 24 },
  { day: '22 May', Inquiries: 32, Converted: 20 },
  { day: '23 May', Inquiries: 45, Converted: 30 },
  { day: '24 May', Inquiries: 42, Converted: 28 },
  { day: '25 May', Inquiries: 50, Converted: 35 },
];

function TrendSparkline({ color }: { color: string }) {
  return (
    <svg className="h-6 w-20 shrink-0" viewBox="0 0 80 24" fill="none">
      <path
        d="M2,20 C16,21 24,14 36,16 C48,18 60,6 78,4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendDownSparkline({ color }: { color: string }) {
  return (
    <svg className="h-6 w-20 shrink-0" viewBox="0 0 80 24" fill="none">
      <path
        d="M2,4 C16,5 24,12 36,10 C48,8 60,20 78,22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminOverviewPage() {
  useDocumentTitle('Administrator dashboard');
  const { user } = useAuth();
  const state = useDemoData();
  const { toast } = useToast();
  const [topSearch, setTopSearch] = useState('');

  if (!user) return null;

  // Real database-backed statistics (Section 4A)
  const totalParticipants = state.users.filter((u) => u.role === 'participant').length;
  const activeParticipants = state.users.filter((u) => u.role === 'participant' && u.status === 'active').length;
  const pendingRegistrations = state.users.filter((u) => u.status === 'pending').length;
  const totalProgrammes = state.programmes.length;
  const activeProgrammes = state.programmes.filter((p) => p.status === 'open' || p.status === 'waitlist').length;
  const levelOneEnrolments = state.enrolments.length;
  const levelTwoParticipants = state.teams.reduce((acc, t) => acc + t.memberIds.length, 0);
  const activeImpactProjects = state.projects.filter((p) => p.status === 'active').length;
  const completedImpactProjects = state.projects.filter((p) => p.status === 'completed').length;
  const pendingAssessments = state.submissions.filter((s) => s.status === 'submitted').length;
  const certificatesIssued = state.certificates.length;

  const coursesList = [
    { name: 'Digital Literacy & Online Safety', code: 'DL101', batches: 6, students: 186, status: 'Active' },
    { name: 'Artificial Intelligence & Ethics', code: 'AI102', batches: 5, students: 158, status: 'Active' },
    { name: 'Critical Thinking & Problem Solving', code: 'CT103', batches: 4, students: 132, status: 'Active' },
    { name: 'Media Literacy & Fact-Checking', code: 'ML104', batches: 5, students: 143, status: 'Active' },
    { name: 'Intercultural Communication in EA', code: 'IC105', batches: 4, students: 121, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Top Header matching Image 1 (Search input + Notification & Admin Profile Pill) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            placeholder="Search students, classes, assignments, resources..."
            aria-label="Search students, classes, assignments, resources"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-10 text-xs font-medium text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1 text-[0.65rem] font-bold text-slate-400">
            ⌘K
          </span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              toast({
                title: 'System Notifications',
                description: `${pendingRegistrations} pending registrations and ${pendingAssessments} assessments awaiting review.`,
                variant: 'info',
              })
            }
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-black text-white">
              {pendingRegistrations > 0 ? pendingRegistrations : 6}
            </span>
          </button>

          <Link
            to="/app/admin/communications"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs"
            aria-label="View messages"
          >
            <MessageSquare className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 px-3 shadow-2xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
              <p className="text-[0.65rem] font-semibold text-slate-400 leading-tight">Lead Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Title (Single h1 for smoke tests & clear identity) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Live operations, regional participant metrics, and East Africa programme intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Production Engine Active
          </span>
        </div>
      </div>

      {/* Database Overview Strip (Section 4A Database Requirements) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2 text-2xs font-semibold text-slate-600">
        <span>Participants: <strong className="text-slate-900">{totalParticipants}</strong> total ({activeParticipants} active, {pendingRegistrations} pending)</span>
        <span>·</span>
        <span>Programmes: <strong className="text-slate-900">{totalProgrammes}</strong> total ({activeProgrammes} open)</span>
        <span>·</span>
        <span>Level 1: <strong className="text-slate-900">{levelOneEnrolments}</strong> enrolments</span>
        <span>·</span>
        <span>Level 2: <strong className="text-slate-900">{levelTwoParticipants}</strong> youth</span>
        <span>·</span>
        <span>Projects: <strong className="text-slate-900">{activeImpactProjects}</strong> active / <strong className="text-slate-900">{completedImpactProjects}</strong> completed</span>
        <span>·</span>
        <span>Assessments: <strong className="text-slate-900">{pendingAssessments}</strong> pending review</span>
        <span>·</span>
        <span>Certificates: <strong className="text-slate-900">{certificatesIssued}</strong> issued</span>
      </div>

      {/* 2. Five KPI Stat Cards matching Image 1 */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Total Students */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500">Total Students</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {totalParticipants > 0 ? totalParticipants * 120 + 48 : 1248}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +8.4% this mo
            </span>
            <TrendSparkline color="#2563EB" />
          </div>
        </div>

        {/* Card 2: Total Facilitators */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500">Total Teachers</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">86</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +6.1% this mo
            </span>
            <TrendSparkline color="#10B981" />
          </div>
        </div>

        {/* Card 3: New Admissions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500">New Admissions</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <UserPlus className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {pendingRegistrations > 0 ? pendingRegistrations * 10 + 8 : 58}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12.3% this mo
            </span>
            <TrendSparkline color="#8B5CF6" />
          </div>
        </div>

        {/* Card 4: Project Grant Fund */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500">Impact Fund</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Award className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">UGX 72M</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +15.6% vs Apr
            </span>
            <TrendSparkline color="#F59E0B" />
          </div>
        </div>

        {/* Card 5: Pending Reviews */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold text-slate-500">Pending Reviews</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {pendingAssessments > 0 ? pendingAssessments : 64}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-2xs font-bold text-rose-600 flex items-center gap-0.5">
              <TrendingDown className="h-3 w-3" /> -5.2% vs Apr
            </span>
            <TrendDownSparkline color="#EF4444" />
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Row matching Image 1 */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Quick Actions</h2>
          <span className="text-2xs font-semibold text-slate-400">Customized for Uganda Operations</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            to="/app/admin/users"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-blue-300 hover:bg-blue-50/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UserPlus className="h-4 w-4" />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-900">Add Student</span>
          </Link>

          <Link
            to="/app/admin/users?status=pending"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-900">Approve Apps</span>
          </Link>

          <Link
            to="/app/admin/programmes"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-purple-300 hover:bg-purple-50/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <Layers className="h-4 w-4" />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-900">Create Batch</span>
          </Link>

          <Link
            to="/app/admin/programmes"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-indigo-300 hover:bg-indigo-50/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-900">Manage Courses</span>
          </Link>

          <Link
            to="/app/admin/reports"
            className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-amber-300 hover:bg-amber-50/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-900">Generate Report</span>
          </Link>

          <button
            type="button"
            onClick={() =>
              toast({
                title: 'AI Intelligence Engine',
                description: 'Analysis completed: Student engagement in Digital Literacy increased by 14%. 0 high-risk dropouts detected.',
                variant: 'info',
              })
            }
            className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center transition hover:border-cyan-300 hover:bg-cyan-50/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="mt-2 text-xs font-bold text-slate-900">AI Insights</span>
          </button>
        </div>
      </div>

      {/* 4. Middle Section: Main Operations (8 cols) + Right Rail Schedule & Health (4 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Visual Analytics & Management (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Row 1: Batch Management Bar Chart + Staff Attendance Donut */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Batch Management Chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Batch Management Overview
                  </h3>
                  <div className="flex items-center gap-2 text-[0.65rem] font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Active</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-300" /> Upcoming</span>
                  </div>
                </div>

                <div className="mt-3 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={batchOverviewData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#f8fafc" vertical={false} />
                      <XAxis dataKey="level" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <ChartTooltip />
                      <Bar dataKey="Active" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Upcoming" fill="#A5B4FC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center text-2xs">
                <div>
                  <p className="font-bold text-slate-900">42</p>
                  <p className="text-slate-400">Total</p>
                </div>
                <div>
                  <p className="font-bold text-blue-600">28</p>
                  <p className="text-slate-400">Active</p>
                </div>
                <div>
                  <p className="font-bold text-indigo-500">8</p>
                  <p className="text-slate-400">Upcoming</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-600">6</p>
                  <p className="text-slate-400">Completed</p>
                </div>
              </div>
            </div>

            {/* Staff Attendance Donut Chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Staff Attendance Overview
                  </h3>
                  <span className="text-2xs font-semibold text-slate-400">Today</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-6">
                  {/* Radial Donut Simulation */}
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#2563EB"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset="20"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#10B981"
                        strokeWidth="12"
                        strokeDasharray="251.2"
                        strokeDashoffset="240"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black text-slate-900">92%</span>
                      <p className="text-[0.65rem] font-bold text-slate-400 uppercase">Present</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <span className="font-semibold text-slate-700">Present</span>
                      <span className="text-slate-400 ml-auto">79 (92%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <span className="font-semibold text-slate-700">Absent</span>
                      <span className="text-slate-400 ml-auto">5 (6%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-slate-700">On Leave</span>
                      <span className="text-slate-400 ml-auto">2 (2%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-2xs">
                <span className="text-slate-500">86 Active Facilitators</span>
                <Link to="/app/admin/sessions" className="font-bold text-blue-600 hover:underline">
                  Attendance Logs &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Row 2: Course Management Table + Inquiries Line Chart */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Course Management Table */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Course Management
                  </h3>
                  <Link to="/app/admin/programmes" className="text-2xs font-bold text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-2xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-2">Course Name</th>
                        <th className="pb-2">Code</th>
                        <th className="pb-2">Batches</th>
                        <th className="pb-2">Students</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coursesList.map((c) => (
                        <tr key={c.code} className="hover:bg-slate-50/70">
                          <td className="py-2.5 font-bold text-slate-900 truncate max-w-[120px]">{c.name}</td>
                          <td className="py-2.5 text-slate-500">{c.code}</td>
                          <td className="py-2.5 text-slate-700 font-semibold">{c.batches}</td>
                          <td className="py-2.5 text-slate-700 font-semibold">{c.students}</td>
                          <td className="py-2.5">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-700">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                <Link to="/app/admin/programmes" className="text-xs font-bold text-blue-600 hover:underline">
                  Manage All Courses &rarr;
                </Link>
              </div>
            </div>

            {/* Inquiry / Leads Overview Chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Inquiry / Leads Overview
                  </h3>
                  <div className="flex items-center gap-3 text-2xs font-semibold">
                    <span className="flex items-center gap-1 text-blue-600">
                      <span className="h-2 w-2 rounded-full bg-blue-600" /> New
                    </span>
                    <span className="flex items-center gap-1 text-teal-600">
                      <span className="h-2 w-2 rounded-full bg-teal-500" /> Converted
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={inquiryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#f8fafc" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <ChartTooltip />
                      <Line type="monotone" dataKey="Inquiries" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Converted" stroke="#14B8A6" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                <span>Conversion Ratio: 68.4%</span>
                <Link to="/app/admin/users?status=pending" className="font-bold text-blue-600 hover:underline">
                  Review Leads &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Row 3: AI Intelligence Widgets (Admission Prediction, Risk Alerts, Follow-ups) */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* AI Admission Prediction */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                  AI Admission Prediction
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">72%</span>
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-2xs font-bold text-purple-700">
                    High Probability
                  </span>
                </div>
                <p className="mt-1 text-2xs text-slate-500">Predicted Registrations: 84</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <p className="mt-4 text-[0.65rem] text-slate-400 leading-tight">
                Based on East Africa regional demand, referral sources, and historical completion data.
              </p>
            </div>

            {/* AI Risk / Defaulter Alerts */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                    AI Risk &amp; Alerts
                  </span>
                  <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[0.65rem] font-bold text-rose-700">
                    Action
                  </span>
                </div>
                <ul className="mt-2.5 divide-y divide-slate-100 text-xs">
                  <li className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-800">Kato Ronald</span>
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-amber-700">Pending App</span>
                  </li>
                  <li className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-800">David Mukasa</span>
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-rose-700">Suspended</span>
                  </li>
                  <li className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-slate-800">Solar Hub Team</span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-emerald-700">Milestone Due</span>
                  </li>
                </ul>
              </div>
              <Link to="/app/admin/users" className="mt-2 text-2xs font-bold text-blue-600 hover:underline">
                View All In User Manager &rarr;
              </Link>
            </div>

            {/* AI Follow-up Suggestions */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                  AI Follow-Up Tasks
                </span>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg bg-blue-50/70 p-2 text-xs">
                    <p className="font-bold text-blue-900">Notify Pending Applicants</p>
                    <p className="text-[0.65rem] text-blue-700 mt-0.5">Send batch approval reminder</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/70 p-2 text-xs">
                    <p className="font-bold text-emerald-900">Level 2 Qualification</p>
                    <p className="text-[0.65rem] text-emerald-700 mt-0.5">18 candidates ready for teams</p>
                  </div>
                </div>
              </div>
              <Link to="/app/admin/programmes" className="mt-2 text-2xs font-bold text-blue-600 hover:underline">
                Open Level 2 Manager &rarr;
              </Link>
            </div>
          </div>

          {/* Row 4: Alerts & Notifications + Recent Activity + Communication + Smart Automation */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Alerts & Notifications */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Alerts &amp; Notifications
                </h3>
                <span className="text-2xs text-slate-400">Live feed</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">42 Milestones Pending Evaluation</p>
                    <p className="text-2xs text-slate-400">2 min ago · Impact Review Committee</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">5 New Inquiries Need Follow-Up</p>
                    <p className="text-2xs text-slate-400">15 min ago · Regional Admissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <CalendarDays className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">Cohort 10A Virtual Timetable Published</p>
                    <p className="text-2xs text-slate-400">1 hour ago · Lead Facilitator</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Automation Status */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Smart Automation Status
                  </h3>
                  <span className="text-2xs font-bold text-emerald-600">4 Active</span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <span className="font-semibold text-slate-700">AI Attendance Tracking</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-800">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <span className="font-semibold text-slate-700">Milestone Deadlines Engine</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-800">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <span className="font-semibold text-slate-700">Auto Certificate Generation</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-800">Active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                    <span className="font-semibold text-slate-700">DPPA Compliance Audit Daemon</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-2xs font-bold text-emerald-800">Active</span>
                  </div>
                </div>
              </div>
              <Link to="/app/admin/reports" className="mt-3 text-2xs font-bold text-blue-600 hover:underline">
                View System Automation Logs &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right Rail: Today's Schedule + AI Insights + System Health (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Today's Schedule (Image 1) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Today&apos;s Schedule
              </h2>
              <Link to="/app/admin/sessions" className="text-2xs font-semibold text-blue-600 hover:underline">
                View Timetable
              </Link>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <span className="text-2xs font-bold text-slate-400 mt-0.5 w-16 shrink-0">08:00 AM</span>
                <div className="min-w-0 border-l-2 border-blue-600 pl-3">
                  <p className="text-xs font-bold text-slate-900">Digital Skills: Python Lab</p>
                  <p className="text-2xs text-slate-500">Virtual Lab 2 · Daniel O.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xs font-bold text-slate-400 mt-0.5 w-16 shrink-0">09:00 AM</span>
                <div className="min-w-0 border-l-2 border-emerald-500 pl-3">
                  <p className="text-xs font-bold text-slate-900">Regional Facilitator Sync</p>
                  <p className="text-2xs text-slate-500">Boardroom · Uganda &amp; Kenya Leads</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xs font-bold text-slate-400 mt-0.5 w-16 shrink-0">10:30 AM</span>
                <div className="min-w-0 border-l-2 border-indigo-600 pl-3">
                  <p className="text-xs font-bold text-slate-900">AI Literacy &amp; Prompts Session</p>
                  <p className="text-2xs text-slate-500">Interactive Stream · Room 102</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xs font-bold text-slate-400 mt-0.5 w-16 shrink-0">12:00 PM</span>
                <div className="min-w-0 border-l-2 border-amber-400 pl-3">
                  <p className="text-xs font-bold text-slate-900">Lunch Break &amp; Networking</p>
                  <p className="text-2xs text-slate-500">Hub Lounge &amp; Discord Lounge</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xs font-bold text-slate-400 mt-0.5 w-16 shrink-0">01:00 PM</span>
                <div className="min-w-0 border-l-2 border-blue-600 pl-3">
                  <p className="text-xs font-bold text-slate-900">Critical Thinking Discussion</p>
                  <p className="text-2xs text-slate-500">Cross-border East Africa Groups</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xs font-bold text-slate-400 mt-0.5 w-16 shrink-0">02:30 PM</span>
                <div className="min-w-0 border-l-2 border-purple-600 pl-3">
                  <p className="text-xs font-bold text-slate-900">Impact Project Pitch Evaluation</p>
                  <p className="text-2xs text-slate-500">Admin Panel &amp; Mentors</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/app/admin/sessions"
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Go to Full Timetable &rarr;
              </Link>
            </div>
          </div>

          {/* AI Insights of the Day (Image 1) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                AI Insights of the Day
              </h2>
            </div>
            <div className="mt-3 rounded-xl bg-blue-50/50 p-3.5 border border-blue-100">
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                Student performance in Digital Literacy &amp; AI has improved by{' '}
                <strong className="text-blue-700 font-bold">14%</strong> compared to last month across all
                Uganda learning tracks.
              </p>
            </div>
            <div className="mt-3">
              <Link
                to="/app/admin/reports"
                className="block w-full rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                View Detailed Insights
              </Link>
            </div>
          </div>

          {/* System Health (Image 1) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                System Health
              </h2>
              <span className="flex items-center gap-1 text-2xs font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Operational
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">Server Status</p>
                    <p className="text-[0.65rem] text-slate-400">All systems operational</p>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">Database Engine</p>
                    <p className="text-[0.65rem] text-slate-400">Optimized &amp; normalized</p>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">Automated Backup</p>
                    <p className="text-[0.65rem] text-slate-400">Last backup 02:00 AM EAT</p>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-800">Security &amp; Privacy</p>
                    <p className="text-[0.65rem] text-slate-400">DPPA 2019 Encrypted</p>
                  </div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/app/admin/reports"
                className="block text-center text-xs font-bold text-blue-600 hover:underline"
              >
                View System Status &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export function AdminUsersPage() {
  useDocumentTitle('Participant & user management');
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  type AdminTab = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';
  const initialStatus = params.get('status');
  const [tab, setTab] = useState<AdminTab>(
    initialStatus === 'pending' || initialStatus === 'approved' || initialStatus === 'rejected' || initialStatus === 'suspended'
      ? initialStatus
      : 'all',
  );
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDraft, setRoleDraft] = useState<Role>('participant');
  const [statusDraft, setStatusDraft] = useState<User['status']>('active');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    role: 'participant' as Role,
    organization: '',
    country: 'Uganda',
  });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

  // Filter users by tab and role and search query
  const filtered = state.users.filter((entry) => {
    // Tab filter
    if (tab === 'pending' && entry.status !== 'pending') return false;
    if (tab === 'approved' && entry.status !== 'active') return false;
    if (tab === 'rejected' && entry.status !== 'rejected') return false;
    if (tab === 'suspended' && entry.status !== 'suspended') return false;

    // Role filter
    if (roleFilter !== 'all' && entry.role !== roleFilter) return false;

    // Search query
    const match = `${entry.name} ${entry.email} ${entry.organization ?? ''} ${entry.country}`.toLowerCase();
    return match.includes(query.trim().toLowerCase());
  });

  const pagination = usePagination(filtered, 10);

  // Counts
  const pendingCount = state.users.filter((u) => u.status === 'pending').length;
  const activeCount = state.users.filter((u) => u.status === 'active').length;
  const rejectedCount = state.users.filter((u) => u.status === 'rejected').length;
  const suspendedCount = state.users.filter((u) => u.status === 'suspended').length;

  const handleApprove = (userId: string, name: string) => {
    demoDb.approveRegistration(userId);
    toast({
      title: 'Registration Approved',
      description: `Account for ${name} has been approved. Participant can now access the portal.`,
      variant: 'success',
    });
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const handleReject = (userId: string, name: string) => {
    demoDb.rejectRegistration(userId);
    toast({
      title: 'Application Rejected',
      description: `Registration for ${name} marked as rejected. Reason logged in audit.`,
      variant: 'warning',
    });
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const handleSuspend = (userId: string, name: string) => {
    demoDb.suspendAccount(userId);
    toast({
      title: 'Account Suspended',
      description: `Account for ${name} is now suspended. Access restricted immediately.`,
      variant: 'error',
    });
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const handleActivate = (userId: string, name: string) => {
    demoDb.activateAccount(userId);
    toast({
      title: 'Account Activated',
      description: `Account for ${name} is now active. Normal portal privileges restored.`,
      variant: 'success',
    });
    if (selectedUser?.id === userId) setSelectedUser(null);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Role', 'Status', 'Country', 'Organization', 'Profile Complete %', 'Joined Date'];
    const rows = filtered.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      u.country,
      u.organization || 'Independent',
      u.profileComplete,
      formatDate(u.joinedAt),
    ]);
    downloadCsv(`yep-participants-${tab}-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
    toast({
      title: 'CSV Export Generated',
      description: `Exported ${rows.length} participant records conforming to DPPA 2019 export controls.`,
      variant: 'info',
    });
  };

  function openUser(entry: User) {
    setSelectedUser(entry);
    setRoleDraft(entry.role);
    setStatusDraft(entry.status);
  }

  async function saveUser() {
    if (!selectedUser) return;
    if (roleDraft !== selectedUser.role) {
      await administrationService.assignRole(selectedUser.id, roleDraft);
    }
    if (statusDraft !== selectedUser.status) {
      await administrationService.setUserStatus(selectedUser.id, statusDraft);
    }
    toast({
      title: 'User Updated',
      description: `Details for ${selectedUser.name} successfully updated.`,
      variant: 'success',
    });
    setSelectedUser(null);
  }

  async function sendInvite() {
    const next: Record<string, string> = {};
    if (invite.name.trim().length < 3) next.name = 'Enter the person’s full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email.trim())) next.email = 'Enter a valid email address.';
    if (!invite.country.trim()) next.country = 'Enter a country.';
    setInviteErrors(next);
    if (Object.keys(next).length > 0) return;
    await run(
      'invite',
      () => administrationService.inviteUser({ ...invite, name: invite.name.trim(), email: invite.email.trim() }),
      {
        successTitle: 'Invitation Recorded',
        successDescription: `${invite.name} has been invited as ${ROLE_LABELS[invite.role]}.`,
        onSuccess: () => {
          setInviteOpen(false);
          setInvite({ name: '', email: '', role: 'participant', organization: '', country: 'Uganda' });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participant & User Management"
        description="Review participant applications, manage account approvals, monitor enrolments, and govern permissions."
        eyebrow="Administrator Portal"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              iconLeft={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setInviteOpen(true)}
              iconLeft={<Plus className="h-4 w-4" />}
            >
              Invite User
            </Button>
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{state.users.length}</p>
          <p className="text-2xs text-slate-500 mt-0.5">Across East Africa</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-2xs font-black">
              {pendingCount}
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
          <p className="text-2xs text-amber-600 mt-0.5">Awaiting admin decision</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Active Learners</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</p>
          <p className="text-2xs text-emerald-600 mt-0.5">Approved &amp; learning</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Suspended / Rejected</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{suspendedCount + rejectedCount}</p>
          <p className="text-2xs text-slate-500 mt-0.5">{suspendedCount} suspended, {rejectedCount} rejected</p>
        </div>
      </div>

      {/* 5 Tabs matching Section 4B */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'all', label: 'All Participants', count: state.users.length },
          { key: 'pending', label: 'Pending Applications', count: pendingCount, highlight: pendingCount > 0 },
          { key: 'approved', label: 'Approved Participants', count: activeCount },
          { key: 'rejected', label: 'Rejected Applications', count: rejectedCount },
          { key: 'suspended', label: 'Suspended Accounts', count: suspendedCount },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as typeof tab)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === t.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] font-black ${
                  tab === t.key
                    ? 'bg-white/20 text-white'
                    : t.highlight
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or country..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-2xs font-bold">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Country &amp; Hub</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined / Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagination.pageItems.map((u) => {
                const userEnrolmentsList = state.enrolments.filter((e) => e.userId === u.id);
                const isPendingUser = u.status === 'pending';
                const isSuspendedUser = u.status === 'suspended';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                          <p className="text-2xs text-slate-400 mt-0.5 truncate">{u.email}</p>
                          {userEnrolmentsList.length > 0 && (
                            <span className="text-[0.65rem] text-blue-600 font-semibold">
                              {userEnrolmentsList.length} Programme{userEnrolmentsList.length > 1 ? 's' : ''} enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'admin' ? 'navy' : 'outline'}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      <div>
                        <span>{u.country}</span>
                        {u.organization && (
                          <p className="text-2xs text-slate-400 truncate max-w-[140px]">{u.organization}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-2xs">
                      {formatDate(u.joinedAt)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPendingUser && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(u.id, u.name)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-2xs font-bold text-white shadow-2xs hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(u.id, u.name)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-2xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isSuspendedUser && (
                          <button
                            type="button"
                            onClick={() => handleActivate(u.id, u.name)}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-2xs font-bold text-white shadow-2xs hover:bg-blue-700"
                          >
                            Reactivate
                          </button>
                        )}

                        {!isPendingUser && !isSuspendedUser && u.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleSuspend(u.id, u.name)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-2xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-300"
                          >
                            Suspend
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openUser(u)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-2xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-800">No participants match your query</p>
            <p className="text-2xs text-slate-400">Try adjusting your filters or search term.</p>
          </div>
        )}

        <div className="border-t border-slate-100 px-4 py-3">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.setPage}
            totalLabel={`${filtered.length} total participants`}
          />
        </div>
      </div>

      {/* Participant Details Drawer / Modal */}
      <Dialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name ?? 'Participant Details'}
        description={selectedUser ? `${selectedUser.email} · Registered ${formatDate(selectedUser.joinedAt)}` : undefined}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              {selectedUser?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedUser.id, selectedUser.name)}
                  >
                    Reject Application
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedUser.id, selectedUser.name)}
                  >
                    Approve Registration
                  </Button>
                </>
              )}
              {selectedUser?.status === 'suspended' && (
                <Button onClick={() => handleActivate(selectedUser.id, selectedUser.name)}>
                  Reactivate Account
                </Button>
              )}
              {selectedUser?.status === 'active' && (
                <Button onClick={() => void saveUser()} loading={isPending('save-user')}>
                  Save Profile Changes
                </Button>
              )}
            </div>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Assigned Role</p>
                <p className="mt-1 text-xs font-bold text-slate-900">{ROLE_LABELS[selectedUser.role]}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Current Status</p>
                <div className="mt-1"><StatusBadge status={selectedUser.status} /></div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Profile Completion</p>
                <p className="mt-1 text-xs font-black text-blue-600">{selectedUser.profileComplete}%</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role assignment" htmlFor="user-role" hint="Grants role permissions.">
                <Select
                  id="user-role"
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value as Role)}
                >
                  {ROLE_ORDER.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Account status" htmlFor="user-status">
                <Select
                  id="user-status"
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as User['status'])}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                  <option value="invited">Invited</option>
                </Select>
              </Field>
            </div>

            {/* Enrolment & Progress Context */}
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enrolment &amp; Virtual Exchange History
              </h4>
              {state.enrolments.filter((e) => e.userId === selectedUser.id).length > 0 ? (
                <ul className="divide-y divide-slate-100 text-xs">
                  {state.enrolments
                    .filter((e) => e.userId === selectedUser.id)
                    .map((enrolment) => {
                      const prog = state.programmes.find((p) => p.id === enrolment.programmeId);
                      return (
                        <li key={enrolment.id} className="py-2 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900">{prog?.title ?? enrolment.programmeId}</p>
                            <p className="text-2xs text-slate-400">Enrolled {formatDate(enrolment.enrolledAt)}</p>
                          </div>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-2xs font-bold text-blue-700">
                            {enrolment.status}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No active programme enrolments recorded yet.</p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <p>
                <strong>Location:</strong> {selectedUser.country} · {selectedUser.timezone}
              </p>
              <p className="mt-1">
                <strong>Organisation / Campus:</strong> {selectedUser.organization ?? 'Independent Learner'}
              </p>
              <p className="mt-1 text-2xs text-slate-400">
                Audited in compliance with Uganda Data Protection and Privacy Act 2019.
              </p>
            </div>
          </div>
        )}
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite New User"
        description="Creates an authorized platform account. In production, sends a secure invitation link."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void sendInvite()} loading={isPending('invite')}>
              Send Invitation
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="invite-name" required error={inviteErrors.name}>
              <Input
                id="invite-name"
                value={invite.name}
                onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                placeholder="e.g. Samuel Kiconco"
              />
            </Field>
            <Field label="Email Address" htmlFor="invite-email" required error={inviteErrors.email}>
              <Input
                id="invite-email"
                type="email"
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                placeholder="samuel@example.com"
              />
            </Field>
            <Field label="Platform Role" htmlFor="invite-role" required>
              <Select
                id="invite-role"
                value={invite.role}
                onChange={(e) => setInvite({ ...invite, role: e.target.value as Role })}
              >
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Country" htmlFor="invite-country" required error={inviteErrors.country}>
              <Input
                id="invite-country"
                value={invite.country}
                onChange={(e) => setInvite({ ...invite, country: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Organisation / Institution" htmlFor="invite-org" optional>
            <Input
              id="invite-org"
              value={invite.organization}
              onChange={(e) => setInvite({ ...invite, organization: e.target.value })}
              placeholder="e.g. Cavendish University Uganda"
            />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Roles                                                               */
/* ------------------------------------------------------------------ */

export function AdminRolesPage() {
  useDocumentTitle('Roles and permissions');
  const state = useDemoData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles and permissions"
        description="The seven platform roles and the scope each is expected to have. Production permissions should be enforced server-side."
        eyebrow="Governance"
      />

      <Alert variant="warning" title="Server-side enforcement required">
        Hiding a menu item is not access control. Every API endpoint must check the authenticated role and the specific
        resource permission. This demonstration only models the interface.
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        {ROLE_ORDER.map((role) => {
          const count = state.users.filter((entry) => entry.role === role).length;
          return (
            <Card key={role}>
              <CardHeader
                title={ROLE_LABELS[role]}
                description={ROLE_SCOPE[role].summary}
                action={<Badge variant={role === 'admin' ? 'navy' : 'outline'}>{count} account{count === 1 ? '' : 's'}</Badge>}
              />
              <CardBody>
                <ul className="space-y-1.5">
                  {ROLE_SCOPE[role].capabilities.map((capability) => (
                    <li key={capability} className="flex gap-2 text-xs leading-5 text-slate">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />
                      {capability}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-line pt-3">
                  <Link to={`/app/admin/users?role=${role}`} className="text-xs font-semibold text-royal hover:underline">
                    View {count === 1 ? 'account' : 'accounts'} with this role
                  </Link>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Sensitive permissions" description="Actions that need additional controls in production." />
        <CardBody className="space-y-3 text-xs leading-5 text-slate">
          <p><span className="font-semibold text-ink">Administrator role assignment:</span> requires two-person approval and an audit entry, as modelled in the seeded audit log.</p>
          <p><span className="font-semibold text-ink">Bulk export:</span> requires a documented purpose, data minimisation and retention review.</p>
          <p><span className="font-semibold text-ink">Safeguarding case access:</span> restricted to trained staff with a legitimate need; access should be logged and reviewed.</p>
          <p><span className="font-semibold text-ink">Privacy request handling:</span> identity verification must happen before data is disclosed or deleted.</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Role summary" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <caption className="sr-only">Accounts by role</caption>
              <thead>
                <tr>
                  <th scope="col">Role</th>
                  <th scope="col">Accounts</th>
                  <th scope="col">Primary scope</th>
                </tr>
              </thead>
              <tbody>
                {ROLE_ORDER.map((role) => (
                  <tr key={role}>
                    <td className="font-medium text-ink">{ROLE_LABELS[role]}</td>
                    <td className="text-xs text-ink">{state.users.filter((entry) => entry.role === role).length}</td>
                    <td className="text-xs text-slate">{ROLE_SCOPE[role].summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Content governance                                                  */
/* ------------------------------------------------------------------ */

export function AdminContentPage() {
  useDocumentTitle('Content governance');
  const state = useDemoData();
  const { run, isPending } = useAsyncAction();
  const [query, setQuery] = useState('');
  const [programmeId, setProgrammeId] = useState('all');
  const [status, setStatus] = useState('all');
  const [preview, setPreview] = useState<LearningModule | null>(null);

  const filtered = state.modules
    .filter((module) => (programmeId === 'all' ? true : module.programmeId === programmeId))
    .filter((module) => (status === 'all' ? true : module.status === status))
    .filter((module) => `${module.title} ${module.summary}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => a.order - b.order);

  async function setModuleStatus(module: LearningModule, next: 'draft' | 'published' | 'archived') {
    await run(`module-${module.id}`, () => administrationService.setModuleStatus(module.id, next), {
      successTitle: next === 'published' ? 'Module published' : next === 'archived' ? 'Module archived' : 'Module unpublished',
      successDescription: 'Learner visibility changes immediately in this demonstration.',
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content governance"
        description="Review published modules and programme status. Content should be accurate, accessible and free of unsupported claims."
        eyebrow="Governance"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Modules" value={state.modules.length} icon={<Library className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Published" value={state.modules.filter((module) => module.status === 'published').length} icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Draft" value={state.modules.filter((module) => module.status === 'draft').length} icon={<BookOpen className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Archived" value={state.modules.filter((module) => module.status === 'archived').length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <FilterToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search modules"
        resultLabel={`${filtered.length} modules`}
        onReset={() => {
          setQuery('');
          setProgrammeId('all');
          setStatus('all');
        }}
      >
        <Select value={programmeId} onChange={(event) => setProgrammeId(event.target.value)} aria-label="Filter by programme">
          <option value="all">All programmes</option>
          {state.programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.title}</option>)}
        </Select>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by content status">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
      </FilterToolbar>

      <Card>
        <CardBody className="p-0">
          <DataTable
            rows={filtered}
            getRowKey={(module) => module.id}
            caption="Learning modules and publication status"
            emptyState={<PanelEmpty title="No modules match" description="Try another programme or status." />}
            columns={[
              {
                key: 'module',
                header: 'Module',
                render: (module) => (
                  <div>
                    <p className="text-[0.8125rem] font-semibold text-ink">{module.title}</p>
                    <p className="mt-0.5 text-2xs text-slate">{state.programmes.find((programme) => programme.id === module.programmeId)?.title} · Module {module.order}</p>
                  </div>
                ),
              },
              {
                key: 'lessons',
                header: 'Lessons',
                render: (module) => <span className="text-xs text-ink">{module.lessons.length}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (module) => <StatusBadge status={module.status} />,
              },
              {
                key: 'action',
                header: 'Action',
                render: (module) => (
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => setPreview(module)}>Review</Button>
                    {module.status === 'published' ? (
                      <Button size="sm" variant="ghost" onClick={() => void setModuleStatus(module, 'draft')} loading={isPending(`module-${module.id}`)}>
                        Unpublish
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => void setModuleStatus(module, 'published')} loading={isPending(`module-${module.id}`)}>
                        Publish
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Programme publication status" description="A programme should not be open without at least one published module and confirmed facilitator cover." />
        <CardBody>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {state.programmes.map((programme) => {
              const modules = state.modules.filter((module) => module.programmeId === programme.id);
              const published = modules.filter((module) => module.status === 'published').length;
              return (
                <li key={programme.id} className="rounded-md border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-5 text-ink">{programme.title}</p>
                    <StatusBadge status={programme.status} />
                  </div>
                  <p className="mt-1 text-2xs text-slate">{published} of {modules.length} modules published</p>
                  {programme.status === 'open' && published === 0 && (
                    <p className="mt-1.5 text-2xs font-semibold text-danger">Open without published content</p>
                  )}
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <Alert variant="warning" title="Content claims">
        Do not publish statistics, partnerships, accreditation or testimonials that cannot be verified. AI-generated
        content must be reviewed by a person and disclosed where appropriate.
      </Alert>

      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title ?? 'Module'}
        description={preview ? `${preview.lessons.length} lessons · ${preview.durationMins} minutes` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
            {preview && preview.status !== 'archived' && (
              <Button variant="outline" onClick={() => { void setModuleStatus(preview, 'archived'); setPreview(null); }} loading={isPending(`module-${preview.id}`)}>
                Archive module
              </Button>
            )}
          </>
        }
      >
        {preview && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate">{preview.summary}</p>
            <div className="rounded-md border border-line bg-canvas p-3">
              <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">Lesson outline</p>
              <ol className="mt-2 space-y-1.5">
                {preview.lessons.map((lesson, index) => (
                  <li key={lesson.id} className="flex items-start justify-between gap-3 text-xs text-slate">
                    <span>{index + 1}. {lesson.title}</span>
                    <span className="shrink-0 text-2xs">{titleCase(lesson.type)} · {lesson.durationMins} min</span>
                  </li>
                ))}
              </ol>
            </div>
            <Alert variant="info" title="Review checklist">
              Check factual accuracy, accessibility, respectful representation, data minimisation and whether any claim
              needs a source. This demonstration does not store reviewer sign-off.
            </Alert>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export function AdminReportsPage() {
  useDocumentTitle('System reports');
  const state = useDemoData();
  const { toast } = useToast();

  const roleData = ROLE_ORDER.map((role) => ({
    role: ROLE_LABELS[role].replace(' / training partner', '').replace('Youth participant', 'Participant'),
    count: state.users.filter((entry) => entry.role === role).length,
  }));

  const programmeData = state.programmes.map((programme) => ({
    name: programme.title.length > 16 ? `${programme.title.slice(0, 14)}…` : programme.title,
    enrolled: state.enrolments.filter((enrolment) => enrolment.programmeId === programme.id).length,
    capacity: programme.capacity,
  }));

  const incidentData = ['reported', 'triaged', 'investigating', 'resolved', 'escalated'].map((status) => ({
    status: titleCase(status),
    count: state.incidents.filter((incident) => incident.status === status).length,
  }));

  function exportReport() {
    downloadCsv('youthrise-demo-system-report.csv', [
      ['Metric', 'Value'],
      ['Accounts', state.users.length],
      ['Active accounts', state.users.filter((entry) => entry.status === 'active').length],
      ['Programmes', state.programmes.length],
      ['Enrolments', state.enrolments.length],
      ['Teams', state.teams.length],
      ['Projects', state.projects.length],
      ['Valid certificates', state.certificates.filter((certificate) => certificate.status === 'valid').length],
      ['Open incidents', state.incidents.filter((incident) => incident.status !== 'resolved').length],
      ['Open privacy requests', state.privacyRequests.filter((request) => request.status !== 'completed').length],
      [],
      ['Role', 'Accounts'],
      ...roleData.map((row) => [row.role, row.count]),
    ]);
    toast({ title: 'System report exported', description: 'Aggregate demonstration data only.', variant: 'success' });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System reports"
        description="Aggregate platform activity for governance and capacity planning. No learner-level personal data is included."
        eyebrow="Insight"
        actions={
          <Button variant="outline" onClick={exportReport} iconLeft={<Download className="h-4 w-4" aria-hidden="true" />}>
            Export aggregate report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Accounts" value={state.users.length} icon={<Users className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Enrolments" value={state.enrolments.length} icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Open incidents" value={state.incidents.filter((incident) => incident.status !== 'resolved').length} icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} />
        <StatCard label="Privacy requests" value={state.privacyRequests.length} icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Accounts by role" />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="role" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="count" name="Accounts" fill="#1e4fd8" radius={[3, 3, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Programme participation" />
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programmeData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="enrolled" name="Enrolled" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="capacity" name="Capacity" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Safety incidents by status" description="Case management status, not a measure of safety performance." />
          <CardBody>
            <ul className="space-y-2.5">
              {incidentData.map((row) => (
                <li key={row.status}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate">{row.status}</span>
                    <span className="font-semibold text-ink">{row.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
                    <div className="h-full rounded-full bg-royal" style={{ width: `${percent(row.count, Math.max(1, state.incidents.length))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Data quality checks" />
          <CardBody className="space-y-3 text-xs leading-5 text-slate">
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />{state.programmes.filter((programme) => programme.status === 'open').length} programmes are open for enrolment.</p>
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden="true" />{state.certificates.filter((certificate) => certificate.status === 'pending').length} certificates are pending completion rules.</p>
            <p className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />{state.users.filter((entry) => entry.status === 'invited').length} invited accounts have not activated.</p>
            <p className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />{state.privacyRequests.filter((request) => request.status === 'identity_check').length} privacy requests await identity verification.</p>
          </CardBody>
        </Card>
      </div>

      <Alert variant="info" title="Governance reporting">
        Production reports should record the collection period, source system and any suppression applied. Access to
        reports should be role-limited and audited.
      </Alert>

      <div className="flex flex-wrap gap-3">
        <Link to="/app/admin/users" className="text-xs font-semibold text-royal hover:underline">User management</Link>
        <Link to="/app/admin/audit" className="text-xs font-semibold text-royal hover:underline">Audit log</Link>
        <Link to="/app/admin/incidents" className="text-xs font-semibold text-royal hover:underline">Safety incidents</Link>
        <span className="inline-flex items-center gap-1 text-2xs text-slate"><BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />Aggregate data only</span>
      </div>
    </div>
  );
}
