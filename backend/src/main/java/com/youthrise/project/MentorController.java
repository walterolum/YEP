package com.youthrise.project;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mentor")
public class MentorController {

    private final MentorService mentorships;
    private final ProjectService projects;

    public MentorController(MentorService mentorships, ProjectService projects) {
        this.mentorships = mentorships;
        this.projects = projects;
    }

    @GetMapping("/feedback")
    public List<ProjectDtos.MentorFeedbackResponse> feedback(@AuthenticationPrincipal UserPrincipal principal) {
        return mentorships.list(principal);
    }

    @PostMapping("/feedback")
    public ResponseEntity<ProjectDtos.MentorFeedbackResponse> addFeedback(
            @Valid @RequestBody ProjectDtos.CreateFeedbackRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorships.create(body, principal));
    }

    /** Review queue for the mentor workspace; a documented extension to the original contract. */
    @GetMapping("/submissions")
    public List<ProjectDtos.SubmissionResponse> submissions(@AuthenticationPrincipal UserPrincipal principal) {
        return projects.listForMentor(principal.id());
    }
}
