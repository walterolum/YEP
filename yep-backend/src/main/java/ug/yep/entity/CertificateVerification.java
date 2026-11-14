package ug.yep.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** An audit row for each public check of a certificate code. */
@Entity
@Table(name = "certificate_verifications")
public class CertificateVerification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "certificate_id", nullable = false)
    private Certificate certificate;

    private Instant checkedAt;

    protected CertificateVerification() {
    }

    public CertificateVerification(Certificate certificate) {
        this.certificate = certificate;
        this.checkedAt = Instant.now();
    }

    public Certificate getCertificate() {
        return certificate;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }
}
