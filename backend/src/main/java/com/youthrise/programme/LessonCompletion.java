package com.youthrise.programme;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "lesson_completions", uniqueConstraints =
        @UniqueConstraint(name = "uk_completions_user_lesson", columnNames = {"user_id", "lesson_id"}))
public class LessonCompletion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    protected LessonCompletion() {
    }

    public static LessonCompletion record(User user, Lesson lesson, Programme programme) {
        LessonCompletion completion = new LessonCompletion();
        completion.user = user;
        completion.lesson = lesson;
        completion.programme = programme;
        completion.completedAt = Instant.now();
        return completion;
    }

    public User getUser() {
        return user;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public Programme getProgramme() {
        return programme;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
