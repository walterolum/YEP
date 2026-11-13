package com.youthrise.badge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class BadgeDtos {

    private BadgeDtos() {
    }

    public record BadgeResponse(
            String code,
            String name,
            String description,
            String criteria,
            boolean earned,
            Instant awardedAt) {

        static BadgeResponse of(Badge badge, UserBadge award) {
            return new BadgeResponse(badge.getCode(), badge.getName(), badge.getDescription(),
                    badge.getCriteria(), award != null, award == null ? null : award.getAwardedAt());
        }
    }

    public record AwardBadgeRequest(
            @NotBlank(message = "Choose a participant.") String userId,
            @NotBlank(message = "Choose a badge.") String code,
            @Size(max = 255, message = "Use 255 characters or fewer.") String reason) {
    }
}
