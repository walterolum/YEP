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
import ug.yep.security.CurrentUser;
import ug.yep.service.FundingService;

/** Phase 5: financial aid, sponsorships, payment intents and course certificates. */
@RestController
@RequestMapping("/api")
public class FundingController {

    private final FundingService funding;

    public FundingController(FundingService funding) {
        this.funding = funding;
    }

    @PostMapping("/funding/aid")
    public Map<String, Object> apply(@AuthenticationPrincipal CurrentUser actor,
                                     @Valid @RequestBody Requests.AidRequest request) {
        return funding.applyForAid(actor.id(), request);
    }

    @GetMapping("/funding/aid")
    public List<Map<String, Object>> myApplications(@AuthenticationPrincipal CurrentUser actor) {
        return funding.aidFor(actor.id());
    }

    @GetMapping("/admin/funding/aid")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> aidQueue() {
        return funding.aidQueue();
    }

    @PostMapping("/admin/funding/aid/{applicationId}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> decide(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long applicationId,
                                      @Valid @RequestBody Requests.AidDecisionRequest request) {
        return funding.decideAid(actor.id(), applicationId, request.approved(), request.note());
    }

    @PostMapping("/funding/sponsorships")
    @PreAuthorize("hasAnyRole('SPONSOR','ADMIN')")
    public Map<String, Object> sponsor(@AuthenticationPrincipal CurrentUser actor,
                                       @Valid @RequestBody Requests.SponsorshipRequest request) {
        return funding.sponsor(actor.id(), request);
    }

    @GetMapping("/funding/sponsorships")
    public List<Map<String, Object>> mySponsorships(@AuthenticationPrincipal CurrentUser actor) {
        return funding.sponsorshipsFor(actor.id());
    }

    @PostMapping("/funding/payment-intents")
    public Map<String, Object> pay(@AuthenticationPrincipal CurrentUser actor,
                                   @Valid @RequestBody Requests.PaymentRequest request) {
        return funding.createPaymentIntent(actor.id(), request);
    }

    @GetMapping("/funding/payment-intents")
    public List<Map<String, Object>> myPayments(@AuthenticationPrincipal CurrentUser actor) {
        return funding.paymentsFor(actor.id());
    }

    @PostMapping("/admin/funding/payment-intents/{reference}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> confirm(@AuthenticationPrincipal CurrentUser actor,
                                       @PathVariable String reference) {
        return funding.confirmPayment(actor.id(), reference);
    }

    @PostMapping("/admin/certificates/course/{courseId}/learners/{learnerId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACILITATOR')")
    public Map<String, Object> issue(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long courseId, @PathVariable Long learnerId) {
        return funding.issueCourseCertificate(actor.id(), learnerId, courseId);
    }
}
