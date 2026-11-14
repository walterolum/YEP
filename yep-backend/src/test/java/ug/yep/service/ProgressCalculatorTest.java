package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.LessonProgressRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.SubmissionRepository;

/** Every score is derived from stored rows and the weights held in settings. */
class ProgressCalculatorTest {

    private LessonRepository lessons;
    private LessonProgressRepository progress;
    private AttendanceRepository attendance;
    private SettingsService settings;
    private ProgressCalculator calculator;

    @BeforeEach
    void setUp() {
        lessons = mock(LessonRepository.class);
        progress = mock(LessonProgressRepository.class);
        attendance = mock(AttendanceRepository.class);
        settings = mock(SettingsService.class);
        when(settings.weights()).thenReturn(new SettingsService.Weights(40, 40, 20));
        when(settings.policy()).thenReturn(new SettingsService.Policy(18, 35, 80, 65, 75));
        when(lessons.countInPublishedCourses()).thenReturn(15L);
        when(progress.countCompletedInPublishedCourses(anyLong())).thenReturn(0L);
        when(attendance.countByUserId(anyLong())).thenReturn(0L);
        calculator = new ProgressCalculator(lessons, progress, mock(SubmissionRepository.class),
                attendance, mock(CourseEnrollmentRepository.class), settings);
    }

    @Test
    void overallScoreUsesTheConfiguredWeights() {
        assertEquals(78, calculator.overall(80, 90, 50));
    }

    @Test
    void lessonsAloneNoLongerUnlockLevelTwo() {
        when(progress.countCompletedInPublishedCourses(2L)).thenReturn(15L);

        assertEquals(100, calculator.globalLessonPercent(2L));
        assertEquals(40, calculator.overallScore(2L));
        assertFalse(calculator.unlocksLevelTwo(calculator.overallScore(2L)));
    }

    @Test
    void eightyOverallUnlocksAndSeventyNineDoesNot() {
        assertTrue(calculator.unlocksLevelTwo(80));
        assertFalse(calculator.unlocksLevelTwo(79));
    }

    @Test
    void draftCourseLessonsDoNotDiluteTheGlobalPercentage() {
        // Fifteen lessons are published; the learner finished all of them. A new draft course
        // adds lessons to the table but must not change this percentage.
        when(progress.countCompletedInPublishedCourses(2L)).thenReturn(15L);

        assertEquals(100, calculator.globalLessonPercent(2L));
    }

    @Test
    void attendanceIsPresentDividedByMarked() {
        when(attendance.countByUserId(3L)).thenReturn(4L);
        when(attendance.countByUserIdAndPresentTrue(3L)).thenReturn(3L);

        assertEquals(75, calculator.attendancePercent(3L));
    }

    @Test
    void courseLessonPercentIsScopedToTheCourse() {
        when(progress.countCompletedInCourse(2L, 7L)).thenReturn(1L);
        when(lessons.countByModuleCourseId(7L)).thenReturn(4L);

        assertEquals(25, calculator.courseLessonPercent(2L, 7L));
    }

    @Test
    void careerPathPercentIsScopedToThePath() {
        when(progress.countCompletedInCareerPath(2L, 3L)).thenReturn(2L);
        when(lessons.countByModuleCourseCareerPathId(3L)).thenReturn(8L);

        assertEquals(25, calculator.careerPathLessonPercent(2L, 3L));
    }

    @Test
    void noEnrolmentsMeansNoPathScores() {
        assertEquals(List.of(), List.copyOf(calculator.careerPathScores(9L).keySet()));
    }
}
