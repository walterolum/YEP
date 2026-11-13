package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.AssessmentService;

/** Quiz taking, submission and result publishing. */
@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessments;

    public AssessmentController(AssessmentService assessments) {
        this.assessments = assessments;
    }

    @GetMapping
    public List<Views.AssessmentView> list(@AuthenticationPrincipal CurrentUser actor) {
        if (actor.hasRole(Enums.Role.ADMIN, Enums.Role.FACILITATOR, Enums.Role.MENTOR)) {
            return assessments.all();
        }
        return assessments.forParticipant(actor.id());
    }

    @GetMapping("/{assessmentId}/questions")
    public List<Views.QuestionView> questions(@AuthenticationPrincipal CurrentUser actor,
                                              @PathVariable Long assessmentId) {
        return assessments.questionsFor(assessmentId, actor.id());
    }

    @PostMapping("/{assessmentId}/submit")
    public Map<String, Object> submit(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long assessmentId,
                                      @Valid @RequestBody Requests.SubmitAssessmentRequest request) {
        return assessments.submit(actor.id(), assessmentId, request);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR','MENTOR')")
    public Views.AssessmentView create(@Valid @RequestBody Requests.CreateAssessmentRequest request) {
        return assessments.create(request);
    }

    @PostMapping("/{assessmentId}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR')")
    public Views.AssessmentView publish(@AuthenticationPrincipal CurrentUser actor,
                                       @PathVariable Long assessmentId) {
        return assessments.publishResults(actor, assessmentId);
    }

    @GetMapping("/{assessmentId}/roster")
    public List<Map<String, Object>> roster(@AuthenticationPrincipal CurrentUser actor,
                                            @PathVariable Long assessmentId) {
        return assessments.roster(assessmentId, actor);
    }
}
