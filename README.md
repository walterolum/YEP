# YEP — Youth Empowerment Project

A Youth Digital Empowerment and Virtual Exchange Platform for young people aged **18–35** in Uganda
and East Africa. YEP runs **Level One** virtual exchanges (digital literacy, AI, critical thinking,
media literacy, intercultural communication) and **Level Two** Impact Projects, where selected
participants form teams and deliver practical projects in employment, education, agriculture, health,
climate change and digital inclusion.

The product is called **YouthRise** in the interface; YEP is the programme it serves.

---

## 1. What the system does

| # | Capability | Where it lives |
|---|---|---|
| 1 | Registration, login, profile management with an 18–35 eligibility check | `backend/.../auth`, `backend/.../user`, `/login`, `/register`, `/app/profile` |
| 2 | Level One learning: modules, sessions, discussions, resources | `programme`, `exchange`, `discussion` packages, `/app/programmes`, `/app/sessions` |
| 3 | Team formation: participant selection, team creation, member roles | `project` package (`Team`, `TeamMember`), `/app/team`, `/app/facilitator/teams` |
| 4 | Project development: submission, milestones, mentor feedback | `project` package, `/app/project`, `/app/mentor/reviews` |
| 5 | Assessment: quizzes and written evaluations, scoring, feedback | `assessment` package, `/app/assessments` |
| 6 | Communication: announcements, discussions, team messaging, notifications | `announcement`, `discussion`, `notification` packages |
| 7 | Recognition: certificates and badges with a verification code | `assessment` (`Certificate`), `badge` package, `/app/certificates`, `/verify` |
| 8 | Role dashboards and administration | `admin`, `report` packages, `/app/admin/*` |

### Roles

| Role | Workspace | Can do |
|---|---|---|
| Participant | `/app` | Enrol, learn, join sessions and discussions, form a team, build a project, take assessments, earn certificates and badges |
| Facilitator | `/app/facilitator` | Design programmes, publish content, run cohorts and sessions, form teams, create and grade assessments, read reports |
| Mentor | `/app/mentor` | Review assigned teams, request revisions, record feedback and meetings |
| University / training partner | `/app/university` | Nominate learners, follow an institutional cohort, read outcome reports |
| Employer | `/app/employer` | Consent-based talent showcase, saved profiles, introduction requests |
| Partner organisation | `/app/partner` | Supported programmes, project showcase, aggregate impact reporting |
| Administrator | `/app/admin` | Users and roles, programmes, sessions, projects, certificates, announcements, incidents, privacy requests, audit log, reports |

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Language | **Java 21** |
| Backend | **Spring Boot 4.1.2** — Spring MVC, Spring Data JPA (Hibernate), Spring Security, Bean Validation, Flyway, spring-session-jdbc, springdoc, Actuator |
| Build | **Maven** (`backend/pom.xml`, Maven Wrapper `mvnw`) |
| Database | **MySQL 8** (MariaDB 10.11 also works with the `local` profile) |
| Frontend | React 19 + TypeScript + Vite 8, React Router 7, Tailwind CSS 3, React Hook Form + Zod, Recharts, lucide-react |
| Tests | JUnit 5 + AssertJ + Spring Boot Test (backend), Vitest + Testing Library (frontend) |

The backend is a **layered, object-oriented Java application**: `model/entity → repository (DAO) →
service → controller`. Controllers only translate HTTP; all rules live in services and entities.

---

## 3. Repository layout

```
backend/
  pom.xml                        Maven build
  src/main/java/com/youthrise/
    user/                        abstract User + Participant, Facilitator, Mentor, Administrator,
                                 University, Employer, Partner, Role, AccountStatus, EligibilityPolicy
    programme/                   programmes, modules, lessons, enrolments
    exchange/                    Level One sessions and registrations
    discussion/                  Level One discussion threads (NEW)
    announcement/                staff announcements (NEW)
    project/                     Team, TeamMember, Project, Milestone, Submission, MentorFeedback
    assessment/                  Assessment, quiz questions, attempts, certificates
    badge/                       badges and awards
    notification/                in-app notifications
    auth/                        registration, login, reset, e-mail verification, password change
    admin/                       users, incidents, privacy requests, audit
    partner/ employer/ report/   partner, employer and reporting portals
    common/                      BaseEntity, exceptions, audit, rate limiting, interfaces
    config/                      security, CORS, CSRF, session, OpenAPI
  src/main/resources/
    application.yml              runtime configuration (env-var driven)
    db/migration/                Flyway migrations V1..V11
    db/schema.sql                full schema generated from V1..V11 (import from scratch)
    db/seed.sql                  fictional sample data
src/                             React frontend (public site, auth, seven role workspaces)
docs/                            API contract, diagrams, pseudo-code, wireframes
CHANGELOG.md                     what was removed, added and changed
```

---

## 4. Setup

### 4.1 Requirements

- Java 21 (`java -version`)
- Node.js 20.19+ and npm 10+
- MySQL 8.0+ (or MariaDB 10.11+) on port 3306

### 4.2 Create the database

```sql
CREATE DATABASE yep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yep'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL PRIVILEGES ON yep.* TO 'yep'@'localhost';
FLUSH PRIVILEGES;
```

Two equivalent ways to create the tables:

**A. Import the generated schema (no application start needed)**

```bash
mysql -u root -p yep < backend/src/main/resources/db/schema.sql
mysql -u root -p yep < backend/src/main/resources/db/seed.sql   # optional sample data
```

**B. Let Flyway migrate on start** (recommended for development)

```bash
cd backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

Flyway applies `db/migration/V1..V11` automatically and Hibernate validates the result
(`ddl-auto: validate`) — the application refuses to start against a schema that does not match.

### 4.3 Configuration

No credential is committed. Everything is read from the environment:

| Variable | Default (development only) | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/youthrise?...` | JDBC URL (use database `yep` in production) |
| `DB_USERNAME` | `youthrise` | Database user |
| `DB_PASSWORD` | `youthrise_dev` | Database password — **always set in deployed environments** |
| `PORT` | `8080` | HTTP port |
| `COOKIE_SECURE` | `false` | Set `true` behind HTTPS |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend origin |
| `BCRYPT_STRENGTH` | `12` | Password hashing cost |
| `MAIL_MODE` | `log` | `log` prints verification codes to the console |
| `PUBLIC_APP_URL` | `http://localhost:5173` | Used in e-mail links |
| `UPLOAD_DIR` | `uploads` | Evidence storage directory |

Frontend (`frontend/.env.local`, copy `.env.example`):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | API base path (Vite proxies `/api` to `localhost:8080`) |
| `VITE_DEMO_MODE` | `true` | `true` serves the in-browser demo store; `false` sends requests to the API |

### 4.4 Run

```bash
# backend
cd backend && ./mvnw spring-boot:run

# frontend (second terminal, repository root)
npm install
npm run dev            # http://localhost:5173
```

Or use the single launcher: **`start.bat`** (Windows, starts both windows).

Optional demo seed profile: `SPRING_PROFILES_ACTIVE=local,demo` loads `db/demo/R__demo_seed.sql`
with fictional accounts (`@yep.demo`, password `DemoPass123!`).

---

## 5. Security and privacy

- **BCrypt** (cost 12) password hashing; passwords never leave the server in a response.
- **HttpOnly, SameSite** session cookie (`YOUTHRISE_SESSION`, 8-hour timeout), session-fixation
  protection, CSRF double-submit cookie plus `CsrfCookieFilter`.
- **Role-based access control** in `SecurityConfig` (`/api/admin/**`, `/api/facilitator/**`,
  `/api/mentor/**`, …) **and** again in services (`TeamService.canAccess`, `ReportingService` scope,
  `DiscussionService.requireMember`).
- **JPA parameter binding only** — no SQL string concatenation anywhere in the codebase.
- **Server-side validation** with Bean Validation on every request record, plus validation inside
  entities (e.g. `Announcement.publish`, `Certificate.issue`, `EligibilityPolicy`).
- **Rate limiting** on login, registration, reset, verification, certificate lookup and password
  change (`RateLimiter`).
- **Privacy**: minimal fields, consent records at registration, role-limited queries, small-cell
  suppression (<5 learners) in reports, audit log for privileged actions.
- **No credentials in source** — environment variables only.

---

## 6. Tests and checks

```bash
# backend compile + domain tests
cd backend && ./mvnw -o test -Dtest='RegistrationRulesTest,TeamFormationRulesTest,AssessmentScoringRulesTest,CertificateRulesTest,EligibilityPolicyTest'

# full backend suite (needs a reachable MySQL instance)
cd backend && ./mvnw test

# frontend
npm test          # Vitest: 43 tests
npm run build     # tsc -b && vite build
npm run lint      # oxlint
```

Domain test suites added for the four rules the brief names:

| Suite | Covers |
|---|---|
| `RegistrationRulesTest` | participant-only self-registration, e-mail normalisation, 18–35 boundary, invited accounts |
| `TeamFormationRulesTest` | capacity, duplicate membership, lead role, role change, removal |
| `AssessmentScoringRulesTest` | per-question scoring, one-correct-option invariant, auto-marking bounds, manual marking |
| `CertificateRulesTest` | issuance, validity, revocation, invalid input |
| `EligibilityPolicyTest` | 18th/36th birthday boundaries (pre-existing) |

---

## 7. Documentation

| Document | Contents |
|---|---|
| [`docs/api-contract.md`](docs/api-contract.md) | Every endpoint, payload, status code and authorisation rule |
| [`docs/architecture-diagrams.md`](docs/architecture-diagrams.md) | Mermaid: use case, class, ER and DFD (Level 0 and 1) |
| [`docs/pseudocode.md`](docs/pseudocode.md) | Pseudo-code for registration, team formation, assessment scoring, certificate generation |
| [`docs/wireframes.md`](docs/wireframes.md) | Wireframe descriptions for the major pages |
| [`CHANGELOG.md`](CHANGELOG.md) | What was removed, added and changed |

---

## 8. Known limitations

1. **Reads in the frontend demo store.** Mutations and authentication go through the typed service
   layer, but list screens read `src/lib/demoDb.ts` (browser `localStorage`) so the UI runs without a
   database. Switch `VITE_DEMO_MODE=false` to send writes to the API; migrating the list reads to the
   service layer is the remaining integration task.
2. **Demo accounts are fixtures**, not real people; the demo password is compared in memory.
3. **Evidence upload** stores metadata; production must stream to object storage with malware
   scanning.
4. **Rate limiting is in-process**; a multi-instance deployment needs a shared store (Redis).
5. **PDF certificates** are rendered by the browser print view, not generated server-side.
6. **English only**; no localisation yet.
7. **Lighthouse/axe and manual assistive-technology review** were not run in this environment; the UI
   targets WCAG 2.2 AA but conformance is not certified.
