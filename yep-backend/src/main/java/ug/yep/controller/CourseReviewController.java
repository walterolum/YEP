package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.CourseReviewService;

/** Ratings and reviews on a published course. Reading is public; rating needs enrolment. */
@RestController
@RequestMapping("/api/courses/{slug}/reviews")
public class CourseReviewController {

    private final CourseReviewService reviews;

    public CourseReviewController(CourseReviewService reviews) {
        this.reviews = reviews;
    }

    @GetMapping
    public List<Views.CourseReviewView> list(@PathVariable String slug) {
        return reviews.list(slug);
    }

    @PostMapping
    public Views.CourseReviewView rate(@AuthenticationPrincipal CurrentUser actor,
                                       @PathVariable String slug,
                                       @Valid @RequestBody Requests.CourseReviewRequest request) {
        return reviews.rate(actor.id(), slug, request);
    }
}
