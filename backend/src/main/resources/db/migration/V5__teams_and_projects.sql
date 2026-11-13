-- Teams, projects, milestones, evidence submissions and mentor feedback.

CREATE TABLE teams (
    id           CHAR(36)     NOT NULL,
    programme_id CHAR(36)     NOT NULL,
    name         VARCHAR(120) NOT NULL,
    theme        VARCHAR(80)  NOT NULL,
    mentor_id    CHAR(36)     NULL,
    capacity     INT          NOT NULL DEFAULT 6,
    created_at   DATETIME(6)  NOT NULL,
    updated_at   DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_teams_programme_name (programme_id, name),
    KEY idx_teams_mentor (mentor_id),
    CONSTRAINT fk_teams_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_teams_mentor FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE team_members (
    team_id   CHAR(36) NOT NULL,
    user_id   CHAR(36) NOT NULL,
    PRIMARY KEY (team_id, user_id),
    KEY idx_team_members_user (user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE team_messages (
    id         CHAR(36)     NOT NULL,
    team_id    CHAR(36)     NOT NULL,
    author_id  CHAR(36)     NOT NULL,
    body       VARCHAR(2000) NOT NULL,
    sent_at    DATETIME(6)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_team_messages_team (team_id, sent_at),
    CONSTRAINT fk_team_messages_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_messages_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE projects (
    id         CHAR(36)     NOT NULL,
    team_id    CHAR(36)     NOT NULL,
    title      VARCHAR(160) NOT NULL,
    problem    VARCHAR(500) NOT NULL,
    theme      VARCHAR(80)  NOT NULL,
    summary    VARCHAR(1000) NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_projects_team (team_id),
    CONSTRAINT fk_projects_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_objectives (
    project_id CHAR(36)     NOT NULL,
    position   INT          NOT NULL,
    value      VARCHAR(500) NOT NULL,
    PRIMARY KEY (project_id, position),
    CONSTRAINT fk_project_objectives FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE milestones (
    id          CHAR(36)     NOT NULL,
    project_id  CHAR(36)     NOT NULL,
    title       VARCHAR(160) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    due_at      DATETIME(6)  NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    evidence    VARCHAR(200) NULL,
    feedback    VARCHAR(2000) NULL,
    position    INT          NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_milestones_project (project_id, position),
    CONSTRAINT fk_milestones_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_resources (
    id         CHAR(36)     NOT NULL,
    project_id CHAR(36)     NOT NULL,
    label      VARCHAR(200) NOT NULL,
    kind       VARCHAR(40)  NOT NULL,
    added_by   VARCHAR(160) NOT NULL,
    added_at   DATETIME(6)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_project_resources_project (project_id, added_at),
    CONSTRAINT fk_project_resources_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE submissions (
    id                 CHAR(36)      NOT NULL,
    project_id         CHAR(36)      NOT NULL,
    team_id            CHAR(36)      NOT NULL,
    milestone_id       CHAR(36)      NOT NULL,
    title              VARCHAR(160)  NOT NULL,
    file_name          VARCHAR(255)  NOT NULL,
    stored_name        VARCHAR(255)  NOT NULL,
    content_type       VARCHAR(120)  NULL,
    size_bytes         BIGINT        NOT NULL,
    note               VARCHAR(2000) NULL,
    submitted_by       CHAR(36)      NOT NULL,
    submitted_at       DATETIME(6)   NOT NULL,
    status             VARCHAR(20)   NOT NULL,
    reviewer_id        CHAR(36)      NULL,
    score              INT           NULL,
    max_score          INT           NOT NULL DEFAULT 20,
    feedback           VARCHAR(2000) NULL,
    revision_requested VARCHAR(2000) NULL,
    created_at         DATETIME(6)   NOT NULL,
    updated_at         DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_submissions_team (team_id, submitted_at),
    KEY idx_submissions_milestone (milestone_id),
    CONSTRAINT fk_submissions_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_milestone FOREIGN KEY (milestone_id) REFERENCES milestones (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_author FOREIGN KEY (submitted_by) REFERENCES users (id),
    CONSTRAINT fk_submissions_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE mentor_feedback (
    id           CHAR(36)      NOT NULL,
    team_id      CHAR(36)      NOT NULL,
    author_id    CHAR(36)      NOT NULL,
    milestone_id CHAR(36)      NULL,
    body         VARCHAR(2000) NOT NULL,
    resolved     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_mentor_feedback_team (team_id, created_at),
    CONSTRAINT fk_mentor_feedback_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_feedback_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_feedback_milestone FOREIGN KEY (milestone_id) REFERENCES milestones (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
