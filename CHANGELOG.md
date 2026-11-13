# Changelog

All work in this pass is incremental and reversible; no feature outside the required capability list
was added. Database migrations are additive only (V11), so existing data is preserved.

---

## Removed

| Item | Reason |
|---|---|
| `YEP.zip` (65 MB) and `YouthRise_Premium_Login_Updated.zip` | Duplicate project/design archives at the repository root |
| `dist/`, `backend/target/`, empty `backend/uploads/` | Generated build output, not source |
| `launch.bat`, `start-youthrise.bat`, `start-youthrise.ps1` | Four overlapping launchers; `start.bat` is now the single portable one (the old one hard-coded `D:\capstone\YEP`) |
| `backend/HELP.md` | Spring Initializr boilerplate |
| `backend/src/main/resources/application.properties` | Duplicated `spring.application.name` and conflicted with `application.yml` |
| Participant routes `/app/exchange`, `/app/messages`, `/app/community`, `/app/calendar`, `/app/quizzes` (`ParticipantExtraPages.tsx`) | Duplicated sessions, team messaging and assessments; none appeared in navigation |
| Admin routes `/app/admin/level-one`, `/app/admin/level-two`, `/app/admin/settings` | Re-rendered views already available under Programmes/Sessions; settings had no capability or API |
| Duplicate public route `/verify-certificate` | `/verify` is the single verification URL used by every link |
| "Upgrade to Premium" sidebar promotion | Off-scope monetisation with no product feature behind it |
| `ReportingService.PENDING_REVIEW_SENTINEL` | Unused private field (dead code) |
| Profile and notification links from the sidebar | Duplicated in the top bar; navigation is now one entry per capability |

---

## Added

### Backend

| Addition | Capability |
|---|---|
| `announcement` package: `Announcement`, repository, `AnnouncementService`, `AnnouncementController` | #6 Communication — staff broadcasts scoped to a role or a programme |
| `discussion` package: `Discussion`, `DiscussionMessage`, repositories, service, controller | #6 Communication — Level One discussion threads with membership checks, pin/lock moderation |
| `AssessmentQuestion`, `AssessmentAttemptAnswer` + repositories | #5 Assessment — multiple-choice question bank and per-question answers |
| `POST /api/assessments/{id}/quiz-attempts`, `GET /api/assessments/{id}/questions`, `POST /api/assessments` | Quiz delivery, automatic scoring and assessment creation |
| `GET /api/admin/users?q=` | #8 Administration — searchable user directory |
| `POST /api/auth/password-change` | #1 Profile management — authenticated password change with session invalidation |
| `GET /api/facilitator/programmes/{id}/unassigned-participants`, `POST /api/teams/{id}/members/bulk` | #3 Team formation — participant selection and bulk assignment |
| Migration `V11__communication_and_quizzes.sql` | Tables for the above, with foreign keys, unique keys and indexes |
| `db/schema.sql` (1,087 lines, 11 migrations combined) | Create the whole database from scratch without starting the application |
| `db/seed.sql` | Fictional sample data for demonstrations |
| `start.bat` (rewritten) | One portable launcher for both services |

### Tests

| Suite | Covers |
|---|---|
| `RegistrationRulesTest` | participant-only self-registration, e-mail normalisation, invited accounts, profile completion |
| `TeamFormationRulesTest` | capacity, duplicate membership, lead identification, role change, removal |
| `AssessmentScoringRulesTest` | question scoring, one-correct-option invariant, auto-marking bounds, manual marking |
| `CertificateRulesTest` | issuance, validity, revocation, invalid input |

### Documentation

`docs/architecture-diagrams.md` (use case, class, ER, DFD 0/1, request flow), `docs/pseudocode.md`,
`docs/wireframes.md`, this changelog, and a rewritten `README.md` covering setup, database import and
verification.

---

## Changed

| Area | Change |
|---|---|
| Navigation | Participant 13 → 7 entries; facilitator, mentor, university, employer and partner trimmed to capability-only items; admin regrouped to 6 groups |
| `Certificate` | `issue()` now validates programme, participant and code; added `isValid()` |
| `Assessment` | Owns its question bank (`addQuestion`, `getQuestions`) |
| `AssessmentAttempt` | Added `autoGraded(...)` factory that applies the same score bounds as manual marking |
| `TeamService` | Added `addMembers` (all checks before the first write) and `unassignedParticipants` |
| `UserRepository` | Added `searchDirectory(term)` for the admin console |
| `TeamRepository` | Added `findByProgrammeId` |
| `AdminService` / `AdminController` | User directory endpoint |
| `AuthService` / `AuthController` | Password change with rate limiting, audit and session invalidation |
| `KeyServicesTest` | Fixed a stale `AddTeamMemberRequest` call that stopped the test sources compiling |
| Frontend build | Fixed `TS6133` unused-variable errors that failed `npm run build` |
| Sidebar | Premium promotion replaced with the programme mission card |
| README | Rewritten for the full stack (Java + MySQL + React), including env vars and import steps |

---

## Deliberately not done

- **The frontend still reads its list data from the in-browser demo store.** Removing it would leave
  the UI empty without a running MySQL instance, so it remains as an explicitly labelled offline demo.
  `VITE_DEMO_MODE=false` sends authentication and every mutation to the API; migrating the list reads
  to the service layer is the remaining integration task and is documented in the README and
  `docs/api-contract.md`.
- **No LM/AI feature** was added, so no AI disclosure flow was introduced; the responsible-AI page
  continues to describe policy only.
- **Lighthouse and axe audits were not run** in this environment (no browser audit tooling
  available); the README states that accessibility conformance is designed for but not certified.
- **PDF certificate export** remains the browser print view.
