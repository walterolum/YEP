package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.CatalogService;
import ug.yep.service.CourseWorkflowService;
import ug.yep.service.RoleWorkspaceService;

/**
 * Instructor, reviewer and employer workspaces. Role enforcement lives in
 * {@code SecurityConfig}; the payloads only ever contain what that role needs.
 */
@RestController
public class RoleWorkspaceController {

    private final CatalogService catalog;
    private final RoleWorkspaceService workspace;
    private final CourseWorkflowService workflow;

    public RoleWorkspaceController(CatalogService catalog, RoleWorkspaceService workspace,
                                   CourseWorkflowService workflow) {
        this.catalog = catalog;
        this.workspace = workspace;
        this.workflow = workflow;
    }

    @GetMapping("/api/instructor/courses")
    public List<Views.CourseView> instructorCourses() {
        return catalog.adminCourses();
    }

    @GetMapping("/api/instructor/my-courses")
    public List<Views.CourseView> myCourses(@AuthenticationPrincipal CurrentUser actor) {
        return workflow.myCourses(actor.id());
    }

    /** Career-path options for the "new course" form. */
    @GetMapping("/api/instructor/catalogue")
    public List<Views.AcademyDetailView> instructorCatalogue() {
        return catalog.adminCatalogue();
    }

    @PostMapping("/api/instructor/courses")
    public ResponseEntity<Views.CourseView> createDraft(@AuthenticationPrincipal CurrentUser actor,
                                                        @Valid @RequestBody Requests.InstructorCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workflow.createDraft(actor.id(), request));
    }

    @PostMapping("/api/instructor/courses/{courseId}/submit")
    public Views.CourseView submit(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable Long courseId) {
        return workflow.submit(actor.id(), courseId);
    }

    @GetMapping("/api/instructor/stats")
    public Map<String, Object> instructorStats() {
        return workspace.stats();
    }

    @GetMapping("/api/reviewer/courses")
    public List<Views.CourseView> reviewerCourses() {
        return catalog.adminCourses();
    }

    @GetMapping("/api/reviewer/submissions")
    public List<Views.CourseView> submissions() {
        return workflow.submissions();
    }

    @PostMapping("/api/reviewer/submissions/{courseId}/decision")
    public Views.CourseView decide(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable Long courseId,
                                   @Valid @RequestBody Requests.CourseDecisionRequest request) {
        return workflow.decide(actor.id(), courseId, request);
    }

    @GetMapping("/api/reviewer/stats")
    public Map<String, Object> reviewerStats() {
        return workspace.stats();
    }

    @GetMapping("/api/employer/stats")
    public Map<String, Object> employerStats() {
        return workspace.stats();
    }
}
