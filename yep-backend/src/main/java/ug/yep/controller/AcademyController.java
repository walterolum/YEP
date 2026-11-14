package ug.yep.controller;

import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.CatalogService;

/**
 * Academy catalogue: readable by anyone, enrolment limited to signed-in participants.
 *
 * <p>The GET routes are deliberately anonymous so the landing page and public
 * academy pages can be shared before somebody registers.</p>
 */
@RestController
@RequestMapping("/api")
public class AcademyController {

    private final CatalogService catalog;

    public AcademyController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/academies")
    public List<Views.AcademyView> academies() {
        return catalog.publishedAcademies();
    }

    @GetMapping("/academies/{slug}")
    public Views.AcademyDetailView academy(@PathVariable String slug) {
        return catalog.academyDetail(slug);
    }

    @GetMapping("/courses")
    public List<Views.CourseView> courses(@RequestParam(required = false) String academy,
                                          @RequestParam(required = false) Integer level,
                                          @RequestParam(required = false) String q,
                                          @AuthenticationPrincipal CurrentUser actor) {
        return catalog.searchCourses(academy, level, q, actor == null ? null : actor.id());
    }

    @GetMapping("/courses/{slug}")
    public Views.CourseView course(@PathVariable String slug,
                                   @AuthenticationPrincipal CurrentUser actor) {
        return catalog.courseDetail(slug, actor == null ? null : actor.id());
    }

    @GetMapping("/me/enrollments")
    public List<Views.EnrollmentView> myEnrollments(@AuthenticationPrincipal CurrentUser actor) {
        return catalog.myEnrollments(actor.id());
    }

    @PostMapping("/courses/{courseId}/enrol")
    public Views.EnrollmentView enrol(@AuthenticationPrincipal CurrentUser actor,
                                      @PathVariable Long courseId) {
        return catalog.enroll(actor.id(), courseId);
    }
}
