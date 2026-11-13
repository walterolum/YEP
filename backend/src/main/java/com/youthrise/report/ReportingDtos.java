package com.youthrise.report;

import com.youthrise.exchange.SessionStatus;
import java.time.Instant;
import java.util.List;

public final class ReportingDtos {

    private ReportingDtos() {
    }

    public record CohortMemberResponse(
            String userId,
            String enrolmentId,
            String programmeId,
            int progress,
            int attendance,
            String completion,
            Instant enrolledAt) {
    }

    public record ProgrammeParticipationResponse(
            String id,
            String name,
            String shortName,
            int enrolled,
            int capacity,
            int level) {
    }

    public record AttendanceResponse(
            String id,
            String name,
            int registered,
            int capacity,
            SessionStatus status) {
    }

    public record CompletionBucketResponse(String label, int min, int max, long learners) {
    }

    public record FacilitatorSummaryResponse(
            long activeProgrammes,
            long pendingReviews,
            long activeTeams,
            int averageCompletion) {
    }
}
