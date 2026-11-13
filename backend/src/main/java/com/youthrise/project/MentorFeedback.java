package com.youthrise.project;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "mentor_feedback")
public class MentorFeedback extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;

    @Column(name = "body", nullable = false, length = 2000)
    private String body;

    @Column(name = "resolved", nullable = false)
    private boolean resolved;

    protected MentorFeedback() {
    }

    public static MentorFeedback create(Team team, User author, Milestone milestone, String body) {
        MentorFeedback feedback = new MentorFeedback();
        feedback.team = team;
        feedback.author = author;
        feedback.milestone = milestone;
        feedback.body = body.trim();
        return feedback;
    }

    public void markResolved() {
        this.resolved = true;
    }

    public Team getTeam() {
        return team;
    }

    public User getAuthor() {
        return author;
    }

    public Milestone getMilestone() {
        return milestone;
    }

    public String getBody() {
        return body;
    }

    public boolean isResolved() {
        return resolved;
    }
}
