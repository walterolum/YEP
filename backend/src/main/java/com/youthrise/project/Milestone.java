package com.youthrise.project;

import com.youthrise.common.BaseEntity;
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
@Table(name = "milestones")
public class Milestone extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MilestoneStatus status;

    @Column(name = "evidence", length = 200)
    private String evidence;

    @Column(name = "feedback", length = 2000)
    private String feedback;

    @Column(name = "position", nullable = false)
    private int position;

    protected Milestone() {
    }

    public static Milestone create(Project project, String title, String description, Instant dueAt, int position) {
        Milestone milestone = new Milestone();
        milestone.project = project;
        milestone.title = title.trim();
        milestone.description = description.trim();
        milestone.dueAt = dueAt;
        milestone.position = position;
        milestone.status = MilestoneStatus.NOT_STARTED;
        return milestone;
    }

    /** Participants can only begin work; submission and approval follow server-side workflows. */
    public void startWork() {
        if (status == MilestoneStatus.SUBMITTED || status == MilestoneStatus.UNDER_REVIEW
                || status == MilestoneStatus.APPROVED) {
            throw new IllegalStateException("This milestone is already under review or approved");
        }
        this.status = MilestoneStatus.IN_PROGRESS;
    }

    public void markSubmitted(String evidenceFileName) {
        this.status = MilestoneStatus.SUBMITTED;
        this.evidence = evidenceFileName;
        this.feedback = null;
    }

    public void markUnderReview() {
        this.status = MilestoneStatus.UNDER_REVIEW;
    }

    public void approve(String reviewerFeedback) {
        this.status = MilestoneStatus.APPROVED;
        this.feedback = reviewerFeedback;
    }

    public void requestRevision(String reviewerFeedback) {
        this.status = MilestoneStatus.REVISION;
        this.feedback = reviewerFeedback;
    }

    public Project getProject() {
        return project;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public MilestoneStatus getStatus() {
        return status;
    }

    public String getEvidence() {
        return evidence;
    }

    public String getFeedback() {
        return feedback;
    }

    public int getPosition() {
        return position;
    }
}
