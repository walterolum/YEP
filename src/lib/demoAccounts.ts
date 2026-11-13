export const DEMO_PASSWORD = 'DemoPass123!';

export const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    name: 'Peter Ssemakula',
    email: 'admin@yep.demo',
    description: 'Administrator: Participant approval, programme lifecycle, governance & safety',
  },
  {
    role: 'participant',
    name: 'Amara Nakato',
    email: 'amara@yep.demo',
    description: 'Active Participant: Level 1 virtual exchange & Level 2 impact team',
  },
  {
    role: 'participant',
    name: 'Kato Joseph',
    email: 'kato@yep.demo',
    description: 'Pending Participant: Test "Account Pending Approval" workflow',
  },
  {
    role: 'participant',
    name: 'David Mukasa',
    email: 'david@yep.demo',
    description: 'Suspended Account: Test "Account Suspended" workflow',
  },
  {
    role: 'facilitator',
    name: 'Daniel Okello',
    email: 'daniel@yep.demo',
    description: 'Phase 2: Manages cohorts, content and team formation',
  },
  {
    role: 'mentor',
    name: 'Grace Mwangi',
    email: 'grace@yep.demo',
    description: 'Phase 2: Mentors community impact teams',
  },
  {
    role: 'university',
    name: 'Sarah Namusoke',
    email: 'sarah@yep.demo',
    description: 'Phase 2: Institutional nominations and cohort reporting',
  },
  {
    role: 'employer',
    name: 'Tom Achieng',
    email: 'tom@yep.demo',
    description: 'Phase 2: Talent showcase with participant consent',
  },
  {
    role: 'partner',
    name: 'Irene Kamau',
    email: 'irene@yep.demo',
    description: 'Phase 2: Programme support and aggregate impact reporting',
  },
] as const;
