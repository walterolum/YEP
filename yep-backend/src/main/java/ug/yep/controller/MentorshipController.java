package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.MentorshipService;

/** Participants request mentors; mentors accept, set progress and schedule meetings. */
@RestController
@RequestMapping("/api/mentorships")
public class MentorshipController {

    private final MentorshipService mentorships;

    public MentorshipController(MentorshipService mentorships) {
        this.mentorships = mentorships;
    }

    @PostMapping
    public Map<String, Object> request(@AuthenticationPrincipal CurrentUser actor,
                                       @RequestBody Map<String, Object> body) {
        Long mentorId = Long.valueOf(String.valueOf(body.get("mentorId")));
        return mentorships.request(actor.id(), mentorId,
                String.valueOf(body.getOrDefault("goal", "Career growth")),
                String.valueOf(body.getOrDefault("note", "")));
    }

    @GetMapping
    public List<Map<String, Object>> mine(@AuthenticationPrincipal CurrentUser actor) {
        if (actor.hasRole(Enums.Role.MENTOR, Enums.Role.ADMIN)) {
            return mentorships.forMentor(actor.id());
        }
        return mentorships.forMentee(actor.id());
    }

    @PutMapping("/{mentorshipId}")
    public Map<String, Object> decide(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long mentorshipId,
                                      @RequestBody Map<String, Object> body) {
        boolean accept = Boolean.parseBoolean(String.valueOf(body.getOrDefault("accept", true)));
        return mentorships.decide(actor.id(), mentorshipId, accept);
    }

    @PutMapping("/{mentorshipId}/progress")
    public Map<String, Object> progress(@AuthenticationPrincipal CurrentUser actor,
                                        @PathVariable Long mentorshipId,
                                        @Valid @RequestBody Requests.ProgressUpdateRequest request) {
        return mentorships.updateProgress(actor.id(), mentorshipId, request.progressPercent());
    }

    @PostMapping("/{mentorshipId}/sessions")
    public Map<String, Object> schedule(@AuthenticationPrincipal CurrentUser actor,
                                        @PathVariable Long mentorshipId,
                                        @Valid @RequestBody Requests.MentorSessionRequest request) {
        return mentorships.schedule(actor.id(), mentorshipId, request);
    }
}
