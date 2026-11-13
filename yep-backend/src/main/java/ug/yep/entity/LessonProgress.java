package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/** A single lesson completion. The unique key prevents double counting. */
@Entity
@Table(name = "lesson_progress", uniqueConstraints =
        @UniqueConstraint(name = "uk_lesson_progress_user_lesson", columnNames = {"user_id", "lesson_id"}))
public class LessonProgress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    protected LessonProgress() {
    }

    public LessonProgress(User user, Lesson lesson) {
        this.user = user;
        this.lesson = lesson;
        this.completedAt = Instant.now();
    }

    public User getUser() {
        return user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
