package com.youthrise.partner;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class PartnerDtos {

    private PartnerDtos() {
    }

    public record NominationResponse(
            String id,
            String institution,
            String learnerName,
            String learnerEmail,
            String programmeId,
            Instant nominatedAt,
            NominationStatus status,
            String note) {

        public static NominationResponse from(Nomination nomination) {
            return new NominationResponse(nomination.getId(), nomination.getInstitution(),
                    nomination.getLearnerName(), nomination.getLearnerEmail(),
                    nomination.getProgramme().getId(), nomination.getNominatedAt(),
                    nomination.getStatus(), nomination.getNote());
        }
    }

    public record CreateNominationRequest(
            @NotBlank(message = "Enter the nominating institution.")
            @Size(max = 160) String institution,
            @NotBlank(message = "Enter the learner's name.")
            @Size(max = 160) String learnerName,
            @NotBlank(message = "Enter the learner's email address.")
            @Email(message = "Enter a valid email address.")
            @Size(max = 320) String learnerEmail,
            @NotBlank(message = "Choose a programme.") String programmeId,
            @Size(max = 1000) String note) {
    }

    public record BriefingRequestPayload(
            @NotBlank(message = "Explain what briefing you need.")
            @Size(max = 1000) String note) {
    }
}
