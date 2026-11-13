package com.youthrise.badge;

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

/**
 * A badge earned by an account. The unique constraint means a person can hold
 * each badge once, no matter how often the awarding rule fires.
 */
@Entity
@Table(name = "user_badges", uniqueConstraints =
        @UniqueConstraint(name = "uk_user_badges_user_badge", columnNames = {"user_id", "badge_id"}))
public class UserBadge extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "awarded_at", nullable = false)
    private Instant awardedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_by")
    private User awardedBy;

    @Column(name = "reason", length = 255)
    private String reason;

    protected UserBadge() {
    }

    static UserBadge award(User user, Badge badge, User awardedBy, String reason) {
        UserBadge award = new UserBadge();
        award.user = user;
        award.badge = badge;
        award.awardedAt = Instant.now();
        award.awardedBy = awardedBy;
        award.reason = reason;
        return award;
    }

    public User getUser() {
        return user;
    }

    public Badge getBadge() {
        return badge;
    }

    public Instant getAwardedAt() {
        return awardedAt;
    }

    public User getAwardedBy() {
        return awardedBy;
    }

    public String getReason() {
        return reason;
    }
}
