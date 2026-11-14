package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.service.ImpactService;

/** Phase 6: impact reporting for admins, sponsors and partners. */
@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    private final ImpactService impact;

    public ImpactController(ImpactService impact) {
        this.impact = impact;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','SPONSOR','PARTNER','FACILITATOR')")
    public Map<String, Object> summary() {
        return impact.summary();
    }

    @PostMapping("/records")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> add(@Valid @RequestBody Requests.ImpactRequest request) {
        return impact.addRecord(request);
    }
}
