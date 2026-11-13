package com.youthrise.programme;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/facilitator")
public class FacilitatorController {

    private final ProgrammeService programmeService;

    public FacilitatorController(ProgrammeService programmeService) {
        this.programmeService = programmeService;
    }

    @GetMapping("/programmes")
    public List<ProgrammeDtos.ProgrammeResponse> programmes(@AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.listForFacilitator(principal);
    }

    @PostMapping("/programmes")
    public ResponseEntity<ProgrammeDtos.ProgrammeResponse> createProgramme(
            @Valid @RequestBody ProgrammeDtos.CreateProgrammeRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(programmeService.createProgramme(body, principal));
    }

    @GetMapping("/modules")
    public List<ProgrammeDtos.LearningModuleResponse> modules(@AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.listModulesForFacilitator(principal);
    }

    @PatchMapping("/modules/{id}/status")
    public ResponseEntity<Void> updateModuleStatus(@PathVariable String id,
                                                   @Valid @RequestBody ProgrammeDtos.UpdateModuleStatusRequest body,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        programmeService.updateModuleStatus(id, body.status(), principal);
        return ResponseEntity.noContent().build();
    }
}
