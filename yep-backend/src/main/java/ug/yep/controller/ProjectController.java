package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.ProjectService;

/** Level Two projects, teams and milestone tracking. */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projects;

    public ProjectController(ProjectService projects) {
        this.projects = projects;
    }

    @GetMapping
    public List<Views.ProjectView> all() {
        return projects.allProjects();
    }

    @GetMapping("/my-team")
    public Views.TeamView myTeam(@AuthenticationPrincipal CurrentUser actor) {
        return projects.teamForUser(actor.id());
    }

    @GetMapping("/teams")
    public List<Views.TeamView> teams(@AuthenticationPrincipal CurrentUser actor) {
        if (actor.hasRole(Enums.Role.ADMIN, Enums.Role.FACILITATOR, Enums.Role.MENTOR)) {
            return projects.allTeams();
        }
        return projects.teamsFor(actor.id());
    }

    @PutMapping("/milestones/{milestoneId}")
    public Views.MilestoneView toggle(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long milestoneId,
                                      @Valid @RequestBody Requests.MilestoneToggleRequest request) {
        return projects.toggleMilestone(actor.id(), milestoneId, request.completed());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Views.ProjectView create(@Valid @RequestBody Requests.CreateProjectRequest request) {
        return projects.createProject(request);
    }

    @PostMapping("/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR')")
    public Views.MilestoneView addMilestone(@PathVariable Long projectId,
                                            @RequestBody java.util.Map<String, String> body) {
        return projects.addMilestone(projectId, body.getOrDefault("title", "New milestone"));
    }
}
