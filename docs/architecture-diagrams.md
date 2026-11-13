# YEP architecture diagrams

All diagrams are Mermaid source. Paste into any Mermaid renderer (mermaid.live, GitHub, VS Code,
Notion) to export PNG/SVG/PDF.

---

## 1. UML use case diagram

```mermaid
flowchart LR
    Youth([Youth participant 18-35])
    Fac([Facilitator])
    Men([Mentor])
    Uni([University / training partner])
    Emp([Employer])
    Part([Partner organisation])
    Adm([Administrator])

    subgraph YEP[Youth Empowerment Project]
        UC1((Register and manage profile<br/>with 18-35 eligibility))
        UC2((Log in / reset password))
        UC3((Enrol in a programme))
        UC4((Follow Level One learning<br/>modules and lessons))
        UC5((Attend exchange sessions))
        UC6((Take part in discussions))
        UC7((Read announcements))
        UC8((Form and join a Level Two team))
        UC9((Submit Impact Project<br/>and evidence))
        UC10((Review project and<br/>give mentor feedback))
        UC11((Take assessments))
        UC12((Grade assessments))
        UC13((Receive certificate and badge))
        UC14((Verify a certificate<br/>publicly))
        UC15((Manage users and roles))
        UC16((Manage programmes, sessions<br/>and content))
        UC17((Publish announcements))
        UC18((View reports))
        UC19((Handle safety incidents<br/>and privacy requests))
        UC20((Nominate learners))
        UC21((Browse consent-based<br/>talent showcase))
    end

    Youth --> UC1
    Youth --> UC2
    Youth --> UC3
    Youth --> UC4
    Youth --> UC5
    Youth --> UC6
    Youth --> UC7
    Youth --> UC8
    Youth --> UC9
    Youth --> UC11
    Youth --> UC13

    Fac --> UC2
    Fac --> UC7
    Fac --> UC16
    Fac --> UC12
    Fac --> UC17
    Fac --> UC18
    Fac --> UC8

    Men --> UC2
    Men --> UC10
    Men --> UC18

    Uni --> UC2
    Uni --> UC20
    Uni --> UC18

    Emp --> UC2
    Emp --> UC21

    Part --> UC2
    Part --> UC18

    Adm --> UC2
    Adm --> UC15
    Adm --> UC16
    Adm --> UC17
    Adm --> UC18
    Adm --> UC19

    Anyone([Any visitor]) --> UC14
```

---

## 2. UML class diagram (domain model)

```mermaid
classDiagram
    class BaseEntity {
        -String id
        -Instant createdAt
        -Instant updatedAt
    }

    class Notifiable {
        <<interface>>
        +notificationAddress() String
        +notificationChannel() NotificationChannel
        +acceptsNotifications() boolean
    }

    class Assessable {
        <<interface>>
        +maxScore() int
        +awardedScore() Integer
        +isGraded() boolean
    }

    class User {
        <<abstract>>
        -String fullName
        -String email
        -String passwordHash
        -LocalDate dateOfBirth
        -AccountStatus status
        -Visibility visibility
        +register(...) User$
        +invited(...) User$
        +getRole()* Role
        +workspaceName()* String
        +canFacilitate()* boolean
        +canMentor()* boolean
        +canAdminister()* boolean
        +isEligibleForLevelTwo()* boolean
        +updateProfile(...)
        +changePassword(hash)
    }

    class Participant { +getRole() Role }
    class Facilitator { +canFacilitate() boolean }
    class Mentor { +canMentor() boolean }
    class Administrator { +canAdminister() boolean }
    class University
    class Employer
    class Partner

    class Programme {
        -String title
        -int level
        -ProgrammeStatus status
        -int capacity
        +create(...) Programme$
    }
    class LearningModule
    class Lesson
    class Enrolment

    class ExchangeSession
    class SessionRegistration

    class Discussion {
        -String title
        -boolean pinned
        -boolean locked
        +open(...) Discussion$
        +addMessage(author, body) DiscussionMessage
        +lock(boolean)
    }
    class DiscussionMessage

    class Announcement {
        -String title
        -String body
        -Role audienceRole
        +publish(...) Announcement$
        +isVisibleTo(role, programmeIds) boolean
    }

    class Team {
        -String name
        -int capacity
        +create(...) Team$
        +addMember(user, role) TeamMember
        +isLead(userId) boolean
    }
    class TeamMember {
        -TeamMemberRole role
    }
    class Project
    class Milestone
    class Submission
    class MentorFeedback

    class Assessment {
        -int maxScore
        -int maxAttempts
        +isOpenAt(now) boolean
        +addQuestion(question)
    }
    class AssessmentQuestion {
        -String prompt
        -int points
        +score(optionIndex) int
    }
    class AssessmentAttempt {
        +submit(...) AssessmentAttempt$
        +autoGraded(...) AssessmentAttempt$
        +grade(grader, score, feedback)
    }
    class Certificate {
        -String code
        -CertificateStatus status
        +issue(...) Certificate$
        +revoke(reason)
        +isValid() boolean
    }
    class Badge
    class UserBadge
    class Notification

    BaseEntity <|-- User
    BaseEntity <|-- Programme
    BaseEntity <|-- Team
    BaseEntity <|-- Assessment
    BaseEntity <|-- Certificate
    BaseEntity <|-- Discussion
    BaseEntity <|-- Announcement

    Notifiable <|.. User
    Assessable <|.. AssessmentAttempt

    User <|-- Participant
    User <|-- Facilitator
    User <|-- Mentor
    User <|-- Administrator
    User <|-- University
    User <|-- Employer
    User <|-- Partner

    Programme "1" o-- "*" LearningModule
    LearningModule "1" o-- "*" Lesson
    Programme "1" o-- "*" Enrolment
    Enrolment "*" --> "1" User
    Programme "1" o-- "*" ExchangeSession
    ExchangeSession "1" o-- "*" SessionRegistration

    Programme "1" o-- "*" Discussion
    Discussion "1" o-- "*" DiscussionMessage
    User "1" --> "*" Announcement

    Programme "1" o-- "*" Team
    Team "1" o-- "*" TeamMember
    TeamMember "*" --> "1" User
    Team "1" -- "1" Project
    Project "1" o-- "*" Milestone
    Milestone "1" o-- "*" Submission
    Team "1" o-- "*" MentorFeedback

    Programme "1" o-- "*" Assessment
    Assessment "1" o-- "*" AssessmentQuestion
    Assessment "1" o-- "*" AssessmentAttempt
    AssessmentAttempt "1" o-- "*" AssessmentAttemptAnswer
    User "1" --> "*" Certificate
    Certificate "*" --> "1" Programme
    User "1" --> "*" UserBadge
    UserBadge "*" --> "1" Badge
    User "1" --> "*" Notification
```

---

## 3. ER diagram (core tables)

```mermaid
erDiagram
    USERS ||--o{ USER_INTERESTS : has
    USERS ||--o{ USER_SKILLS : has
    USERS ||--o{ CONSENTS : grants
    USERS ||--o{ AUTH_TOKENS : owns
    USERS ||--o{ ENROLMENTS : enrols
    USERS ||--o{ SESSION_REGISTRATIONS : registers
    USERS ||--o{ TEAM_MEMBERS : joins
    USERS ||--o{ ASSESSMENT_ATTEMPTS : submits
    USERS ||--o{ CERTIFICATES : earns
    USERS ||--o{ USER_BADGES : receives
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ ANNOUNCEMENTS : authors
    USERS ||--o{ DISCUSSION_MESSAGES : writes

    PROGRAMMES ||--o{ LEARNING_MODULES : contains
    LEARNING_MODULES ||--o{ LESSONS : contains
    PROGRAMMES ||--o{ ENROLMENTS : offers
    PROGRAMMES ||--o{ EXCHANGE_SESSIONS : schedules
    EXCHANGE_SESSIONS ||--o{ SESSION_REGISTRATIONS : receives
    PROGRAMMES ||--o{ DISCUSSIONS : hosts
    DISCUSSIONS ||--o{ DISCUSSION_MESSAGES : contains
    PROGRAMMES ||--o{ TEAMS : groups
    PROGRAMMES ||--o{ ASSESSMENTS : assesses
    PROGRAMMES ||--o{ CERTIFICATES : certifies
    PROGRAMMES ||--o{ ANNOUNCEMENTS : targets

    TEAMS ||--o{ TEAM_MEMBERS : has
    TEAMS ||--o{ TEAM_MESSAGES : contains
    TEAMS ||--|| PROJECTS : owns
    PROJECTS ||--o{ MILESTONES : plans
    PROJECTS ||--o{ PROJECT_RESOURCES : stores
    MILESTONES ||--o{ SUBMISSIONS : receives
    TEAMS ||--o{ MENTOR_FEEDBACK : receives

    ASSESSMENTS ||--o{ ASSESSMENT_QUESTIONS : contains
    ASSESSMENT_QUESTIONS ||--o{ ASSESSMENT_QUESTION_OPTIONS : offers
    ASSESSMENTS ||--o{ ASSESSMENT_ATTEMPTS : records
    ASSESSMENT_ATTEMPTS ||--o{ ASSESSMENT_ATTEMPT_ANSWERS : captures

    BADGES ||--o{ USER_BADGES : awarded_as

    USERS {
        char id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar role
        varchar status
        date date_of_birth
        datetime joined_at
    }
    PROGRAMMES {
        char id PK
        varchar title
        int level
        varchar status
        int capacity
        char facilitator_id FK
    }
    TEAMS {
        char id PK
        char programme_id FK
        varchar name UK
        char mentor_id FK
        int capacity
    }
    TEAM_MEMBERS {
        char team_id PK
        char user_id PK
        varchar role
    }
    PROJECTS {
        char id PK
        char team_id FK
        varchar title
        varchar status
    }
    ASSESSMENTS {
        char id PK
        char programme_id FK
        varchar type
        int max_score
        int max_attempts
        datetime due_at
    }
    ASSESSMENT_ATTEMPTS {
        char id PK
        char assessment_id FK
        char user_id FK
        int attempt_no
        varchar status
        int score
    }
    CERTIFICATES {
        char id PK
        char programme_id FK
        char participant_id FK
        varchar code UK
        varchar status
        datetime issued_at
    }
    ANNOUNCEMENTS {
        char id PK
        char author_id FK
        char programme_id FK
        varchar audience_role
        varchar title
        datetime published_at
    }
    DISCUSSIONS {
        char id PK
        char programme_id FK
        char author_id FK
        varchar title
        boolean locked
    }
```

---

## 4. Data Flow Diagram — Level 0 (context)

```mermaid
flowchart LR
    P1([Participant])
    P2([Facilitator / Mentor])
    P3([Partner / University / Employer])
    P4([Administrator])

    S((YEP Platform))

    P1 -- "registration, profile, enrolments,\nanswers, evidence, messages" --> S
    S -- "learning content, scores,\ncertificates, feedback, notices" --> P1

    P2 -- "programme and content design,\ngrades, feedback, team changes" --> S
    S -- "cohort progress, submissions,\nreports" --> P2

    P3 -- "nominations, briefing and\nintroduction requests" --> S
    S -- "cohort and impact reports,\nconsented talent profiles" --> P3

    P4 -- "user, role, content and\ncase decisions" --> S
    S -- "audit log, incidents, privacy\nrequests, system summaries" --> P4
```

---

## 5. Data Flow Diagram — Level 1

```mermaid
flowchart TB
    U([Signed-in user])
    V([Visitor])

    P1[1.0 Authenticate and<br/>manage identity]
    P2[2.0 Deliver Level One<br/>learning and exchange]
    P3[3.0 Form teams and<br/>run Impact Projects]
    P4[4.0 Assess learning<br/>and issue recognition]
    P5[5.0 Communicate]
    P6[6.0 Administer and<br/>report]

    D1[(users, consents,<br/>auth_tokens)]
    D2[(programmes, modules,<br/>lessons, enrolments,<br/>sessions, discussions)]
    D3[(teams, team_members,<br/>projects, milestones,<br/>submissions, feedback)]
    D4[(assessments, questions,<br/>attempts, certificates,<br/>badges)]
    D5[(announcements,<br/>notifications,<br/>team_messages)]
    D6[(audit_logs, incidents,<br/>privacy_requests,<br/>nominations)]

    V -->|"credential check, eligibility"| P1
    P1 -->|"session cookie"| U
    P1 <--> D1

    U -->|"enrol, complete lesson,<br/>register for session, post reply"| P2
    P2 -->|"content, progress"| U
    P2 <--> D2

    U -->|"create team, add member,<br/>submit evidence"| P3
    P3 -->|"milestone status, mentor feedback"| U
    P3 <--> D3
    P3 <--> D2

    U -->|"quiz answers, written work"| P4
    P4 -->|"scores, feedback, certificate, badge"| U
    P4 <--> D4
    P4 -->|"pass result"| P3

    U -->|"message, reply"| P5
    P5 -->|"announcement, notification"| U
    P5 <--> D5

    P6 <--> D6
    P6 <--> D1
    P6 -->|"reports"| U
    P4 -->|"completion facts"| P6
```

---

## 6. Request flow (layered architecture)

```mermaid
flowchart LR
    A[HTTP request] --> B[Spring Security<br/>session + CSRF + role matcher]
    B --> C[Controller<br/>HTTP translation only]
    C --> D[Service<br/>business rules + authorisation]
    D --> E[Entity<br/>validation + state changes]
    E --> F[Repository<br/>parameterised JPA queries]
    F --> G[(MySQL)]
    D --> H[AuditService]
    D --> I[NotificationService]
```
