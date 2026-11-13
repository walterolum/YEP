package com.youthrise.auth;

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
@Table(name = "consents", uniqueConstraints =
        @UniqueConstraint(name = "uk_consents_user_type", columnNames = {"user_id", "type"}))
public class Consent extends BaseEntity {

    public enum Type {
        PRIVACY_POLICY,
        COMMUNICATIONS
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private Type type;

    @Column(name = "granted", nullable = false)
    private boolean granted;

    @Column(name = "policy_version", nullable = false, length = 32)
    private String policyVersion;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    protected Consent() {
    }

    public static Consent record(User user, Type type, boolean granted, String policyVersion) {
        Consent consent = new Consent();
        consent.user = user;
        consent.type = type;
        consent.granted = granted;
        consent.policyVersion = policyVersion;
        consent.recordedAt = Instant.now();
        return consent;
    }

    public User getUser() {
        return user;
    }

    public Type getType() {
        return type;
    }

    public boolean isGranted() {
        return granted;
    }

    public String getPolicyVersion() {
        return policyVersion;
    }

    public Instant getRecordedAt() {
        return recordedAt;
    }
}
