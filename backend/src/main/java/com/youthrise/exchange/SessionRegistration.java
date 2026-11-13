package com.youthrise.exchange;

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
@Table(name = "session_registrations", uniqueConstraints =
        @UniqueConstraint(name = "uk_session_registrations_session_user", columnNames = {"session_id", "user_id"}))
public class SessionRegistration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private ExchangeSession session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    protected SessionRegistration() {
    }

    public static SessionRegistration create(ExchangeSession session, User user) {
        SessionRegistration registration = new SessionRegistration();
        registration.session = session;
        registration.user = user;
        registration.registeredAt = Instant.now();
        return registration;
    }

    public ExchangeSession getSession() {
        return session;
    }

    public User getUser() {
        return user;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }
}
