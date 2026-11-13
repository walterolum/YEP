package com.youthrise.employer;

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
@Table(name = "saved_talent", uniqueConstraints =
        @UniqueConstraint(name = "uk_saved_talent_employer_user", columnNames = {"employer_id", "user_id"}))
public class SavedTalent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User talent;

    @Column(name = "saved_at", nullable = false)
    private Instant savedAt;

    protected SavedTalent() {
    }

    public static SavedTalent create(User employer, User talent) {
        SavedTalent saved = new SavedTalent();
        saved.employer = employer;
        saved.talent = talent;
        saved.savedAt = Instant.now();
        return saved;
    }

    public User getEmployer() {
        return employer;
    }

    public User getTalent() {
        return talent;
    }

    public Instant getSavedAt() {
        return savedAt;
    }
}
