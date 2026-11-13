package ug.yep.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.entity.Milestone;
import ug.yep.entity.Project;
import ug.yep.entity.Team;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.MilestoneRepository;
import ug.yep.repository.ProjectRepository;
import ug.yep.repository.TeamRepository;

/** Level Two projects, teams and milestones. */
@Service
public class ProjectService {

    private final ProjectRepository projects;
    private final TeamRepository teams;
    private final MilestoneRepository milestones;
    private final ug.yep.repository.UserRepository users;

    public ProjectService(ProjectRepository projects, TeamRepository teams,
                          MilestoneRepository milestones, ug.yep.repository.UserRepository users) {
        this.projects = projects;
        this.teams = teams;
        this.milestones = milestones;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<Views.ProjectView> allProjects() {
        return projects.findAllByOrderByCreatedAtDesc().stream().map(Views.ProjectView::of).toList();
    }

    @Transactional
    public Views.ProjectView createProject(Requests.CreateProjectRequest request) {
        Project project = new Project(request.title(), request.category(), request.description());
        project.moveTo(Enums.ProjectStatus.APPROVED);
        projects.save(project);
        if (request.milestones() != null) {
            int order = 1;
            for (String title : request.milestones()) {
                if (title != null && !title.isBlank()) {
                    milestones.save(new Milestone(project, title.trim(), order++));
                }
            }
        }
        return Views.ProjectView.of(project);
    }

    @Transactional
    public Views.MilestoneView addMilestone(Long projectId, String title) {
        Project project = projects.findById(projectId).orElseThrow(() -> new NotFoundException("Project"));
        int order = milestones.findByProjectIdOrderBySortOrderAsc(projectId).size() + 1;
        Milestone milestone = milestones.save(new Milestone(project, title, order));
        return Views.MilestoneView.of(milestone);
    }

    @Transactional(readOnly = true)
    public List<Views.TeamView> allTeams() {
        return teams.findAllByOrderByNameAsc().stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public List<Views.TeamView> teamsFor(Long userId) {
        return teams.findByMemberId(userId).stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public Views.TeamView teamForUser(Long userId) {
        List<Team> member = teams.findByMemberId(userId);
        return member.isEmpty() ? null : toView(member.get(0));
    }

    @Transactional(readOnly = true)
    public List<Views.TeamView> teamsForMentor(Long mentorId) {
        return teams.findByMentorIdOrderByNameAsc(mentorId).stream().map(this::toView).toList();
    }

    @Transactional
    public Views.MilestoneView toggleMilestone(Long userId, Long milestoneId, boolean completed) {
        Milestone milestone = milestones.findById(milestoneId)
                .orElseThrow(() -> new NotFoundException("Milestone"));
        List<Team> memberTeams = teams.findByMemberId(userId);
        boolean member = memberTeams.stream()
                .anyMatch(team -> team.getProject() != null
                        && team.getProject().getId().equals(milestone.getProject().getId()));
        if (!member) {
            throw new ForbiddenException("Only members of the team can update its milestones.");
        }
        milestone.toggle(completed);
        if (milestone.getProject() != null) {
            long total = milestones.countByProjectId(milestone.getProject().getId());
            long done = milestones.countByProjectIdAndCompletedTrue(milestone.getProject().getId());
            if (total > 0 && done == total) {
                milestone.getProject().moveTo(Enums.ProjectStatus.COMPLETED);
            } else if (done > 0) {
                milestone.getProject().moveTo(Enums.ProjectStatus.IN_PROGRESS);
            }
        }
        return Views.MilestoneView.of(milestone);
    }

    @Transactional(readOnly = true)
    public Views.TeamView toView(Team team) {
        List<Milestone> projectMilestones = team.getProject() == null ? List.of()
                : milestones.findByProjectIdOrderBySortOrderAsc(team.getProject().getId());
        List<Views.MilestoneView> milestoneViews = new ArrayList<>();
        projectMilestones.forEach(milestone -> milestoneViews.add(Views.MilestoneView.of(milestone)));
        long completed = projectMilestones.stream().filter(Milestone::isCompleted).count();
        List<Views.TeamMemberView> members = team.getMembers().stream()
                .map(user -> Views.TeamMemberView.of(user, team.isLead(user.getId())))
                .toList();
        Views.TeamMemberView lead = team.getLead() == null ? null
                : Views.TeamMemberView.of(team.getLead(), true);
        return new Views.TeamView(team.getId(), team.getName(), team.getCohort(),
                team.getProject() == null ? null : Views.ProjectView.of(team.getProject()),
                lead, members, completed, projectMilestones.size(), milestoneViews);
    }

    @Transactional
    public Views.TeamView createTeam(Requests.CreateTeamRequest request) {
        if (request.memberIds().size() < 2) {
            throw new BusinessRuleException("A Level Two team needs at least two participants.");
        }
        Project project = request.projectId() == null ? null
                : projects.findById(request.projectId()).orElseThrow(() -> new NotFoundException("Project"));
        ug.yep.entity.User lead = users.findById(request.leadUserId())
                .orElseThrow(() -> new NotFoundException("Team lead"));
        if (!request.memberIds().contains(request.leadUserId())) {
            throw new BusinessRuleException("The team lead must also be a team member.");
        }
        if (project != null && teams.findByProjectId(project.getId()).isPresent()) {
            throw new BusinessRuleException("That project is already assigned to another team.");
        }
        Team team = new Team(request.name(), project, lead, request.cohort());
        for (Long memberId : request.memberIds()) {
            users.findById(memberId).ifPresent(team::addMember);
        }
        if (request.mentorId() != null) {
            team.setMentor(users.findById(request.mentorId()).orElse(null));
        }
        if (request.facilitatorId() != null) {
            team.setFacilitator(users.findById(request.facilitatorId()).orElse(null));
        }
        return toView(teams.save(team));
    }
}
