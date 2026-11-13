package com.youthrise.programme;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class ProgrammeDtos {

    private ProgrammeDtos() {
    }

    public record ProgrammeResponse(
            String id,
            String title,
            String summary,
            String description,
            int level,
            String theme,
            int durationWeeks,
            String commitment,
            String mode,
            List<String> eligibility,
            List<String> outcomes,
            List<String> skills,
            int moduleCount,
            int enrolledCount,
            int capacity,
            ProgrammeStatus status,
            Instant startsAt,
            Instant endsAt,
            String facilitatorId,
            String cohort) {

        public static ProgrammeResponse from(Programme programme) {
            return new ProgrammeResponse(
                    programme.getId(),
                    programme.getTitle(),
                    programme.getSummary(),
                    programme.getDescription(),
                    programme.getLevel(),
                    programme.getTheme(),
                    programme.getDurationWeeks(),
                    programme.getCommitment(),
                    programme.getMode(),
                    List.copyOf(programme.getEligibility()),
                    List.copyOf(programme.getOutcomes()),
                    List.copyOf(programme.getSkills()),
                    programme.getModuleCount(),
                    programme.getEnrolledCount(),
                    programme.getCapacity(),
                    programme.getStatus(),
                    programme.getStartsAt(),
                    programme.getEndsAt(),
                    programme.getFacilitator().getId(),
                    programme.getCohort());
        }
    }

    public record LessonResponse(
            String id,
            String moduleId,
            String title,
            LessonType type,
            int durationMins,
            String summary,
            List<String> body,
            ResourceResponse resource) {

        public static LessonResponse from(Lesson lesson) {
            ResourceResponse resource = lesson.getResourceLabel() == null
                    ? null
                    : new ResourceResponse(lesson.getResourceLabel(), lesson.getResourceSize());
            return new LessonResponse(lesson.getId(), lesson.getModule().getId(), lesson.getTitle(),
                    lesson.getType(), lesson.getDurationMins(), lesson.getSummary(),
                    List.copyOf(lesson.getBody()), resource);
        }
    }

    public record ResourceResponse(String label, String size) {
    }

    public record LearningModuleResponse(
            String id,
            String programmeId,
            String title,
            String summary,
            int order,
            ContentStatus status,
            int durationMins,
            List<LessonResponse> lessons) {
    }

    public record EnrolmentResponse(
            String id,
            String programmeId,
            String userId,
            EnrolmentStatus status,
            int progress,
            String lastLessonId,
            Instant enrolledAt) {

        public static EnrolmentResponse from(Enrolment enrolment) {
            return new EnrolmentResponse(enrolment.getId(), enrolment.getProgramme().getId(),
                    enrolment.getUser().getId(), enrolment.getStatus(), enrolment.getProgress(),
                    enrolment.getLastLessonId(), enrolment.getEnrolledAt());
        }
    }

    public record CompletedLessonsResponse(List<String> completedLessonIds) {
    }

    public record CreateProgrammeRequest(
            @NotBlank(message = "Enter a programme title.")
            @Size(max = 160) String title,
            @NotBlank(message = "Enter a short summary.")
            @Size(max = 400) String summary,
            @NotBlank(message = "Enter a description.") String description,
            @Min(value = 1, message = "Level must be 1 or 2.")
            @Max(value = 2, message = "Level must be 1 or 2.") int level,
            @NotBlank(message = "Choose a theme.") @Size(max = 80) String theme,
            @Min(value = 1, message = "Duration must be at least one week.")
            @Max(value = 104, message = "Duration must be 104 weeks or fewer.") int durationWeeks,
            @NotBlank(message = "Describe the weekly commitment.") @Size(max = 80) String commitment,
            @NotBlank(message = "Choose a delivery mode.") @Size(max = 80) String mode,
            List<@Size(max = 500) String> eligibility,
            List<@Size(max = 500) String> outcomes,
            List<@Size(max = 80) String> skills,
            @Min(value = 1, message = "Capacity must be at least one place.")
            @Max(value = 10000, message = "Capacity is too large.") int capacity,
            @NotNull(message = "Choose a programme status.") ProgrammeStatus status,
            @NotNull(message = "Choose a start date.") Instant startsAt,
            @NotNull(message = "Choose an end date.") Instant endsAt,
            @NotBlank(message = "Name the cohort.") @Size(max = 80) String cohort) {
    }

    public record UpdateModuleStatusRequest(@NotNull(message = "Choose a status.") ContentStatus status) {
    }
}
