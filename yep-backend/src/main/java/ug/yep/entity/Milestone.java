package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A project milestone that a team ticks off. */
@Entity
@Table(name = "milestones")
public class Milestone extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected Milestone() {
    }

    public Milestone(Project project, String title, int sortOrder) {
        this.project = project;
        this.title = title;
        this.sortOrder = sortOrder;
    }

    public void toggle(boolean completed) {
        this.completed = completed;
        this.completedAt = completed ? Instant.now() : null;
    }

    public Project getProject() {
        return project;
    }

    public String getTitle() {
        return title;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isCompleted() {
        return completed;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
