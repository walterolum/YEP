package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A verifiable completion certificate. The code is unique and public. */
@Entity
@Table(name = "certificates")
public class Certificate extends BaseEntity {

    @Column(name = "code", nullable = false, length = 40, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "programme_label", nullable = false, length = 160)
    private String programmeLabel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "issued_by", nullable = false)
    private User issuedBy;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    protected Certificate() {
    }

    public Certificate(String code, User user, String programmeLabel, User issuedBy) {
        this.code = code;
        this.user = user;
        this.programmeLabel = programmeLabel;
        this.issuedBy = issuedBy;
        this.issuedAt = Instant.now();
    }

    public String getCode() {
        return code;
    }

    public User getUser() {
        return user;
    }

    public String getProgrammeLabel() {
        return programmeLabel;
    }

    public User getIssuedBy() {
        return issuedBy;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }
}
