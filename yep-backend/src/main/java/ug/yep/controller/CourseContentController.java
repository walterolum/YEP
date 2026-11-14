package ug.yep.controller;

import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.CourseContentService;

/** Course player: outline, per-course progress and lesson completion. */
@RestController
@RequestMapping("/api")
public class CourseContentController {

    private final CourseContentService content;

    public CourseContentController(CourseContentService content) {
        this.content = content;
    }

    /** Anonymous callers get the outline without their own progress. */
    @GetMapping("/courses/{slug}/outline")
    public Views.CourseOutlineView outline(@PathVariable String slug,
                                           @AuthenticationPrincipal CurrentUser actor) {
        return content.outline(actor == null ? null : actor.id(), slug);
    }

    @GetMapping("/me/course-progress")
    public List<Views.CourseProgressView> myProgress(@AuthenticationPrincipal CurrentUser actor) {
        return content.myCourseProgress(actor.id());
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public Views.ModuleView complete(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long courseId,
                                     @PathVariable Long lessonId) {
        return content.markLesson(actor.id(), courseId, lessonId, true);
    }

    @DeleteMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public Views.ModuleView reopen(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable Long courseId,
                                   @PathVariable Long lessonId) {
        return content.markLesson(actor.id(), courseId, lessonId, false);
    }
}
