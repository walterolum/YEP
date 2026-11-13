package com.youthrise.employer;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "introductions")
public class Introduction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "talent_id", nullable = false)
    private User talent;

    @Column(name = "note", nullable = false, length = 1000)
    private String note;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    protected Introduction() {
    }

    public static Introduction request(User employer, User talent, String note) {
        Introduction introduction = new Introduction();
        introduction.employer = employer;
        introduction.talent = talent;
        introduction.note = note.trim();
        introduction.requestedAt = Instant.now();
        introduction.status = "requested";
        return introduction;
    }

    public User getEmployer() {
        return employer;
    }

    public User getTalent() {
        return talent;
    }

    public String getNote() {
        return note;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public String getStatus() {
        return status;
    }
}
