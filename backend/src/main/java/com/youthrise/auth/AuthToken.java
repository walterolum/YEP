package com.youthrise.auth;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "auth_tokens", indexes = {
        @Index(name = "idx_auth_tokens_user", columnList = "user_id,purpose"),
        @Index(name = "idx_auth_tokens_hash", columnList = "token_hash", unique = true)
})
public class AuthToken extends BaseEntity {

    public enum Purpose {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 32)
    private Purpose purpose;

    @Column(name = "token_hash", nullable = false, length = 64, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "attempts", nullable = false)
    private int attempts;

    protected AuthToken() {
    }

    public static AuthToken issue(User user, Purpose purpose, String tokenHash, Instant expiresAt) {
        AuthToken token = new AuthToken();
        token.user = user;
        token.purpose = purpose;
        token.tokenHash = tokenHash;
        token.expiresAt = expiresAt;
        token.attempts = 0;
        return token;
    }

    public boolean isUsable(Instant now, int maxAttempts) {
        return usedAt == null && attempts < maxAttempts && now.isBefore(expiresAt);
    }

    public void markUsed() {
        this.usedAt = Instant.now();
    }

    public void registerFailedAttempt() {
        this.attempts++;
    }

    public User getUser() {
        return user;
    }

    public Purpose getPurpose() {
        return purpose;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public int getAttempts() {
        return attempts;
    }
}
