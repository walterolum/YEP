package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A scheduled mentoring meeting. */
@Entity
@Table(name = "mentor_sessions")
public class MentorSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentorship_id", nullable = false)
    private Mentorship mentorship;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    protected MentorSession() {
    }

    public MentorSession(Mentorship mentorship, String title, Instant startsAt) {
        this.mentorship = mentorship;
        this.title = title;
        this.startsAt = startsAt;
        this.status = startsAt.isAfter(Instant.now()) ? "SCHEDULED" : "COMPLETED";
    }

    public Mentorship getMentorship() {
        return mentorship;
    }

    public String getTitle() {
        return title;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public String getStatus() {
        return status;
    }
}
