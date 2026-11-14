package ug.yep.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.DiscussionService;
import ug.yep.service.LearningExperienceService;
import ug.yep.service.LearningService;

/** Level One learning: modules, lessons, progress, materials and discussions. */
@RestController
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learning;
    private final DiscussionService discussions;
    private final LearningExperienceService experience;

    public LearningController(LearningService learning, DiscussionService discussions,
                              LearningExperienceService experience) {
        this.learning = learning;
        this.discussions = discussions;
        this.experience = experience;
    }

    /** Everything the lesson reader needs beyond the lesson body. */
    @GetMapping("/lessons/{lessonId}/extras")
    public Views.LessonExtrasView extras(@AuthenticationPrincipal CurrentUser actor,
                                         @PathVariable Long lessonId) {
        Views.CodingExerciseView exercise = null;
        try {
            exercise = experience.exercise(actor.id(), lessonId);
        } catch (ug.yep.exception.NotFoundException ignored) {
            // most lessons have no coding exercise
        }
        return new Views.LessonExtrasView(experience.note(actor.id(), lessonId),
                experience.lessonPosts(lessonId), experience.practice(lessonId), exercise,
                experience.profile(actor.id()));
    }

    @PutMapping("/lessons/{lessonId}/note")
    public Views.NoteView saveNote(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable Long lessonId,
                                   @Valid @RequestBody Requests.NoteRequest request) {
        return experience.saveNote(actor.id(), lessonId, request.body());
    }

    @PostMapping("/lessons/{lessonId}/posts")
    public Views.LessonPostView post(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long lessonId,
                                     @Valid @RequestBody Requests.LessonPostRequest request) {
        return experience.addPost(actor.id(), lessonId, request.body());
    }

    @PostMapping("/lessons/{lessonId}/practice")
    public Views.PracticeResultView practice(@AuthenticationPrincipal CurrentUser actor,
                                             @PathVariable Long lessonId,
                                             @Valid @RequestBody Requests.PracticeRequest request) {
        return experience.answer(actor.id(), request.questionId(), request.choice());
    }

    @GetMapping("/courses/{courseId}/mastery")
    public Views.MasteryView mastery(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long courseId) {
        return experience.mastery(actor.id(), courseId);
    }

    @GetMapping("/profile")
    public Views.LearningProfileView profile(@AuthenticationPrincipal CurrentUser actor) {
        return experience.profile(actor.id());
    }

    @PostMapping("/coding/{exerciseId}/submit")
    public Views.CodeRunView submitCode(@AuthenticationPrincipal CurrentUser actor,
                                        @PathVariable Long exerciseId,
                                        @Valid @RequestBody Requests.CodeRequest request) {
        return experience.submitCode(actor.id(), exerciseId, request.code());
    }

    @PostMapping("/assessments/{assessmentId}/attempts")
    public Views.AttemptView startAttempt(@AuthenticationPrincipal CurrentUser actor,
                                          @PathVariable Long assessmentId) {
        return experience.startAttempt(actor.id(), assessmentId);
    }

    @GetMapping("/assessments/{assessmentId}/attempts")
    public List<Views.AttemptView> attempts(@AuthenticationPrincipal CurrentUser actor,
                                            @PathVariable Long assessmentId) {
        return experience.attempts(actor.id(), assessmentId);
    }

    @GetMapping("/modules")
    public List<Views.ModuleView> modules(@AuthenticationPrincipal CurrentUser actor) {
        return learning.modules(actor.id());
    }

    @GetMapping("/progress")
    public Views.ProgressView progress(@AuthenticationPrincipal CurrentUser actor) {
        return learning.progress(actor.id());
    }

    @GetMapping("/lessons/{lessonId}")
    public Views.LessonDetailView lesson(@AuthenticationPrincipal CurrentUser actor,
                                         @PathVariable Long lessonId) {
        return learning.lessonDetail(actor.id(), lessonId);
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public Views.LessonView complete(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long lessonId) {
        return learning.completeLesson(actor.id(), lessonId, true);
    }

    @DeleteMapping("/lessons/{lessonId}/complete")
    public Views.LessonView reopen(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable Long lessonId) {
        return learning.completeLesson(actor.id(), lessonId, false);
    }

    @GetMapping("/materials")
    public List<Views.MaterialView> materials() {
        return learning.materials();
    }

    @GetMapping("/discussions")
    public List<Map<String, Object>> discussions() {
        return discussions.threads();
    }

    @PostMapping("/discussions")
    public Map<String, Object> startDiscussion(@AuthenticationPrincipal CurrentUser actor,
                                               @RequestBody Map<String, String> body) {
        return discussions.startThread(actor.id(), body.getOrDefault("title", "Untitled discussion"),
                body.getOrDefault("body", ""));
    }

    @PostMapping("/discussions/{threadId}/posts")
    public Map<String, Object> reply(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long threadId,
                                     @RequestBody Map<String, String> body) {
        return discussions.reply(threadId, actor.id(), body.getOrDefault("body", ""));
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping(@AuthenticationPrincipal CurrentUser actor) {
        return ResponseEntity.ok(Map.of("ok", true, "role", actor.role().name()));
    }
}
