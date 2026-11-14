package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.security.CurrentUser;
import ug.yep.service.CareersService;

/** Phase 6: the jobs board, employer screening, saved jobs and portfolios. */
@RestController
@RequestMapping("/api")
public class CareersController {

    private final CareersService careers;

    public CareersController(CareersService careers) {
        this.careers = careers;
    }

    @GetMapping("/jobs")
    public List<Map<String, Object>> jobs() {
        return careers.openJobs();
    }

    @GetMapping("/employer/jobs")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public List<Map<String, Object>> myJobs(@AuthenticationPrincipal CurrentUser actor) {
        return careers.employerJobs(actor.id());
    }

    @PostMapping("/employer/jobs")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public Map<String, Object> post(@AuthenticationPrincipal CurrentUser actor,
                                    @Valid @RequestBody Requests.JobRequest request) {
        return careers.post(actor.id(), request);
    }

    @PostMapping("/employer/jobs/{postingId}/close")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public Map<String, Object> close(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long postingId) {
        return careers.close(actor.id(), postingId);
    }

    @PostMapping("/jobs/{postingId}/apply")
    public Map<String, Object> apply(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long postingId,
                                     @Valid @RequestBody Requests.JobApplyRequest request) {
        return careers.apply(actor.id(), postingId, request);
    }

    @GetMapping("/me/job-applications")
    public List<Map<String, Object>> myApplications(@AuthenticationPrincipal CurrentUser actor) {
        return careers.myApplications(actor.id());
    }

    @GetMapping("/employer/jobs/{postingId}/applicants")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public List<Map<String, Object>> applicants(@AuthenticationPrincipal CurrentUser actor,
                                                @PathVariable Long postingId) {
        return careers.applicants(actor.id(), postingId);
    }

    @PostMapping("/employer/applications/{applicationId}/decision")
    @PreAuthorize("hasAnyRole('EMPLOYER','ADMIN')")
    public Map<String, Object> decide(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long applicationId,
                                      @Valid @RequestBody Requests.JobDecisionRequest request) {
        return careers.decide(actor.id(), applicationId, request.status());
    }

    @PostMapping("/jobs/{postingId}/save")
    public Map<String, Object> save(@AuthenticationPrincipal CurrentUser actor,
                                    @PathVariable Long postingId) {
        return careers.saveJob(actor.id(), postingId);
    }

    @DeleteMapping("/jobs/{postingId}/save")
    public Map<String, Object> unsave(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long postingId) {
        return careers.unsaveJob(actor.id(), postingId);
    }

    @GetMapping("/me/saved-jobs")
    public List<Map<String, Object>> saved(@AuthenticationPrincipal CurrentUser actor) {
        return careers.savedJobs(actor.id());
    }

    @GetMapping("/me/portfolio")
    public List<Map<String, Object>> portfolio(@AuthenticationPrincipal CurrentUser actor) {
        return careers.portfolio(actor.id());
    }

    @PostMapping("/me/portfolio")
    public Map<String, Object> addPortfolio(@AuthenticationPrincipal CurrentUser actor,
                                            @Valid @RequestBody Requests.PortfolioRequest request) {
        return careers.addPortfolio(actor.id(), request);
    }

    @DeleteMapping("/me/portfolio/{itemId}")
    public Map<String, Object> removePortfolio(@AuthenticationPrincipal CurrentUser actor,
                                               @PathVariable Long itemId) {
        careers.removePortfolio(actor.id(), itemId);
        return Map.of("removed", true, "id", itemId);
    }
}
