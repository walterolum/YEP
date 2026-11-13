package com.youthrise.partner;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partner")
public class PartnerController {

    private final PartnerService partners;

    public PartnerController(PartnerService partners) {
        this.partners = partners;
    }

    @GetMapping("/nominations")
    public List<PartnerDtos.NominationResponse> nominations(@AuthenticationPrincipal UserPrincipal principal) {
        return partners.listNominations(principal);
    }

    @PostMapping("/nominations")
    public ResponseEntity<PartnerDtos.NominationResponse> nominate(
            @Valid @RequestBody PartnerDtos.CreateNominationRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partners.nominate(body, principal));
    }

    @PostMapping("/programmes/{programmeId}/briefing-requests")
    public ResponseEntity<Void> requestBriefing(@PathVariable String programmeId,
                                                @Valid @RequestBody PartnerDtos.BriefingRequestPayload body,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        partners.requestBriefing(programmeId, body, principal);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
