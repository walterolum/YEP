package com.youthrise.project;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private final ProjectService projects;

    public ProjectController(ProjectService projects) {
        this.projects = projects;
    }

    @GetMapping("/teams/{teamId}/project")
    public ProjectDtos.ProjectResponse getByTeam(@PathVariable String teamId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return projects.getByTeam(teamId, principal);
    }

    @PostMapping("/teams/{teamId}/project")
    public ResponseEntity<ProjectDtos.ProjectResponse> createProject(
            @PathVariable String teamId,
            @Valid @RequestBody ProjectDtos.CreateProjectRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectDtos.ProjectResponse created = projects.createProject(teamId, body, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/teams/{teamId}/milestones/{milestoneId}")
    public ProjectDtos.ProjectResponse updateMilestone(
            @PathVariable String teamId,
            @PathVariable String milestoneId,
            @Valid @RequestBody ProjectDtos.UpdateMilestoneRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return projects.startMilestone(teamId, milestoneId, body.status(), principal);
    }

    @PostMapping(path = "/teams/{teamId}/milestones/{milestoneId}/evidence",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProjectDtos.SubmissionResponse submitEvidence(
            @PathVariable String teamId,
            @PathVariable String milestoneId,
            @RequestParam(value = "note", required = false) String note,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        return projects.submitEvidence(teamId, milestoneId, note, file, principal);
    }

    @PostMapping("/submissions/{id}/review")
    public ResponseEntity<Void> review(@PathVariable String id,
                                       @Valid @RequestBody ProjectDtos.ReviewRequest body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        projects.review(id, body, principal);
        return ResponseEntity.noContent().build();
    }
}
