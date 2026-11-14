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

/** A recurring programme of sessions (for example four weekly workshops). */
@Entity
@Table(name = "session_series")
public class SessionSeries extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private Enums.SessionType type;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "repeat_weeks", nullable = false)
    private int repeatWeeks;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "cohort", length = 80)
    private String cohort;

    @Column(name = "provider", nullable = false, length = 20)
    private String provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id")
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    protected SessionSeries() {
    }

    public SessionSeries(String title, Enums.SessionType type, Instant startsAt, int repeatWeeks,
                         int durationMinutes, String cohort, Programme programme, User createdBy,
                         String provider) {
        this.title = title;
        this.type = type;
        this.startsAt = startsAt;
        this.repeatWeeks = repeatWeeks;
        this.durationMinutes = durationMinutes;
        this.cohort = cohort;
        this.programme = programme;
        this.createdBy = createdBy;
        this.provider = provider;
    }

    public String getTitle() {
        return title;
    }

    public Enums.SessionType getType() {
        return type;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public int getRepeatWeeks() {
        return repeatWeeks;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public String getCohort() {
        return cohort;
    }

    public String getProvider() {
        return provider;
    }

    public Programme getProgramme() {
        return programme;
    }
}
