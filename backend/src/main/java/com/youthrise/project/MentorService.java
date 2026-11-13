package com.youthrise.project;

import com.youthrise.common.ApiException;
import com.youthrise.notification.NotificationKind;
import com.youthrise.notification.NotificationService;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MentorService {

    private final MentorFeedbackRepository feedback;
    private final TeamService teams;
    private final ProjectRepository projects;
    private final MilestoneRepository milestones;
    private final UserRepository users;
    private final NotificationService notifications;

    public MentorService(MentorFeedbackRepository feedback, TeamService teams, ProjectRepository projects,
                         MilestoneRepository milestones, UserRepository users,
                         NotificationService notifications) {
        this.feedback = feedback;
        this.teams = teams;
        this.projects = projects;
        this.milestones = milestones;
        this.users = users;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.MentorFeedbackResponse> list(UserPrincipal principal) {
        requireMentor(principal);
        List<MentorFeedback> result = principal.role() == Role.ADMIN
                ? feedback.findAllByOrderByCreatedAtDesc()
                : feedback.findByTeamMentorIdOrderByCreatedAtDesc(principal.id());
        return result.stream().map(ProjectDtos.MentorFeedbackResponse::from).toList();
    }

    @Transactional
    public ProjectDtos.MentorFeedbackResponse create(ProjectDtos.CreateFeedbackRequest request,
                                                     UserPrincipal principal) {
        requireMentor(principal);
        Team team = teams.requireAccessible(request.teamId(), principal);
        if (!teams.canManage(team, principal)) {
            throw ApiException.forbidden("FEEDBACK_NOT_ALLOWED",
                    "Only the assigned mentor, programme facilitator or an administrator can record feedback.");
        }
        Milestone milestone = null;
        if (request.milestoneId() != null && !request.milestoneId().isBlank()) {
            Project project = projects.findByTeamId(team.getId())
                    .orElseThrow(() -> ApiException.notFound("PROJECT_NOT_FOUND",
                            "No project is linked to this team yet."));
            milestone = milestones.findByIdAndProjectId(request.milestoneId(), project.getId())
                    .orElseThrow(() -> ApiException.notFound("MILESTONE_NOT_FOUND",
                            "That milestone does not belong to this team's project."));
        }
        User author = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        MentorFeedback entry = feedback.save(MentorFeedback.create(team, author, milestone, request.body()));
        for (User member : team.getMembers()) {
            notifications.notifyUser(member, "New mentor feedback",
                    "\"" + team.getName() + "\" received new feedback.",
                    "/app/projects", NotificationKind.FEEDBACK);
        }
        return ProjectDtos.MentorFeedbackResponse.from(entry);
    }

    private static void requireMentor(UserPrincipal principal) {
        if (principal.role() != Role.MENTOR && principal.role() != Role.ADMIN) {
            throw ApiException.forbidden("FORBIDDEN", "Only mentors can use the mentorship workspace.");
        }
    }
}
