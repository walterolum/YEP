package com.youthrise.assessment;

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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "certificates", uniqueConstraints = {
        @UniqueConstraint(name = "uk_certificates_code", columnNames = "code"),
        @UniqueConstraint(name = "uk_certificates_programme_participant",
                columnNames = {"programme_id", "participant_id"})
})
public class Certificate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private CertificateStatus status;

    @Column(name = "issued_at")
    private Instant issuedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "verification_note", nullable = false, length = 500)
    private String verificationNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuedBy;

    protected Certificate() {
    }

    /**
     * Issues a valid certificate. A certificate is meaningless without a
     * programme, a named participant and a unique verification code, so the
     * entity refuses those shapes itself.
     */
    public static Certificate issue(Programme programme, User participant, String code, User issuedBy) {
        if (programme == null) {
            throw new IllegalArgumentException("A certificate needs a programme");
        }
        if (participant == null) {
            throw new IllegalArgumentException("A certificate needs a participant");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("A certificate needs a verification code");
        }
        Certificate certificate = new Certificate();
        certificate.programme = programme;
        certificate.participant = participant;
        certificate.code = code.trim();
        certificate.status = CertificateStatus.VALID;
        certificate.issuedAt = Instant.now();
        certificate.verificationNote =
                "Issued after verified completion of the programme and its required assessments.";
        certificate.issuedBy = issuedBy;
        return certificate;
    }

    public void revoke(String reason) {
        if (status == CertificateStatus.REVOKED) {
            throw new IllegalStateException("The certificate is already revoked");
        }
        this.status = CertificateStatus.REVOKED;
        this.revokedAt = Instant.now();
        this.verificationNote = reason;
    }

    /** True while the certificate stands and can be shown publicly. */
    public boolean isValid() {
        return status == CertificateStatus.VALID;
    }

    public Programme getProgramme() {
        return programme;
    }

    public User getParticipant() {
        return participant;
    }

    public String getCode() {
        return code;
    }

    public CertificateStatus getStatus() {
        return status;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public String getVerificationNote() {
        return verificationNote;
    }

    public User getIssuedBy() {
        return issuedBy;
    }
}
