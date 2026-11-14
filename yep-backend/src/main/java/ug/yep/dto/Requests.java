package ug.yep.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Request payloads with declarative validation. */
public final class Requests {

    private Requests() {
    }

    public record SignupRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @Size(max = 40) String phone,
            @NotBlank @Size(min = 8, max = 72) String password,
            String confirmPassword,
            @Size(max = 80) String country,
            @Size(max = 80) String district,
            LocalDate dateOfBirth,
            @Size(max = 160) String institution,
            @Size(max = 120) String fieldOfStudy,
            @Size(max = 20) String gender,
            @Size(max = 40) String educationLevel,
            @Size(max = 40) String employmentStatus,
            @Size(max = 240) String careerGoal,
            @Size(max = 8) String preferredLanguage,
            Set<@Size(max = 80) String> interests,
            Boolean termsAccepted,
            Boolean privacyAccepted,
            String requestedLevel) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record ProfileUpdateRequest(
            @Size(max = 120) String fullName,
            @Size(max = 40) String phone,
            @Size(max = 80) String country,
            @Size(max = 80) String district,
            LocalDate dateOfBirth,
            @Size(max = 160) String institution,
            @Size(max = 120) String fieldOfStudy,
            @Size(max = 20) String gender,
            @Size(max = 40) String educationLevel,
            @Size(max = 40) String employmentStatus,
            @Size(max = 240) String careerGoal,
            @Size(max = 8) String preferredLanguage,
            Set<String> skills,
            Set<String> interests) {
    }

    public record PasswordChangeRequest(@NotBlank String currentPassword,
                                        @NotBlank @Size(min = 8, max = 72) String newPassword) {
    }

    public record DecisionRequest(@NotBlank String status, @Size(max = 500) String note) {
    }

    public record CreateUserRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 190) String email,
            @Size(max = 40) String phone,
            @NotBlank String role,
            @Size(min = 8, max = 72) String password) {
    }

    public record ProgrammeRequest(
            @NotBlank @Size(max = 160) String title,
            @NotBlank @Size(max = 80) String category,
            @Size(max = 16) String icon,
            @Min(1) int capacity,
            @NotNull Instant registrationDeadline,
            @Size(max = 1000) String eligibilityText,
            boolean published) {
    }

    public record ApplyRequest(@NotNull Long programmeId) {
    }

    // ---------------------------------------------------------------- catalogue

    public record AcademyRequest(
            @NotBlank @Size(max = 160) String name,
            @Size(max = 160) String slug,
            @Size(max = 240) String tagline,
            @Size(max = 4000) String description,
            @Size(max = 16) String icon,
            @Size(max = 16) String colour,
            int sortOrder,
            Boolean published) {
    }

    public record CareerPathRequest(
            @NotNull Long academyId,
            @NotBlank @Size(max = 160) String title,
            @Size(max = 160) String slug,
            @Size(max = 500) String summary,
            @Size(max = 4000) String description,
            @Size(max = 16) String icon,
            int sortOrder,
            Boolean published) {
    }

    /** {@code courseId} is optional in the body: the path supplies it. */
    public record ModuleRequest(
            Long courseId,
            @NotBlank @Size(max = 120) String name,
            @Size(max = 16) String icon,
            @Size(max = 600) String outcome,
            Integer sortOrder,
            Integer level) {
    }

    /** {@code moduleId} is optional in the body: the path supplies it. */
    public record LessonRequest(
            Long moduleId,
            @NotBlank @Size(max = 160) String title,
            @NotBlank String type,
            Integer sortOrder,
            @Size(max = 20000) String content,
            Integer durationMinutes) {
    }

    public record CourseRequest(
            @NotNull Long careerPathId,
            @NotBlank @Size(max = 40) String code,
            @NotBlank @Size(max = 160) String title,
            @Size(max = 160) String slug,
            @Size(max = 500) String summary,
            @Size(max = 4000) String description,
            @Min(1) @Max(2) int level,
            @Min(0) int durationHours,
            @Size(max = 16) String icon,
            int sortOrder,
            Boolean published) {
    }

    public record CreateProjectRequest(@NotBlank @Size(max = 160) String title,
                                       @NotBlank @Size(max = 40) String category,
                                       @Size(max = 2000) String description,
                                       List<String> milestones) {
    }

    public record CreateTeamRequest(
            @NotBlank @Size(max = 120) String name,
            Long projectId,
            @NotNull Long leadUserId,
            @NotEmpty List<Long> memberIds,
            Long mentorId,
            Long facilitatorId,
            @Size(max = 80) String cohort) {
    }

    public record MilestoneToggleRequest(boolean completed) {
    }

    public record SubmitAssessmentRequest(@NotEmpty Map<Long, String> answers) {
    }

    public record CreateSessionRequest(
            @NotBlank @Size(max = 160) String title,
            @NotBlank String type,
            @NotNull Instant startsAt,
            @Size(max = 80) String cohort,
            Long programmeId,
            @Size(max = 400) String meetingLink) {
    }

    public record AttendanceRequest(@NotNull Long userId, boolean present) {
    }

    public record IssueCertificateRequest(@NotNull Long userId,
                                          @Size(max = 160) String programmeLabel) {
    }

    public record NewThreadRequest(
            @NotBlank String kind,
            @NotBlank @Size(max = 160) String title,
            @NotBlank @Size(max = 4000) String body,
            Long targetUserId,
            String audience,
            List<Long> participantIds) {
    }

    public record PostMessageRequest(@NotBlank @Size(max = 4000) String body) {
    }

    public record AnnouncementRequest(@NotBlank @Size(max = 160) String title,
                                      @NotBlank @Size(max = 4000) String body,
                                      String audience) {
    }

    /**
     * The prototype's quiz builder submits whole questions, so a new assessment can be
     * created in one call.
     */
    public record CreateAssessmentRequest(
            @NotNull Long moduleId,
            @NotBlank @Size(max = 160) String title,
            @NotNull Instant dueDate,
            boolean published,
            List<QuestionRequest> questions) {
    }

    public record QuestionRequest(
            @NotBlank String prompt,
            @NotBlank String optionA,
            @NotBlank String optionB,
            String optionC,
            String optionD,
            @NotBlank String correctOption) {
    }

    public record PledgeRequest(Long projectId, @Size(max = 160) String projectTitle,
                                @Min(1000) double amountUgx) {
    }

    public record SettingsRequest(@NotEmpty Map<String, String> values) {
    }

    public record PermissionRequest(@NotBlank String role, @NotBlank String permission,
                                    boolean allowed) {
    }

    public record ProgressUpdateRequest(@Min(0) @Max(100) int progressPercent) {
    }

    public record ResourceRequest(@NotBlank @Size(max = 160) String title,
                                  @NotBlank String type,
                                  @NotBlank @Size(max = 500) String url) {
    }

    public record MentorSessionRequest(@NotBlank @Size(max = 160) String title,
                                       @NotNull Instant startsAt) {
    }
}
