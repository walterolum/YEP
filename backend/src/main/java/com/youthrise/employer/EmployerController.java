package com.youthrise.employer;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EmployerController {

    private final EmployerService employers;

    public EmployerController(EmployerService employers) {
        this.employers = employers;
    }

    @GetMapping("/employer/talent")
    public List<EmployerDtos.TalentProfileResponse> search(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "skill", required = false) String skill,
            @RequestParam(value = "certificate", required = false) String certificate,
            @AuthenticationPrincipal UserPrincipal principal) {
        return employers.search(query, skill, certificate, principal);
    }

    @PutMapping("/employer/saved-talent/{userId}")
    public ResponseEntity<Void> save(@PathVariable String userId,
                                     @AuthenticationPrincipal UserPrincipal principal) {
        employers.toggleSaved(userId, true, principal);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/employer/saved-talent/{userId}")
    public ResponseEntity<Void> unsave(@PathVariable String userId,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        employers.toggleSaved(userId, false, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/employer/talent/{userId}/introductions")
    public ResponseEntity<Void> introduce(@PathVariable String userId,
                                          @Valid @RequestBody EmployerDtos.IntroductionRequest body,
                                          @AuthenticationPrincipal UserPrincipal principal) {
        employers.requestIntroduction(userId, body.note(), principal);
        return ResponseEntity.status(201).build();
    }

    /** Participants publish or update the opt-in profile employers can search. */
    @PutMapping("/me/talent-profile")
    public EmployerDtos.TalentProfileResponse publish(
            @Valid @RequestBody EmployerDtos.UpdateTalentProfileRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return employers.updateMine(body, principal);
    }
}
