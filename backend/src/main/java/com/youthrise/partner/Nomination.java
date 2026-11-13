package com.youthrise.partner;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "nominations")
public class Nomination extends BaseEntity {

    @Column(name = "institution", nullable = false, length = 160)
    private String institution;

    @Column(name = "learner_name", nullable = false, length = 160)
    private String learnerName;

    @Column(name = "learner_email", nullable = false, length = 320)
    private String learnerEmail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nominated_by", nullable = false)
    private User nominatedBy;

    @Column(name = "nominated_at", nullable = false)
    private Instant nominatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private NominationStatus status;

    @Column(name = "note", length = 1000)
    private String note;

    protected Nomination() {
    }

    public static Nomination create(String institution, String learnerName, String learnerEmail,
                                    Programme programme, User nominatedBy, String note) {
        Nomination nomination = new Nomination();
        nomination.institution = institution.trim();
        nomination.learnerName = learnerName.trim();
        nomination.learnerEmail = learnerEmail.trim().toLowerCase(java.util.Locale.ROOT);
        nomination.programme = programme;
        nomination.nominatedBy = nominatedBy;
        nomination.nominatedAt = Instant.now();
        nomination.status = NominationStatus.NOMINATED;
        nomination.note = note == null || note.isBlank() ? null : note.trim();
        return nomination;
    }

    public String getInstitution() {
        return institution;
    }

    public String getLearnerName() {
        return learnerName;
    }

    public String getLearnerEmail() {
        return learnerEmail;
    }

    public Programme getProgramme() {
        return programme;
    }

    public User getNominatedBy() {
        return nominatedBy;
    }

    public Instant getNominatedAt() {
        return nominatedAt;
    }

    public NominationStatus getStatus() {
        return status;
    }

    public String getNote() {
        return note;
    }
}
