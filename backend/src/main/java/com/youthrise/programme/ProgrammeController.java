package com.youthrise.programme;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.youthrise.user.UserPrincipal;

@RestController
@RequestMapping("/api")
public class ProgrammeController {

    private final ProgrammeService programmeService;

    public ProgrammeController(ProgrammeService programmeService) {
        this.programmeService = programmeService;
    }

    @GetMapping("/programmes")
    public List<ProgrammeDtos.ProgrammeResponse> list() {
        return programmeService.listPublic();
    }

    @GetMapping("/programmes/{id}")
    public ProgrammeDtos.ProgrammeResponse get(@PathVariable String id) {
        return programmeService.getPublic(id);
    }

    @PostMapping("/programmes/{id}/enrolments")
    public ProgrammeDtos.EnrolmentResponse enrol(@PathVariable String id,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.enrol(id, principal);
    }

    @GetMapping("/programmes/{id}/modules")
    public List<ProgrammeDtos.LearningModuleResponse> modules(@PathVariable String id,
                                                              @AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.getModules(id, principal);
    }

    @GetMapping("/me/enrolments")
    public List<ProgrammeDtos.EnrolmentResponse> myEnrolments(@AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.listEnrolments(principal.id());
    }

    @GetMapping("/me/progress")
    public List<String> progress(@RequestParam String programmeId,
                                 @AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.getProgress(programmeId, principal.id());
    }

    @PostMapping("/programmes/{id}/lessons/{lessonId}/complete")
    public ProgrammeDtos.CompletedLessonsResponse completeLesson(@PathVariable String id,
                                                                 @PathVariable String lessonId,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return programmeService.completeLesson(id, lessonId, principal);
    }
}
