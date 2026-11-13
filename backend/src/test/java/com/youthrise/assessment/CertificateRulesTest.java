package com.youthrise.assessment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.Test;

/** Certificate issuance, verification state and revocation rules. */
class CertificateRulesTest {

    @Test
    void anIssuedCertificateIsValidUntilItIsRevoked() {
        User participant = participant();
        User issuer = issuer();
        Certificate certificate = Certificate.issue(programme(issuer), participant,
                "YEP-4K7Q-9M2B-2026", issuer);

        assertThat(certificate.getCode()).isEqualTo("YEP-4K7Q-9M2B-2026");
        assertThat(certificate.getStatus()).isEqualTo(CertificateStatus.VALID);
        assertThat(certificate.getParticipant()).isEqualTo(participant);
        assertThat(certificate.getIssuedAt()).isNotNull();
        assertThat(certificate.isValid()).isTrue();

        certificate.revoke("Issued in error");

        assertThat(certificate.getStatus()).isEqualTo(CertificateStatus.REVOKED);
        assertThat(certificate.isValid()).isFalse();
        assertThat(certificate.getVerificationNote()).isEqualTo("Issued in error");
    }

    @Test
    void aRevokedCertificateCannotBeRevokedTwice() {
        User issuer = issuer();
        Certificate certificate = Certificate.issue(programme(issuer), participant(),
                "YEP-PEND-2026", issuer);
        certificate.revoke("First reason");

        assertThatThrownBy(() -> certificate.revoke("Second reason"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void aCertificateNeedsAParticipantAndAUniqueCode() {
        User issuer = issuer();
        assertThatThrownBy(() -> Certificate.issue(programme(issuer), null, "YEP-TEST", issuer))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> Certificate.issue(programme(issuer), participant(), "  ", issuer))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private static User participant() {
        return User.register("Amara Nakato", "amara@example.org", null, "Uganda", "hash",
                "Africa/Kampala", LocalDate.of(2000, 1, 1));
    }

    private static User issuer() {
        return User.invited("Daniel Okello", "daniel@example.org", Role.FACILITATOR, "Uganda",
                "Africa/Kampala");
    }

    private static Programme programme(User facilitator) {
        Instant now = Instant.now();
        return Programme.create("Digital Literacy", "Summary", "Description", 1, "Digital", 4,
                "2 hours a week", "Online", 25, ProgrammeStatus.OPEN, now.minus(30, ChronoUnit.DAYS),
                now.plus(30, ChronoUnit.DAYS), "2026-A", facilitator);
    }
}
