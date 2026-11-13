package com.youthrise.project;

import com.youthrise.common.ApiException;
import com.youthrise.common.exception.TeamCapacityExceededException;
import com.youthrise.common.exception.TeamAccessDeniedException;
import com.youthrise.badge.BadgeService;
import com.youthrise.notification.NotificationKind;
import com.youthrise.notification.NotificationService;
import com.youthrise.programme.Enrolment;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.EnrolmentStatus;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeamService {

    /** Level Two teams stay small enough for every member to contribute. */
    public static final int DEFAULT_TEAM_CAPACITY = 5;

    private final TeamRepository teams;
    private final UserRepository users;
    private final ProgrammeRepository programmes;
    private final EnrolmentRepository enrolments;
    private final NotificationService notifications;
    private final BadgeService badges;

    public TeamService(TeamRepository teams, UserRepository users, ProgrammeRepository programmes,
                       EnrolmentRepository enrolments, NotificationService notifications,
                       BadgeService badges) {
        this.teams = teams;
        this.users = users;
        this.programmes = programmes;
        this.enrolments = enrolments;
        this.notifications = notifications;
        this.badges = badges;
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.TeamResponse> listForUser(String userId) {
        return teams.findForMember(userId).stream().map(ProjectDtos.TeamResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ProjectDtos.TeamResponse> listForMentor(String mentorId) {
        return teams.findByMentorIdOrderByNameAsc(mentorId).stream()
                .map(ProjectDtos.TeamResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDtos.TeamResponse get(String teamId, UserPrincipal principal) {
        return ProjectDtos.TeamResponse.from(requireAccessible(teamId, principal));
    }

    /**
     * Forms a Level Two team. The creator becomes its lead, so a team is never
     * left without someone accountable for submissions.
     */
    @Transactional
    public ProjectDtos.TeamResponse createTeam(ProjectDtos.CreateTeamRequest request, UserPrincipal principal) {
        User creator = requireUser(principal.id());
        if (!creator.isEligibleForLevelTwo()) {
            throw ApiException.forbidden("LEVEL_TWO_ONLY",
                    "Only youth participants can form Level Two teams.");
        }
        Programme programme = programmes.findById(request.programmeId())
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        if (programme.getLevel() != 2) {
            throw ApiException.validation("programmeId",
                    "Teams are formed inside Level Two programmes.");
        }
        Enrolment enrolment = enrolments
                .findByProgrammeIdAndUserId(programme.getId(), creator.getId())
                .orElseThrow(() -> ApiException.forbidden("ENROLMENT_REQUIRED",
                        "Join the programme before forming a team."));
        if (enrolment.getStatus() == EnrolmentStatus.WITHDRAWN) {
            throw ApiException.forbidden("ENROLMENT_REQUIRED",
                    "Your enrolment in this programme has been withdrawn.");
        }
        String name = request.name().trim();
        if (teams.existsByProgrammeIdAndNameIgnoreCase(programme.getId(), name)) {
            throw ApiException.conflict("TEAM_NAME_TAKEN",
                    "Another team in this programme already uses that name.");
        }

        Team team = Team.create(programme, name, request.theme(), DEFAULT_TEAM_CAPACITY, null);
        team = teams.saveAndFlush(team);
        team.addMember(creator, TeamMemberRole.LEAD);
        badges.awardIfMissing(creator, BadgeService.TEAM_PLAYER, creator, "Formed a Level Two team.");
        return ProjectDtos.TeamResponse.from(team);
    }

    /**
     * Participants who are enrolled in a programme but not yet placed on any of
     * its teams, so a facilitator can select people rather than hunt by email.
     * Only the programme's facilitator or an administrator may call this.
     */
    @Transactional(readOnly = true)
    public List<ProjectDtos.ParticipantCandidateResponse> unassignedParticipants(String programmeId,
                                                                              UserPrincipal principal) {
        Programme programme = programmes.findById(programmeId)
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        boolean owner = programme.getFacilitator() != null
                && programme.getFacilitator().getId().equals(principal.id());
        if (principal.role() != Role.ADMIN && !(principal.role() == Role.FACILITATOR && owner)) {
            throw ApiException.forbidden("FORBIDDEN",
                    "Only the programme facilitator or an administrator can select participants.");
        }
        java.util.Set<String> placed = new java.util.HashSet<>();
        for (Team team : teams.findByProgrammeId(programmeId)) {
            team.getMembers().forEach(member -> placed.add(member.getId()));
        }
        return enrolments.findByProgrammeId(programmeId).stream()
                .filter(enrolment -> enrolment.getStatus() != EnrolmentStatus.WITHDRAWN)
                .filter(enrolment -> !placed.contains(enrolment.getUser().getId()))
                .map(enrolment -> new ProjectDtos.ParticipantCandidateResponse(
                        enrolment.getUser().getId(),
                        enrolment.getUser().getFullName(),
                        enrolment.getUser().getInitials(),
                        enrolment.getUser().getCountry(),
                        enrolment.getEnrolledAt()))
                .toList();
    }

    /**
     * Adds several selected participants to one team in a single action. All
     * checks run before any member is written, so a partial roster is impossible.
     */
    @Transactional
    public ProjectDtos.TeamResponse addMembers(String teamId, ProjectDtos.BulkAddMembersRequest request,
                                               UserPrincipal principal) {
        Team team = requireAccessible(teamId, principal);
        User actor = requireUser(principal.id());
        requireMemberManager(team, actor);
        if (team.getMemberships().size() + request.userIds().size() > team.getCapacity()) {
            throw new TeamCapacityExceededException(team.getCapacity());
        }
        java.util.List<User> targets = new java.util.ArrayList<>();
        for (String userId : request.userIds()) {
            User target = requireUser(userId);
            if (!target.isEligibleForLevelTwo()) {
                throw ApiException.validation("userIds", "Only youth participants can join a team.");
            }
            if (team.hasMember(target.getId())) {
                throw ApiException.conflict("ALREADY_TEAM_MEMBER",
                        target.getFullName() + " is already on this team.");
            }
            if (enrolments.findByProgrammeIdAndUserId(team.getProgramme().getId(), target.getId()).isEmpty()) {
                throw ApiException.validation("userIds",
                        target.getFullName() + " is not enrolled in this programme.");
            }
            targets.add(target);
        }
        for (User target : targets) {
            team.addMember(target, request.role());
            badges.awardIfMissing(target, BadgeService.TEAM_PLAYER, actor, "Joined a Level Two team.");
            notifications.notifyUser(target, "You joined " + team.getName(),
                    "You were added to a Level Two team as " + request.role().name().toLowerCase() + ".",
                    "/app/team", NotificationKind.ANNOUNCEMENT);
        }
        return ProjectDtos.TeamResponse.from(team);
    }

    /**
     * Adds a participant to a team. Only the team lead, the assigned mentor, the
     * programme facilitator or an administrator may do this.
     */
    @Transactional
    public ProjectDtos.TeamResponse addMember(String teamId, ProjectDtos.AddTeamMemberRequest request,
                                              UserPrincipal principal) {
        Team team = requireAccessible(teamId, principal);
        User actor = requireUser(principal.id());
        requireMemberManager(team, actor);

        User target = resolveParticipant(request);
        String field = hasText(request.email()) ? "email" : "userId";
        if (!target.isEligibleForLevelTwo()) {
            throw ApiException.validation(field, "Only youth participants can join a team.");
        }
        if (team.hasMember(target.getId())) {
            throw ApiException.conflict("ALREADY_TEAM_MEMBER", "That person is already on this team.");
        }
        if (team.getMemberships().size() >= team.getCapacity()) {
            throw new TeamCapacityExceededException(team.getCapacity());
        }
        if (enrolments.findByProgrammeIdAndUserId(team.getProgramme().getId(), target.getId()).isEmpty()) {
            throw ApiException.validation(field,
                    "That participant is not enrolled in this programme.");
        }

        team.addMember(target, request.role());
        badges.awardIfMissing(target, BadgeService.TEAM_PLAYER, actor, "Joined a Level Two team.");
        notifications.notifyUser(target, "You joined " + team.getName(),
                "You were added to a Level Two team as " + request.role().name().toLowerCase() + ".",
                "/app/team", NotificationKind.ANNOUNCEMENT);
        return ProjectDtos.TeamResponse.from(team);
    }

    @Transactional
    public ProjectDtos.TeamResponse changeMemberRole(String teamId, String userId,
                                                     ProjectDtos.ChangeTeamMemberRoleRequest request,
                                                     UserPrincipal principal) {
        Team team = requireAccessible(teamId, principal);
        User actor = requireUser(principal.id());
        requireMemberManager(team, actor);

        if (!team.hasMember(userId)) {
            throw ApiException.notFound("TEAM_MEMBER_NOT_FOUND", "That person is not on this team.");
        }
        if (request.role() != TeamMemberRole.LEAD && isOnlyLead(team, userId)) {
            throw ApiException.conflict("LEAD_REQUIRED",
                    "Promote another member to lead before changing this one.");
        }
        team.changeMemberRole(userId, request.role());
        return ProjectDtos.TeamResponse.from(team);
    }

    @Transactional
    public ProjectDtos.TeamResponse removeMember(String teamId, String userId, UserPrincipal principal) {
        Team team = requireAccessible(teamId, principal);
        User actor = requireUser(principal.id());
        requireMemberManager(team, actor);

        if (!team.hasMember(userId)) {
            throw ApiException.notFound("TEAM_MEMBER_NOT_FOUND", "That person is not on this team.");
        }
        if (isOnlyLead(team, userId)) {
            throw ApiException.conflict("LEAD_REQUIRED",
                    "A team needs a lead. Promote another member first.");
        }
        team.removeMember(userId);
        return ProjectDtos.TeamResponse.from(team);
    }

    @Transactional
    public void postMessage(String teamId, String body, UserPrincipal principal) {
        Team team = requireAccessible(teamId, principal);
        if (body == null || body.isBlank()) {
            throw ApiException.validation("body", "Write a message before sending.");
        }
        User author = requireUser(principal.id());
        team.postMessage(author, body);
    }

    /**
     * Team data is visible to members, the assigned mentor, the programme
     * facilitator and administrators. Every other caller is rejected, so a
     * changed URL cannot expose another team's work.
     */
    @Transactional(readOnly = true)
    public Team requireAccessible(String teamId, UserPrincipal principal) {
        Team team = teams.findById(teamId)
                .orElseThrow(() -> ApiException.notFound("TEAM_NOT_FOUND", "That team could not be found."));
        if (canAccess(team, principal)) {
            return team;
        }
        throw new TeamAccessDeniedException();
    }

    public boolean canAccess(Team team, UserPrincipal principal) {
        if (principal.role() == Role.ADMIN) {
            return true;
        }
        if (team.hasMember(principal.id()) || team.isMentor(principal.id())) {
            return true;
        }
        Programme programme = team.getProgramme();
        return principal.role() == Role.FACILITATOR
                && programme.getFacilitator() != null
                && programme.getFacilitator().getId().equals(principal.id());
    }

    /** Reviewing work and recording mentor feedback require a staff relationship with the team. */
    public boolean canManage(Team team, UserPrincipal principal) {
        if (principal.role() == Role.ADMIN) {
            return true;
        }
        if (team.isMentor(principal.id())) {
            return true;
        }
        return principal.role() == Role.FACILITATOR
                && team.getProgramme().getFacilitator() != null
                && team.getProgramme().getFacilitator().getId().equals(principal.id());
    }

    private void requireMemberManager(Team team, User actor) {
        if (!canManageMembers(team, actor)) {
            throw ApiException.forbidden("TEAM_MANAGE_DENIED",
                    "Only the team lead, mentor, facilitator or an administrator can manage members.");
        }
    }

    /** Polymorphic: each account class decides what it may do. */
    private boolean canManageMembers(Team team, User actor) {
        if (actor.canAdminister() || team.isLead(actor.getId()) || team.isMentor(actor.getId())) {
            return true;
        }
        return actor.canFacilitate()
                && team.getProgramme().getFacilitator() != null
                && team.getProgramme().getFacilitator().getId().equals(actor.getId());
    }

    private static boolean isOnlyLead(Team team, String userId) {
        long leads = team.getMemberships().stream()
                .filter(member -> member.getRole() == TeamMemberRole.LEAD)
                .count();
        return team.isLead(userId) && leads == 1;
    }

    /**
     * Resolves the person named by the request. Email lookup keeps the flow
     * privacy-preserving: a lead must already know the address, and no endpoint
     * reveals whether other addresses exist beyond this single check.
     */
    private User resolveParticipant(ProjectDtos.AddTeamMemberRequest request) {
        if (hasText(request.userId())) {
            return requireUser(request.userId());
        }
        if (hasText(request.email())) {
            return users.findByEmailIgnoreCase(request.email().trim())
                    .orElseThrow(() -> ApiException.validation("email",
                            "No participant account uses that email address."));
        }
        throw ApiException.validation("email",
                "Enter the participant's email address or account id.");
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private User requireUser(String userId) {
        return users.findById(userId)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
    }
}
