package com.youthrise.exchange;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class ExchangeDtos {

    private ExchangeDtos() {
    }

    public record SessionResponse(
            String id,
            String title,
            String programmeId,
            Instant startsAt,
            int durationMins,
            String timezone,
            String facilitatorId,
            int capacity,
            int registeredCount,
            String description,
            String meetingUrl,
            SessionStatus status) {
    }

    public record CreateSessionRequest(
            @NotBlank(message = "Enter a session title.") @Size(max = 160) String title,
            @NotBlank(message = "Choose a programme.") String programmeId,
            @NotNull(message = "Choose a start time.") Instant startsAt,
            @Min(value = 15, message = "A session must last at least 15 minutes.")
            @Max(value = 480, message = "A session cannot exceed 8 hours.") int durationMins,
            @NotBlank(message = "Choose a time zone.") @Size(max = 64) String timezone,
            @Min(value = 1, message = "Capacity must be at least one.") int capacity,
            @NotBlank(message = "Enter a description.") String description,
            @Size(max = 500) String meetingUrl) {
    }
}
