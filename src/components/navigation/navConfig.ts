import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Library,
  Megaphone,
  Network,
  Rocket,
  ScrollText,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  Video,
  Bookmark,
  Briefcase,
  Building2,
  Layers,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/**
 * One navigation entry per required capability, grouped by exchange level.
 * Profile, notifications and sign-out live in the top bar, so they are not
 * repeated here. Every destination below maps to a required capability.
 */
export const ROLE_NAV: Record<Role, NavGroup[]> = {
  participant: [
    {
      items: [{ label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Level One',
      items: [
        { label: 'Programmes', to: '/app/programmes', icon: BookOpen },
        { label: 'Exchange sessions', to: '/app/sessions', icon: Video },
        { label: 'Assessments', to: '/app/assessments', icon: ClipboardCheck },
      ],
    },
    {
      label: 'Level Two',
      items: [
        { label: 'My team', to: '/app/team', icon: Users },
        { label: 'Impact project', to: '/app/project', icon: Rocket },
      ],
    },
    {
      label: 'Recognition',
      items: [{ label: 'Certificates', to: '/app/certificates', icon: Award }],
    },
  ],
  facilitator: [
    {
      items: [{ label: 'Overview', to: '/app/facilitator', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Programme design',
      items: [
        { label: 'Programmes', to: '/app/facilitator/programmes', icon: GraduationCap },
        { label: 'Cohorts', to: '/app/facilitator/cohorts', icon: Users },
        { label: 'Learning content', to: '/app/facilitator/content', icon: Library },
      ],
    },
    {
      label: 'Delivery',
      items: [
        { label: 'Virtual sessions', to: '/app/facilitator/sessions', icon: CalendarDays },
        { label: 'Team formation', to: '/app/facilitator/teams', icon: Network },
        { label: 'Assessments', to: '/app/facilitator/assessments', icon: FileCheck2 },
      ],
    },
    {
      label: 'Insight',
      items: [{ label: 'Reports', to: '/app/facilitator/reports', icon: BarChart3 }],
    },
  ],
  mentor: [
    {
      items: [{ label: 'Overview', to: '/app/mentor', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Mentorship',
      items: [
        { label: 'Assigned teams', to: '/app/mentor/teams', icon: Users },
        { label: 'Project reviews', to: '/app/mentor/reviews', icon: FileCheck2 },
        { label: 'Meetings & feedback', to: '/app/mentor/meetings', icon: CalendarDays },
      ],
    },
  ],
  university: [
    {
      items: [{ label: 'Overview', to: '/app/university', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Institution',
      items: [
        { label: 'Nominations', to: '/app/university/nominations', icon: GraduationCap },
        { label: 'Cohort overview', to: '/app/university/cohort', icon: Users },
        { label: 'Outcome reports', to: '/app/university/reports', icon: BarChart3 },
      ],
    },
  ],
  employer: [
    {
      items: [{ label: 'Overview', to: '/app/employer', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Talent discovery',
      items: [
        { label: 'Talent showcase', to: '/app/employer/talent', icon: Search },
        { label: 'Saved profiles', to: '/app/employer/saved', icon: Bookmark },
      ],
    },
  ],
  partner: [
    {
      items: [{ label: 'Overview', to: '/app/partner', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'Programme support',
      items: [
        { label: 'Supported programmes', to: '/app/partner/programmes', icon: Handshake },
        { label: 'Project showcase', to: '/app/partner/showcase', icon: Layers },
        { label: 'Impact reports', to: '/app/partner/reports', icon: BarChart3 },
      ],
    },
  ],
  admin: [
    {
      items: [{ label: 'Dashboard', to: '/app/admin', icon: LayoutDashboard, end: true }],
    },
    {
      label: 'People',
      items: [
        { label: 'Participants & users', to: '/app/admin/users', icon: Users },
        { label: 'Roles & permissions', to: '/app/admin/roles', icon: UserCog },
      ],
    },
    {
      label: 'Programmes',
      items: [
        { label: 'Programmes', to: '/app/admin/programmes', icon: GraduationCap },
        { label: 'Sessions', to: '/app/admin/sessions', icon: CalendarDays },
        { label: 'Impact projects', to: '/app/admin/projects', icon: Rocket },
        { label: 'Certificates', to: '/app/admin/certificates', icon: Award },
      ],
    },
    {
      label: 'Communication',
      items: [{ label: 'Announcements', to: '/app/admin/communications', icon: Megaphone }],
    },
    {
      label: 'Governance',
      items: [
        { label: 'Safety incidents', to: '/app/admin/incidents', icon: AlertTriangle },
        { label: 'Privacy requests', to: '/app/admin/privacy', icon: ShieldCheck },
        { label: 'Audit log', to: '/app/admin/audit', icon: ScrollText },
      ],
    },
    {
      label: 'System',
      items: [{ label: 'Reports & analytics', to: '/app/admin/reports', icon: BarChart3 }],
    },
  ],
};

export const ROLE_ACCENT: Record<Role, { label: string; short: string }> = {
  participant: { label: 'Youth participant', short: 'Participant' },
  facilitator: { label: 'Facilitator workspace', short: 'Facilitator' },
  mentor: { label: 'Mentor workspace', short: 'Mentor' },
  university: { label: 'Institution workspace', short: 'Institution' },
  employer: { label: 'Employer workspace', short: 'Employer' },
  partner: { label: 'Partner workspace', short: 'Partner' },
  admin: { label: 'Administration', short: 'Admin' },
};

export const ROLE_ICONS: Record<Role, LucideIcon> = {
  participant: GraduationCap,
  facilitator: Layers,
  mentor: Handshake,
  university: Building2,
  employer: Briefcase,
  partner: Handshake,
  admin: ShieldCheck,
};
