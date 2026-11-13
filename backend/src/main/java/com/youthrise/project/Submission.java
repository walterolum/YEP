package com.youthrise.project;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "submissions")
public class Submission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "milestone_id", nullable = false)
    private Milestone milestone;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "stored_name", nullable = false, length = 255)
    private String storedName;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "note", length = 2000)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SubmissionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "score")
    private Integer score;

    /** Rubric weighting used by the mentor review screen. */
    @Column(name = "max_score", nullable = false)
    private int maxScore;

    @Column(name = "feedback", length = 2000)
    private String feedback;

    @Column(name = "revision_requested", length = 2000)
    private String revisionRequested;

    protected Submission() {
    }

    public static Submission create(Project project, Team team, Milestone milestone, String title,
                                    String fileName, String storedName, String contentType, long sizeBytes,
                                    String note, User submittedBy) {
        Submission submission = new Submission();
        submission.project = project;
        submission.team = team;
        submission.milestone = milestone;
        submission.title = title.trim();
        submission.fileName = fileName;
        submission.storedName = storedName;
        submission.contentType = contentType;
        submission.sizeBytes = sizeBytes;
        submission.note = note == null || note.isBlank() ? null : note.trim();
        submission.submittedBy = submittedBy;
        submission.submittedAt = Instant.now();
        submission.status = SubmissionStatus.SUBMITTED;
        submission.maxScore = 20;
        return submission;
    }

    public void review(User reviewer, SubmissionStatus outcome, Integer score, String feedback) {
        if (outcome != SubmissionStatus.APPROVED && outcome != SubmissionStatus.REVISION) {
            throw new IllegalArgumentException("A review must approve the work or request a revision");
        }
        if (score != null && (score < 0 || score > maxScore)) {
            throw new IllegalArgumentException("The score is outside the allowed range");
        }
        this.status = outcome;
        this.reviewer = reviewer;
        this.score = score;
        this.feedback = feedback;
        this.revisionRequested = outcome == SubmissionStatus.REVISION ? feedback : null;
    }

    public Project getProject() {
        return project;
    }

    public Team getTeam() {
        return team;
    }

    public Milestone getMilestone() {
        return milestone;
    }

    public String getTitle() {
        return title;
    }

    public String getFileName() {
        return fileName;
    }

    public String getStoredName() {
        return storedName;
    }

    public String getContentType() {
        return contentType;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public String getNote() {
        return note;
    }

    public User getSubmittedBy() {
        return submittedBy;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public User getReviewer() {
        return reviewer;
    }

    public Integer getScore() {
        return score;
    }

    public int getMaxScore() {
        return maxScore;
    }

    public String getFeedback() {
        return feedback;
    }

    public String getRevisionRequested() {
        return revisionRequested;
    }
}
