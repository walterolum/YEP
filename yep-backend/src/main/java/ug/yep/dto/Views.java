package ug.yep.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import ug.yep.entity.Application;
import ug.yep.entity.Assessment;
import ug.yep.entity.Certificate;
import ug.yep.entity.EventSession;
import ug.yep.entity.Lesson;
import ug.yep.entity.Material;
import ug.yep.entity.Message;
import ug.yep.entity.MessageThread;
import ug.yep.entity.Milestone;
import ug.yep.entity.Module;
import ug.yep.entity.Notification;
import ug.yep.entity.Programme;
import ug.yep.entity.Project;
import ug.yep.entity.Question;
import ug.yep.entity.Team;
import ug.yep.entity.User;

/** Response payloads. Records keep the API surface explicit and immutable. */
public final class Views {

    private Views() {
    }

    public record UserView(Long id, String fullName, String email, String phone, String role,
                           String status, String country, String district, LocalDate dateOfBirth,
                           String institution, String fieldOfStudy, String requestedLevel,
                           String avatar, Set<String> skills, Instant lastLoginAt, Instant createdAt) {

        public static UserView of(User user) {
            return new UserView(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(),
                    user.getRole().name(), user.getStatus().name(), user.getCountry(), user.getDistrict(),
                    user.getDateOfBirth(), user.getInstitution(), user.getFieldOfStudy(),
                    user.getRequestedLevel() == null ? null : user.getRequestedLevel().name(),
                    user.getAvatar(), Set.copyOf(user.getSkills()), user.getLastLoginAt(),
                    user.getCreatedAt());
        }
    }

    public record AuthView(String token, long expiresInSeconds, UserView user) {
    }

    public record ProgrammeView(Long id, String title, String category, String icon, int capacity,
                                long placesLeft, Instant registrationDeadline, String eligibilityText,
                                boolean published, boolean open) {

        public static ProgrammeView of(Programme programme, long approved) {
            return new ProgrammeView(programme.getId(), programme.getTitle(), programme.getCategory(),
                    programme.getIcon(), programme.getCapacity(), programme.getPlacesLeft(approved),
                    programme.getRegistrationDeadline(), programme.getEligibilityText(),
                    programme.isPublished(), programme.isOpen(approved));
        }
    }

    public record ApplicationView(Long id, Long programmeId, String programmeTitle,
                                  String applicantName, String applicantEmail, String status,
                                  Instant createdAt) {

        public static ApplicationView of(Application application) {
            return new ApplicationView(application.getId(), application.getProgramme().getId(),
                    application.getProgramme().getTitle(), application.getUser().getFullName(),
                    application.getUser().getEmail(), application.getStatus().name(),
                    application.getCreatedAt());
        }
    }

    public record LessonView(Long id, String title, String type, int durationMinutes,
                             boolean completed) {

        public static LessonView of(Lesson lesson, boolean completed) {
            return new LessonView(lesson.getId(), lesson.getTitle(), lesson.getType().name(),
                    lesson.getDurationMinutes(), completed);
        }
    }

    public record LessonDetailView(Long id, String title, String type, int durationMinutes,
                                   String moduleName, String content, boolean completed) {

        public static LessonDetailView of(Lesson lesson, boolean completed) {
            return new LessonDetailView(lesson.getId(), lesson.getTitle(), lesson.getType().name(),
                    lesson.getDurationMinutes(), lesson.getModule().getName(), lesson.getContent(),
                    completed);
        }
    }

    public record ModuleView(Long id, String name, String icon, String outcome, long totalLessons,
                             long completedLessons, int percent, List<LessonView> lessons) {
    }

    public record MaterialView(Long id, String title, String type, String url) {

        public static MaterialView of(Material material) {
            return new MaterialView(material.getId(), material.getTitle(), material.getType().name(),
                    material.getUrl());
        }
    }

    public record ProjectView(Long id, String title, String category, String description,
                              String status) {

        public static ProjectView of(Project project) {
            return new ProjectView(project.getId(), project.getTitle(), project.getCategory(),
                    project.getDescription(), project.getStatus().name());
        }
    }

    public record MilestoneView(Long id, String title, boolean completed, Instant completedAt,
                                boolean overdue) {

        public static MilestoneView of(Milestone milestone) {
            return new MilestoneView(milestone.getId(), milestone.getTitle(), milestone.isCompleted(),
                    milestone.getCompletedAt(), false);
        }
    }

    public record TeamMemberView(Long id, String fullName, String email, boolean lead, String avatar) {

        public static TeamMemberView of(User user, boolean lead) {
            return new TeamMemberView(user.getId(), user.getFullName(), user.getEmail(), lead,
                    user.getAvatar());
        }
    }

    public record TeamView(Long id, String name, String cohort, ProjectView project,
                           TeamMemberView lead, List<TeamMemberView> members, long milestonesCompleted,
                           long milestonesTotal, List<MilestoneView> milestones) {
    }

    public record QuestionView(Long id, String prompt, List<String> options) {

        public static QuestionView of(Question question) {
            return new QuestionView(question.getId(), question.getPrompt(), question.options());
        }
    }

    public record AssessmentView(Long id, String title, String moduleName, Instant dueDate,
                                 int totalMarks, boolean published, boolean resultsPublished,
                                 boolean submitted, Integer myScore, Integer myPercentage) {
    }

    public record SessionView(Long id, String title, String type, Instant startsAt, String cohort,
                              String programmeTitle, String meetingLink, String roomName,
                              boolean registered, long registeredCount) {

        public static SessionView of(EventSession session, boolean registered) {
            return new SessionView(session.getId(), session.getTitle(), session.getType().name(),
                    session.getStartsAt(), session.getCohort(),
                    session.getProgramme() == null ? null : session.getProgramme().getTitle(),
                    session.getMeetingLink(), session.getRoomName(), registered,
                    session.getRegistrations().size());
        }
    }

    public record CertificateView(Long id, String code, Long holderId, String holderName,
                                  String programmeLabel, Instant issuedAt) {

        public static CertificateView of(Certificate certificate) {
            return new CertificateView(certificate.getId(), certificate.getCode(),
                    certificate.getUser().getId(), certificate.getUser().getFullName(),
                    certificate.getProgrammeLabel(), certificate.getIssuedAt());
        }
    }

    public record MessageView(Long id, String senderName, Long senderId, String body, Instant sentAt) {

        public static MessageView of(Message message) {
            return new MessageView(message.getId(), message.getSender().getFullName(),
                    message.getSender().getId(), message.getBody(), message.getSentAt());
        }
    }

    public record ThreadView(Long id, String kind, String title, List<MessageView> messages,
                             boolean canReply, List<String> memberNames) {

        public static ThreadView of(MessageThread thread, boolean canReply) {
            return new ThreadView(thread.getId(), thread.getKind().name(), thread.getTitle(),
                    thread.getMessages().stream().map(MessageView::of).toList(), canReply,
                    thread.getMembers().stream().map(User::getFullName).toList());
        }
    }

    public record NotificationView(Long id, String category, String message, boolean read,
                                   Instant createdAt) {

        public static NotificationView of(Notification notification) {
            return new NotificationView(notification.getId(), notification.getCategory(),
                    notification.getMessage(), notification.isRead(), notification.getCreatedAt());
        }
    }

    public record AuditView(Long id, String actorName, String action, String targetType,
                            String details, Instant createdAt) {

        public static AuditView of(ug.yep.entity.AuditLog log) {
            return new AuditView(log.getId(), log.getActor() == null ? "System" : log.getActor().getFullName(),
                    log.getAction(), log.getTargetType(), log.getDetails(), log.getCreatedAt());
        }
    }

    public record PolicyView(int minAge, int maxAge, int level2MinCompletion,
                             int level2MinAssessment, int level2MinAttendance) {
    }

    /** Aggregated progress used by the participant dashboard. */
    public record ProgressView(int levelOnePercent, long completedLessons, long totalLessons,
                               int levelTwoPercent, boolean levelTwoUnlocked, boolean levelTwoEligible,
                               long milestonesCompleted, long milestonesTotal, int assessmentAverage,
                               int attendancePercent, boolean certificateEligible,
                               PolicyView policy, Map<String, Integer> modulePercents) {
    }
}
