package com.youthrise.discussion;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Level One discussion endpoints, scoped to programme membership. */
@RestController
@RequestMapping("/api")
public class DiscussionController {

    private final DiscussionService discussions;

    public DiscussionController(DiscussionService discussions) {
        this.discussions = discussions;
    }

    @GetMapping("/programmes/{programmeId}/discussions")
    public List<DiscussionDtos.DiscussionResponse> list(@PathVariable String programmeId,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return discussions.listForProgramme(programmeId, principal);
    }

    @PostMapping("/programmes/{programmeId}/discussions")
    public ResponseEntity<DiscussionDtos.DiscussionResponse> open(
            @PathVariable String programmeId,
            @Valid @RequestBody DiscussionDtos.CreateDiscussionRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(discussions.open(programmeId, body, principal));
    }

    @PostMapping("/discussions/{id}/messages")
    public ResponseEntity<DiscussionDtos.MessageResponse> reply(
            @PathVariable String id,
            @Valid @RequestBody DiscussionDtos.ReplyRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(discussions.reply(id, body, principal));
    }

    @PatchMapping("/discussions/{id}")
    public ResponseEntity<Void> moderate(@PathVariable String id,
                                         @RequestParam boolean pinned,
                                         @RequestParam boolean locked,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        discussions.moderate(id, pinned, locked, principal);
        return ResponseEntity.noContent().build();
    }
}
