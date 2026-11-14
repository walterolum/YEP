package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A learner's enrolment in one course. Idempotent per user/course pair. */
@Entity
@Table(name = "course_enrollments")
public class CourseEnrollment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.CourseEnrollmentStatus status;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    /** Where the learner stopped, so the player can offer "resume" on return. */
    @Column(name = "last_lesson_id")
    private Long lastLessonId;

    protected CourseEnrollment() {
    }

    public CourseEnrollment(User user, Course course) {
        this.user = user;
        this.course = course;
        this.status = Enums.CourseEnrollmentStatus.ENROLLED;
        this.enrolledAt = Instant.now();
    }

    public void complete() {
        if (status != Enums.CourseEnrollmentStatus.COMPLETED) {
            status = Enums.CourseEnrollmentStatus.COMPLETED;
            completedAt = Instant.now();
        }
    }

    public void withdraw() {
        if (status == Enums.CourseEnrollmentStatus.ENROLLED) {
            status = Enums.CourseEnrollmentStatus.WITHDRAWN;
        }
    }

    /** Reopening a lesson undoes course completion, so the badge never contradicts progress. */
    public void reopen() {
        if (status == Enums.CourseEnrollmentStatus.COMPLETED) {
            status = Enums.CourseEnrollmentStatus.ENROLLED;
            completedAt = null;
        }
    }

    public void resumeAt(Long lessonId) {
        if (lessonId != null) {
            this.lastLessonId = lessonId;
        }
    }

    public User getUser() {
        return user;
    }

    public Course getCourse() {
        return course;
    }

    public Enums.CourseEnrollmentStatus getStatus() {
        return status;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Long getLastLessonId() {
        return lastLessonId;
    }
}
