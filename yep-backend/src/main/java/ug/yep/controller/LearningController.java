package ug.yep.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.DiscussionService;
import ug.yep.service.LearningService;

/** Level One learning: modules, lessons, progress, materials and discussions. */
@RestController
@RequestMapping("/api/learning")
public class LearningController {

    private final LearningService learning;
    private final DiscussionService discussions;

    public LearningController(LearningService learning, DiscussionService discussions) {
        this.learning = learning;
        this.discussions = discussions;
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
