package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Academy;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.CourseReview;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.CourseReviewRepository;
import ug.yep.repository.UserRepository;

/** Only enrolled learners review, one review each, and the course average is recomputed. */
class CourseReviewServiceTest {

    private CourseReviewRepository reviews;
    private CourseRepository courses;
    private CourseEnrollmentRepository enrollments;
    private CourseReviewService service;
    private Course course;
    private User learner;

    @BeforeEach
    void setUp() {
        reviews = mock(CourseReviewRepository.class);
        courses = mock(CourseRepository.class);
        enrollments = mock(CourseEnrollmentRepository.class);
        UserRepository users = mock(UserRepository.class);
        service = new CourseReviewService(reviews, courses, enrollments, users, mock(AuditService.class));

        CareerPath path = new CareerPath(new Academy("Tech & Digital", "tech-digital"),
                "Software Development", "software-development");
        course = new Course(path, "TECH-WEB-L1", "Web", "web-development-fundamentals", 1);
        course.setPublished(true);
        ReflectionTestUtils.setField(course, "id", 2L);
        when(courses.findBySlug("web-development-fundamentals")).thenReturn(Optional.of(course));
        when(courses.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        learner = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(learner, "id", 2L);
        when(users.findById(2L)).thenReturn(Optional.of(learner));
        ReflectionTestUtils.setField(learner, "id", 2L);
    }

    @Test
    void anUnenrolledLearnerCannotReview() {
        when(enrollments.existsByUserIdAndCourseId(2L, 2L)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> service.rate(2L, "web-development-fundamentals",
                new Requests.CourseReviewRequest(5, "Great")));
    }

    @Test
    void savingAReviewRecomputesTheStoredAverage() {
        when(enrollments.existsByUserIdAndCourseId(2L, 2L)).thenReturn(true);
        when(reviews.findByUserIdAndCourseId(2L, 2L)).thenReturn(Optional.empty());
        when(reviews.save(any(CourseReview.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CourseReview other = new CourseReview(course, learner, 3, "ok");
        CourseReview mine = new CourseReview(course, learner, 5, "great");
        when(reviews.findByCourseIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(mine, other));

        service.rate(2L, "web-development-fundamentals", new Requests.CourseReviewRequest(5, "great"));

        assertEquals(2, course.getRatingCount());
        assertEquals(4.0, course.getRatingAverage(), 0.001);
        verify(courses).save(course);
    }
}
