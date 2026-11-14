package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.CourseContentService;

/**
 * Course content authoring. Administrators and facilitators only (enforced by SecurityConfig
 * and again in the service, so a stale token cannot bypass a role change).
 */
@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final CourseContentService content;

    public ContentController(CourseContentService content) {
        this.content = content;
    }

    @GetMapping("/courses/{courseId}/outline")
    public Views.CourseOutlineView outline(@AuthenticationPrincipal CurrentUser actor,
                                           @PathVariable Long courseId) {
        return content.authoringOutline(actor.id(), courseId);
    }

    @PostMapping("/courses/{courseId}/modules")
    public ResponseEntity<Views.ModuleView> createModule(
            @AuthenticationPrincipal CurrentUser actor,
            @PathVariable Long courseId,
            @Valid @RequestBody Requests.ModuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(content.createModule(actor.id(),
                new Requests.ModuleRequest(courseId, request.name(), request.icon(),
                        request.outcome(), request.sortOrder(), request.level())));
    }

    @PutMapping("/modules/{moduleId}")
    public Views.ModuleView updateModule(@AuthenticationPrincipal CurrentUser actor,
                                         @PathVariable Long moduleId,
                                         @Valid @RequestBody Requests.ModuleRequest request) {
        return content.updateModule(actor.id(), moduleId, request);
    }

    @DeleteMapping("/modules/{moduleId}")
    public Map<String, Object> deleteModule(@AuthenticationPrincipal CurrentUser actor,
                                            @PathVariable Long moduleId) {
        content.deleteModule(actor.id(), moduleId);
        return Map.of("deleted", true);
    }

    @PostMapping("/modules/{moduleId}/lessons")
    public ResponseEntity<Views.LessonView> createLesson(
            @AuthenticationPrincipal CurrentUser actor,
            @PathVariable Long moduleId,
            @Valid @RequestBody Requests.LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(content.createLesson(actor.id(),
                new Requests.LessonRequest(moduleId, request.title(), request.type(),
                        request.sortOrder(), request.content(), request.durationMinutes())));
    }

    @PutMapping("/lessons/{lessonId}")
    public Views.LessonView updateLesson(@AuthenticationPrincipal CurrentUser actor,
                                         @PathVariable Long lessonId,
                                         @Valid @RequestBody Requests.LessonRequest request) {
        return content.updateLesson(actor.id(), lessonId, request);
    }

    @DeleteMapping("/lessons/{lessonId}")
    public Map<String, Object> deleteLesson(@AuthenticationPrincipal CurrentUser actor,
                                            @PathVariable Long lessonId) {
        content.deleteLesson(actor.id(), lessonId);
        return Map.of("deleted", true);
    }
}
