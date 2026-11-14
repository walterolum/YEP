package ug.yep.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.Test;

/** A completed enrolment must not stay completed when a learner reopens a lesson. */
class CourseEnrollmentTest {

    @Test
    void completingThenReopeningRestoresTheEnrolledStatus() {
        CourseEnrollment enrollment = new CourseEnrollment(mock(User.class), mock(Course.class));
        assertEquals(Enums.CourseEnrollmentStatus.ENROLLED, enrollment.getStatus());

        enrollment.complete();
        assertEquals(Enums.CourseEnrollmentStatus.COMPLETED, enrollment.getStatus());
        assertNotNull(enrollment.getCompletedAt());

        enrollment.reopen();
        assertEquals(Enums.CourseEnrollmentStatus.ENROLLED, enrollment.getStatus());
        assertNull(enrollment.getCompletedAt());
    }

    @Test
    void reopeningAnActiveEnrolmentChangesNothing() {
        CourseEnrollment enrollment = new CourseEnrollment(mock(User.class), mock(Course.class));
        enrollment.reopen();

        assertEquals(Enums.CourseEnrollmentStatus.ENROLLED, enrollment.getStatus());
        assertNull(enrollment.getCompletedAt());
    }

    @Test
    void resumePointerIsIgnoredWhenNullOrUpdatedWhenPresent() {
        CourseEnrollment enrollment = new CourseEnrollment(mock(User.class), mock(Course.class));
        enrollment.resumeAt(null);
        assertNull(enrollment.getLastLessonId());

        enrollment.resumeAt(7L);
        assertEquals(7L, enrollment.getLastLessonId());
    }
}
