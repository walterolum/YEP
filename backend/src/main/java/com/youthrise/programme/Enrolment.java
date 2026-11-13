package com.youthrise.programme;

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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "enrolments", uniqueConstraints =
        @UniqueConstraint(name = "uk_enrolments_programme_user", columnNames = {"programme_id", "user_id"}))
public class Enrolment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private EnrolmentStatus status;

    @Column(name = "progress", nullable = false)
    private int progress;

    @Column(name = "last_lesson_id", length = 36)
    private String lastLessonId;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected Enrolment() {
    }

    public static Enrolment create(Programme programme, User user, EnrolmentStatus status) {
        Enrolment enrolment = new Enrolment();
        enrolment.programme = programme;
        enrolment.user = user;
        enrolment.status = status;
        enrolment.progress = 0;
        enrolment.enrolledAt = Instant.now();
        return enrolment;
    }

    public void updateProgress(int progress, String lastLessonId) {
        this.progress = Math.max(0, Math.min(100, progress));
        this.lastLessonId = lastLessonId;
        if (this.progress >= 100) {
            this.status = EnrolmentStatus.COMPLETED;
            if (this.completedAt == null) {
                this.completedAt = Instant.now();
            }
        } else if (this.status == EnrolmentStatus.COMPLETED) {
            this.status = EnrolmentStatus.ACTIVE;
            this.completedAt = null;
        }
    }

    public Programme getProgramme() {
        return programme;
    }

    public User getUser() {
        return user;
    }

    public EnrolmentStatus getStatus() {
        return status;
    }

    public int getProgress() {
        return progress;
    }

    public String getLastLessonId() {
        return lastLessonId;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
