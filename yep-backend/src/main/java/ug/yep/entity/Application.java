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

/** A participant's application to a programme (one per participant per programme). */
@Entity
@Table(name = "applications", uniqueConstraints =
        @UniqueConstraint(name = "uk_applications_programme_user", columnNames = {"programme_id", "user_id"}))
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.ApplicationStatus status;

    protected Application() {
    }

    public Application(Programme programme, User user) {
        this.programme = programme;
        this.user = user;
        this.status = Enums.ApplicationStatus.PENDING;
    }

    public void decide(Enums.ApplicationStatus status) {
        this.status = status;
    }

    public Programme getProgramme() {
        return programme;
    }

    public User getUser() {
        return user;
    }

    public Enums.ApplicationStatus getStatus() {
        return status;
    }
}
