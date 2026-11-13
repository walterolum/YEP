package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/** Attendance for one participant at one session. */
@Entity
@Table(name = "attendance", uniqueConstraints =
        @UniqueConstraint(name = "uk_attendance_session_user", columnNames = {"session_id", "user_id"}))
public class Attendance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private EventSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "present", nullable = false)
    private boolean present;

    protected Attendance() {
    }

    public Attendance(EventSession session, User user, boolean present) {
        this.session = session;
        this.user = user;
        this.present = present;
    }

    public void mark(boolean present) {
        this.present = present;
    }

    public EventSession getSession() {
        return session;
    }

    public User getUser() {
        return user;
    }

    public boolean isPresent() {
        return present;
    }
}
