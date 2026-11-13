package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/** A mentorship relationship requested by a participant. */
@Entity
@Table(name = "mentorships", uniqueConstraints =
        @UniqueConstraint(name = "uk_mentorships_pair", columnNames = {"mentor_id", "mentee_id"}))
public class Mentorship extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @Column(name = "goal", length = 500)
    private String goal;

    @Column(name = "progress_percent", nullable = false)
    private int progressPercent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.MentorshipStatus status;

    @Column(name = "request_note", length = 1000)
    private String requestNote;

    protected Mentorship() {
    }

    public Mentorship(User mentor, User mentee, String goal, String requestNote) {
        this.mentor = mentor;
        this.mentee = mentee;
        this.goal = goal;
        this.requestNote = requestNote;
        this.status = Enums.MentorshipStatus.REQUESTED;
    }

    public void decide(Enums.MentorshipStatus status) {
        this.status = status;
    }

    public void updateProgress(int progressPercent) {
        this.progressPercent = Math.max(0, Math.min(100, progressPercent));
    }

    public User getMentor() {
        return mentor;
    }

    public User getMentee() {
        return mentee;
    }

    public String getGoal() {
        return goal;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public Enums.MentorshipStatus getStatus() {
        return status;
    }

    public String getRequestNote() {
        return requestNote;
    }
}
