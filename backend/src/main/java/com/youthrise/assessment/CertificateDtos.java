package com.youthrise.assessment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class CertificateDtos {

    private CertificateDtos() {
    }

    public record CertificateResponse(
            String id,
            String programmeTitle,
            int level,
            String participantName,
            String participantId,
            Instant issueDate,
            String code,
            CertificateStatus status,
            String verificationNote,
            String programmeId) {

        public static CertificateResponse from(Certificate certificate) {
            return new CertificateResponse(
                    certificate.getId(),
                    certificate.getProgramme().getTitle(),
                    certificate.getProgramme().getLevel(),
                    certificate.getParticipant().getFullName(),
                    certificate.getParticipant().getId(),
                    certificate.getIssuedAt(),
                    certificate.getCode(),
                    certificate.getStatus(),
                    certificate.getVerificationNote(),
                    certificate.getProgramme().getId());
        }
    }

    public record RevokeRequest(
            @NotBlank(message = "Explain why the certificate is being revoked.")
            @Size(max = 500, message = "Use 500 characters or fewer.") String note) {
    }

    public record IssueRequest(
            @NotBlank(message = "Choose a programme.") String programmeId,
            @NotBlank(message = "Choose a participant.") String participantId) {
    }
}
