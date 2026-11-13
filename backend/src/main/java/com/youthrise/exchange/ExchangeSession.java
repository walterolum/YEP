package com.youthrise.exchange;

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
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "exchange_sessions")
public class ExchangeSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "duration_mins", nullable = false)
    private int durationMins;

    @Column(name = "timezone", nullable = false, length = 64)
    private String timezone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "facilitator_id", nullable = false)
    private User facilitator;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "meeting_url", length = 500)
    private String meetingUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private SessionStatus status;

    @Formula("(select count(*) from session_registrations r where r.session_id = id)")
    private int registeredCount;

    protected ExchangeSession() {
    }

    public static ExchangeSession create(Programme programme, String title, Instant startsAt, int durationMins,
                                         String timezone, User facilitator, int capacity, String description,
                                         String meetingUrl) {
        ExchangeSession session = new ExchangeSession();
        session.programme = programme;
        session.title = title.trim();
        session.startsAt = startsAt;
        session.durationMins = durationMins;
        session.timezone = timezone;
        session.facilitator = facilitator;
        session.capacity = capacity;
        session.description = description.trim();
        session.meetingUrl = meetingUrl == null || meetingUrl.isBlank() ? null : meetingUrl.trim();
        session.status = SessionStatus.UPCOMING;
        return session;
    }

    public boolean isUpcoming() {
        return status == SessionStatus.UPCOMING && startsAt.isAfter(Instant.now());
    }

    public Programme getProgramme() {
        return programme;
    }

    public String getTitle() {
        return title;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public int getDurationMins() {
        return durationMins;
    }

    public String getTimezone() {
        return timezone;
    }

    public User getFacilitator() {
        return facilitator;
    }

    public int getCapacity() {
        return capacity;
    }

    public String getDescription() {
        return description;
    }

    public String getMeetingUrl() {
        return meetingUrl;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public int getRegisteredCount() {
        return registeredCount;
    }
}
