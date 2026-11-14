package ug.yep.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Course;
import ug.yep.entity.CourseReview;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.CourseReviewRepository;
import ug.yep.repository.UserRepository;

/**
 * Learner ratings and reviews. Only an enrolled learner may review, one review per course,
 * and the course keeps a denormalised average so catalogue filters stay cheap.
 */
@Service
public class CourseReviewService {

    private final CourseReviewRepository reviews;
    private final CourseRepository courses;
    private final CourseEnrollmentRepository enrollments;
    private final UserRepository users;
    private final AuditService audit;

    public CourseReviewService(CourseReviewRepository reviews, CourseRepository courses,
                               CourseEnrollmentRepository enrollments, UserRepository users,
                               AuditService audit) {
        this.reviews = reviews;
        this.courses = courses;
        this.enrollments = enrollments;
        this.users = users;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public List<Views.CourseReviewView> list(String courseSlug) {
        Course course = publishedCourse(courseSlug);
        return reviews.findByCourseIdOrderByCreatedAtDesc(course.getId()).stream()
                .map(Views.CourseReviewView::of).toList();
    }

    /** Creating and editing are the same call: a second review replaces the first. */
    @Transactional
    public Views.CourseReviewView rate(Long userId, String courseSlug, Requests.CourseReviewRequest request) {
        Course course = publishedCourse(courseSlug);
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        if (!enrollments.existsByUserIdAndCourseId(userId, course.getId())) {
            throw new ForbiddenException("Enrol in this course before reviewing it.");
        }
        if (request.rating() < 1 || request.rating() > 5) {
            throw new BusinessRuleException("Choose a rating between 1 and 5.");
        }
        CourseReview review = reviews.findByUserIdAndCourseId(userId, course.getId())
                .orElseGet(() -> new CourseReview(course, user, request.rating(), request.body()));
        review.update(request.rating(), request.body());
        CourseReview saved = reviews.save(review);
        refreshRating(course);
        audit.record(user, "COURSE_REVIEW", "course", course.getId(),
                "Rated " + course.getCode() + " " + request.rating() + "/5");
        return Views.CourseReviewView.of(saved);
    }

    /** Recomputes the stored average from the rows that exist, never from client input. */
    private void refreshRating(Course course) {
        List<CourseReview> all = reviews.findByCourseIdOrderByCreatedAtDesc(course.getId());
        int count = all.size();
        double average = all.stream().mapToInt(CourseReview::getRating).average().orElse(0);
        course.updateRating(count, average);
        courses.save(course);
    }

    private Course publishedCourse(String slug) {
        return courses.findBySlug(slug)
                .filter(Course::isPublished)
                .orElseThrow(() -> new NotFoundException("Course"));
    }
}
