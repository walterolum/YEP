export type Role =
  | 'participant'
  | 'facilitator'
  | 'mentor'
  | 'university'
  | 'employer'
  | 'partner'
  | 'admin';

export const ROLE_LABELS: Record<Role, string> = {
  participant: 'Youth participant',
  facilitator: 'Facilitator',
  mentor: 'Mentor',
  university: 'University / training partner',
  employer: 'Employer',
  partner: 'Partner organization',
  admin: 'Administrator',
};

export const ROLE_HOME: Record<Role, string> = {
  participant: '/app',
  facilitator: '/app/facilitator',
  mentor: '/app/mentor',
  university: '/app/university',
  employer: '/app/employer',
  partner: '/app/partner',
  admin: '/app/admin',
};

export type AccountStatus = 'active' | 'pending' | 'suspended' | 'invited' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: string;
  dateOfBirth?: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  bio?: string;
  initials: string;
  joinedAt: string;
  status: AccountStatus;
  profileComplete: number;
  timezone: string;
  interests: string[];
  skills: string[];
  visibility: 'public' | 'limited' | 'hidden';
  contactPermission: boolean;
}

export interface AuthSession {
  user: User;
  issuedAt: number;
  expiresAt: number;
  demo: boolean;
}

export type ProgrammeLevel = 1 | 2;
export type ProgrammeStatus = 'open' | 'waitlist' | 'closed' | 'draft';

export interface Programme {
  id: string;
  title: string;
  summary: string;
  description: string;
  level: ProgrammeLevel;
  theme: string;
  durationWeeks: number;
  commitment: string;
  mode: string;
  eligibility: string[];
  outcomes: string[];
  skills: string[];
  moduleCount: number;
  enrolledCount: number;
  capacity: number;
  status: ProgrammeStatus;
  startsAt: string;
  endsAt: string;
  facilitatorId: string;
  cohort: string;
}

export type LessonType = 'reading' | 'video' | 'activity' | 'quiz';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  durationMins: number;
  summary: string;
  body: string[];
  resource?: { label: string; size: string };
}

export interface LearningModule {
  id: string;
  programmeId: string;
  title: string;
  summary: string;
  order: number;
  status: ContentStatus;
  durationMins: number;
  lessons: Lesson[];
}

export type EnrolmentStatus = 'active' | 'completed' | 'withdrawn' | 'waitlisted';

export interface Enrolment {
  id: string;
  programmeId: string;
  userId: string;
  status: EnrolmentStatus;
  progress: number;
  lastLessonId?: string;
  enrolledAt: string;
}

export type SessionStatus = 'upcoming' | 'completed' | 'cancelled';

export interface ExchangeSession {
  id: string;
  title: string;
  programmeId: string;
  startsAt: string;
  durationMins: number;
  timezone: string;
  facilitatorId: string;
  capacity: number;
  registeredCount: number;
  description: string;
  meetingUrl?: string;
  status: SessionStatus;
  materials?: { label: string; kind: 'slides' | 'transcript' | 'recording' }[];
  attendees?: string[];
}

export type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'revision'
  | 'approved';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  status: MilestoneStatus;
  evidence?: string;
  feedback?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  teamId: string;
  title: string;
  problem: string;
  theme: string;
  summary: string;
  objectives: string[];
  status: 'draft' | 'active' | 'under_review' | 'completed';
  milestones: Milestone[];
  resources: { label: string; kind: string; addedBy: string; date: string }[];
}

export interface TeamMessage {
  id: string;
  authorId: string;
  body: string;
  sentAt: string;
}

export type TeamMemberRole = 'lead' | 'member' | 'support';

export interface TeamMember {
  userId: string;
  fullName: string;
  role: TeamMemberRole;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  theme: string;
  programmeId: string;
  mentorId: string;
  memberIds: string[];
  /** Role-carrying memberships; absent on older demo records. */
  members?: TeamMember[];
  projectId: string;
  capacity: number;
  createdAt: string;
  messages: TeamMessage[];
}

export interface Submission {
  id: string;
  projectId: string;
  teamId: string;
  milestoneId: string;
  title: string;
  fileName: string;
  note: string;
  submittedAt: string;
  submittedBy?: string;
  status: 'submitted' | 'under_review' | 'revision' | 'approved';
  reviewerId?: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
  revisionRequested?: string;
}

export interface AssessmentCriterion {
  id: string;
  label: string;
  description: string;
  maxScore: number;
}

export interface Assessment {
  id: string;
  title: string;
  programmeId: string;
  type: 'quiz' | 'reflection' | 'project' | 'final';
  description: string;
  instructions: string[];
  dueAt: string;
  maxScore: number;
  status: 'available' | 'submitted' | 'graded' | 'locked' | 'reopened';
  submittedAt?: string;
  score?: number;
  feedback?: string;
  criteria: AssessmentCriterion[];
  attemptAllowed: boolean;
}

export interface Certificate {
  id: string;
  programmeTitle: string;
  level: ProgrammeLevel;
  participantName: string;
  participantId: string;
  issueDate?: string;
  code: string;
  status: 'pending' | 'valid' | 'revoked';
  verificationNote: string;
  programmeId: string;
}

/** A recognition award, marked with whether the signed-in account earned it. */
export interface BadgeAward {
  code: string;
  name: string;
  description: string;
  criteria: string;
  earned: boolean;
  awardedAt: string | null;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
  kind: 'announcement' | 'feedback' | 'session' | 'system' | 'approval';
}

export interface MentorFeedback {
  id: string;
  teamId: string;
  authorId: string;
  milestoneId?: string;
  body: string;
  createdAt: string;
  resolved: boolean;
}

export interface Nomination {
  id: string;
  institution: string;
  learnerName: string;
  learnerEmail: string;
  programmeId: string;
  nominatedAt: string;
  status: 'nominated' | 'invited' | 'registered' | 'accepted' | 'declined';
  note?: string;
}

export interface TalentProfile {
  userId: string;
  headline: string;
  country: string;
  skills: string[];
  projectSummary: string;
  certificateStatus: 'verified' | 'pending' | 'none';
  certificateCode?: string;
  availability: 'open' | 'not_looking' | 'undisclosed';
  visibility: 'public' | 'limited' | 'hidden';
  contactPermission: boolean;
  portfolioItems: { title: string; theme: string; summary: string }[];
}

export type IncidentStatus = 'reported' | 'triaged' | 'investigating' | 'resolved' | 'escalated';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  reference: string;
  category: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  reportedBy: string;
  assignedTo?: string;
  summary: string;
  notes: { author: string; body: string; at: string }[];
  actions: { action: string; actor: string; at: string }[];
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: Role;
  action: string;
  target: string;
  outcome: 'success' | 'denied' | 'failed';
  metadata: string;
}

export interface PrivacyRequest {
  id: string;
  reference: string;
  requester: string;
  type: 'access' | 'correction' | 'deletion' | 'restriction';
  receivedAt: string;
  status: 'received' | 'identity_check' | 'in_progress' | 'completed' | 'rejected';
  assignee?: string;
  note: string;
}

export interface CohortMember {
  userId: string;
  enrolmentId: string;
  programmeId: string;
  progress: number;
  attendance: number;
  completion: 'on_track' | 'at_risk' | 'completed' | 'not_started';
  enrolledAt: string;
}

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'participant' | 'admin';
  programmeId?: string;
  priority: 'normal' | 'important' | 'critical';
  publishedAt: string;
  authorName: string;
}

export interface DiscussionMessage {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  message: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  programmeId: string;
  moduleId?: string;
  title: string;
  topic: string;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  messages: DiscussionMessage[];
}

export interface Assignment {
  id: string;
  programmeId: string;
  moduleId?: string;
  title: string;
  description: string;
  instructions: string;
  maxPoints: number;
  dueAt: string;
  status: 'published' | 'draft';
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionText: string;
  attachmentUrl?: string;
  status: 'submitted' | 'under_review' | 'graded';
  pointsAwarded?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  submittedAt: string;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'open_text' | 'boolean';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  joinedAt?: string;
  durationMins: number;
  notes?: string;
}

export interface ParticipantProfile {
  id: string;
  userId: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  institution?: string;
  dateOfBirth?: string;
  gender?: string;
  district?: string;
  disabilityStatus?: string;
  employmentStatus?: string;
  nationalId?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  emergencyContact?: string;
}
