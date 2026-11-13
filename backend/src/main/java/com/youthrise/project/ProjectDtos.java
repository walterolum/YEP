package com.youthrise.project;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class ProjectDtos {

    private ProjectDtos() {
    }

    public record TeamMessageResponse(String id, String authorId, String body, Instant sentAt) {

        static TeamMessageResponse from(TeamMessage message) {
            return new TeamMessageResponse(message.getId(), message.getAuthor().getId(),
                    message.getBody(), message.getSentAt());
        }
    }

    public record TeamMemberResponse(String userId, String fullName, TeamMemberRole role, Instant joinedAt) {

        static TeamMemberResponse from(TeamMember member) {
            return new TeamMemberResponse(member.getUser().getId(), member.getUser().getFullName(),
                    member.getRole(), member.getJoinedAt());
        }
    }

    public record TeamResponse(
            String id,
            String name,
            String theme,
            String programmeId,
            String mentorId,
            List<String> memberIds,
            List<TeamMemberResponse> members,
            String projectId,
            int capacity,
            Instant createdAt,
            List<TeamMessageResponse> messages) {

        public static TeamResponse from(Team team) {
            return new TeamResponse(
                    team.getId(),
                    team.getName(),
                    team.getTheme(),
                    team.getProgramme().getId(),
                    team.getMentor() == null ? null : team.getMentor().getId(),
                    team.getMembers().stream().map(member -> member.getId()).toList(),
                    team.getMemberships().stream().map(TeamMemberResponse::from).toList(),
                    team.getProject() == null ? null : team.getProject().getId(),
                    team.getCapacity(),
                    team.getCreatedAt(),
                    team.getMessages().stream().map(TeamMessageResponse::from).toList());
        }
    }

    public record MilestoneResponse(
            String id,
            String title,
            String description,
            Instant dueAt,
            MilestoneStatus status,
            String evidence,
            String feedback,
            Instant updatedAt) {

        static MilestoneResponse from(Milestone milestone) {
            return new MilestoneResponse(milestone.getId(), milestone.getTitle(), milestone.getDescription(),
                    milestone.getDueAt(), milestone.getStatus(), milestone.getEvidence(), milestone.getFeedback(),
                    milestone.getUpdatedAt());
        }
    }

    public record ResourceResponse(String label, String kind, String addedBy, Instant date) {

        static ResourceResponse from(ProjectResource resource) {
            return new ResourceResponse(resource.getLabel(), resource.getKind(), resource.getAddedBy(),
                    resource.getAddedAt());
        }
    }

    public record ProjectResponse(
            String id,
            String teamId,
            String title,
            String problem,
            String theme,
            String summary,
            List<String> objectives,
            ProjectStatus status,
            List<MilestoneResponse> milestones,
            List<ResourceResponse> resources) {

        public static ProjectResponse from(Project project) {
            return new ProjectResponse(
                    project.getId(),
                    project.getTeam().getId(),
                    project.getTitle(),
                    project.getProblem(),
                    project.getTheme(),
                    project.getSummary(),
                    List.copyOf(project.getObjectives()),
                    project.getStatus(),
                    project.getMilestones().stream().map(MilestoneResponse::from).toList(),
                    project.getResources().stream().map(ResourceResponse::from).toList());
        }
    }

    public record SubmissionResponse(
            String id,
            String projectId,
            String teamId,
            String milestoneId,
            String title,
            String fileName,
            String note,
            Instant submittedAt,
            String submittedBy,
            SubmissionStatus status,
            String reviewerId,
            Integer score,
            int maxScore,
            String feedback,
            String revisionRequested) {

        public static SubmissionResponse from(Submission submission) {
            return new SubmissionResponse(
                    submission.getId(),
                    submission.getProject().getId(),
                    submission.getTeam().getId(),
                    submission.getMilestone().getId(),
                    submission.getTitle(),
                    submission.getFileName(),
                    submission.getNote(),
                    submission.getSubmittedAt(),
                    submission.getSubmittedBy().getId(),
                    submission.getStatus(),
                    submission.getReviewer() == null ? null : submission.getReviewer().getId(),
                    submission.getScore(),
                    submission.getMaxScore(),
                    submission.getFeedback(),
                    submission.getRevisionRequested());
        }
    }

    public record MentorFeedbackResponse(
            String id,
            String teamId,
            String authorId,
            String milestoneId,
            String body,
            Instant createdAt,
            boolean resolved) {

        public static MentorFeedbackResponse from(MentorFeedback feedback) {
            return new MentorFeedbackResponse(feedback.getId(), feedback.getTeam().getId(),
                    feedback.getAuthor().getId(),
                    feedback.getMilestone() == null ? null : feedback.getMilestone().getId(),
                    feedback.getBody(), feedback.getCreatedAt(), feedback.isResolved());
        }
    }

    public record PostMessageRequest(
            @NotBlank(message = "Write a message before sending.")
            @Size(max = 2000, message = "Use 2000 characters or fewer.") String body) {
    }

    public record UpdateMilestoneRequest(@NotNull(message = "Choose a milestone status.") MilestoneStatus status) {
    }

    public record ReviewRequest(
            @NotNull(message = "Choose a review decision.") SubmissionStatus status,
            @Min(value = 0, message = "Scores cannot be negative.")
            @Max(value = 20, message = "The score cannot exceed 20.") Integer score,
            @NotBlank(message = "Add feedback for the team.")
            @Size(min = 15, max = 2000, message = "Write at least 15 characters of feedback.")
            String feedback) {
    }

    public record CreateFeedbackRequest(
            @NotBlank(message = "Choose a team.") String teamId,
            @NotBlank(message = "Write feedback before saving.")
            @Size(max = 2000, message = "Use 2000 characters or fewer.") String body,
            String milestoneId) {
    }

    public record CreateTeamRequest(
            @NotBlank(message = "Choose a programme.") String programmeId,
            @NotBlank(message = "Give your team a name.")
            @Size(max = 120, message = "Use 120 characters or fewer.") String name,
            @NotBlank(message = "Choose a focus theme.")
            @Size(max = 80, message = "Use 80 characters or fewer.") String theme) {
    }

    /**
     * Names the person to add either by account id or by email address. Email is
     * the normal path because it lets a lead invite a known participant without
     * exposing a searchable directory of every young person on the platform.
     */
    public record AddTeamMemberRequest(
            @Size(max = 36, message = "Use 36 characters or fewer.") String userId,
            @Email(message = "Enter a valid email address.")
            @Size(max = 320, message = "Use 320 characters or fewer.") String email,
            @NotNull(message = "Choose a team role.") TeamMemberRole role) {
    }

    /** Facilitator-side bulk assignment of selected participants. */
    public record BulkAddMembersRequest(
            @NotNull(message = "Select at least one participant.")
            @Size(min = 1, max = 20, message = "Select between one and twenty participants.")
            List<@NotBlank String> userIds,
            @NotNull(message = "Choose a team role.") TeamMemberRole role) {
    }

    /** A participant who is enrolled in a programme but not yet on any team. */
    public record ParticipantCandidateResponse(
            String userId,
            String fullName,
            String initials,
            String country,
            Instant enrolledAt) {
    }

    public record ChangeTeamMemberRoleRequest(
            @NotNull(message = "Choose a team role.") TeamMemberRole role) {
    }

    public record CreateProjectRequest(
            @NotBlank(message = "Give the project a title.")
            @Size(max = 160, message = "Use 160 characters or fewer.") String title,
            @NotBlank(message = "Describe the problem the project addresses.")
            @Size(max = 500, message = "Use 500 characters or fewer.") String problem,
            @NotBlank(message = "Choose a focus theme.")
            @Size(max = 80, message = "Use 80 characters or fewer.") String theme,
            @NotBlank(message = "Summarise the approach.")
            @Size(max = 1000, message = "Use 1000 characters or fewer.") String summary,
            @Size(max = 8, message = "Add up to eight objectives.")
            List<@Size(max = 500, message = "Use 500 characters per objective.") String> objectives) {
    }
}
