package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.repository.PledgeRepository;
import ug.yep.security.CurrentUser;
import ug.yep.service.AdminService;
import ug.yep.service.DashboardService;

/** Sponsor portal: impact figures, pledges and enquiries. */
@RestController
@RequestMapping("/api/sponsor")
public class SponsorController {

    private final PledgeRepository pledges;
    private final AdminService admin;
    private final DashboardService dashboard;

    public SponsorController(PledgeRepository pledges, AdminService admin,
                             DashboardService dashboard) {
        this.pledges = pledges;
        this.admin = admin;
        this.dashboard = dashboard;
    }

    @GetMapping("/impact")
    public Map<String, Object> impact(@AuthenticationPrincipal CurrentUser actor) {
        Map<String, Object> stats = dashboard.sponsor(actor.id());
        stats.put("myPledges", pledges.findBySponsorIdOrderByPledgedAtDesc(actor.id()).size());
        stats.put("myTotalUgx", pledges.totalForSponsor(actor.id()));
        return stats;
    }

    @GetMapping("/pledges")
    public List<java.util.Map<String, Object>> myPledges(@AuthenticationPrincipal CurrentUser actor) {
        return pledges.findBySponsorIdOrderByPledgedAtDesc(actor.id()).stream()
                .map(pledge -> java.util.Map.<String, Object>of(
                        "id", pledge.getId(),
                        "projectTitle", pledge.getProjectTitle() == null ? "General fund" : pledge.getProjectTitle(),
                        "amountUgx", pledge.getAmountUgx(),
                        "status", pledge.getStatus().name(),
                        "pledgedAt", pledge.getPledgedAt().toString()))
                .toList();
    }

    @PostMapping("/pledges")
    public Map<String, Object> pledge(@AuthenticationPrincipal CurrentUser actor,
                                      @Valid @RequestBody Requests.PledgeRequest request) {
        return admin.addPledge(actor, request);
    }

    @GetMapping("/partners")
    public List<Map<String, Object>> partners() {
        return admin.partners();
    }
}
