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
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.repository.AssessmentRepository;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.LessonProgressRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.MaterialRepository;
import ug.yep.repository.MilestoneRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.SubmissionRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;

/** Level One percentage, the 80% unlock and the certificate gate are all derived, not stored. */
class LearningServiceTest {

    private ModuleRepository modules;
    private LessonRepository lessons;
    private LessonProgressRepository progress;
    private SubmissionRepository submissions;
    private AttendanceRepository attendance;
    private SettingsService settings;
    private LearningService service;

    @BeforeEach
    void setUp() {
        modules = mock(ModuleRepository.class);
        lessons = mock(LessonRepository.class);
        progress = mock(LessonProgressRepository.class);
        submissions = mock(SubmissionRepository.class);
        attendance = mock(AttendanceRepository.class);
        settings = mock(SettingsService.class);
        service = new LearningService(modules, lessons, progress,
                mock(MaterialRepository.class), mock(TeamRepository.class), mock(MilestoneRepository.class),
                submissions, attendance, mock(AssessmentRepository.class), settings, mock(UserRepository.class));

        when(lessons.count()).thenReturn(15L);
        when(settings.policy()).thenReturn(new SettingsService.Policy(18, 35, 80, 65, 75));
        when(modules.findAllByOrderBySortOrderAsc()).thenReturn(List.of());
        when(submissions.findByUserIdOrderBySubmittedAtDesc(anyLong())).thenReturn(List.of());
        when(attendance.countByUserId(anyLong())).thenReturn(0L);
    }

    @Test
    void twelveOfFifteenLessonsIsEightyPercentAndUnlocksLevelTwo() {
        when(progress.countByUserId(2L)).thenReturn(12L);

        Views.ProgressView view = service.progress(2L);

        assertEquals(80, view.levelOnePercent());
        assertEquals(12, view.completedLessons());
        assertEquals(15, view.totalLessons());
        assertTrue(view.levelTwoUnlocked());
    }

    @Test
    void fourOfFifteenDoesNotUnlockLevelTwo() {
        when(progress.countByUserId(3L)).thenReturn(4L);

        Views.ProgressView view = service.progress(3L);

        assertEquals(27, view.levelOnePercent());
        assertFalse(view.levelTwoUnlocked());
        assertFalse(view.certificateEligible());
    }

    @Test
    void certificateNeedsBothLevelsComplete() {
        when(progress.countByUserId(2L)).thenReturn(15L);

        Views.ProgressView view = service.progress(2L);

        assertEquals(100, view.levelOnePercent());
        assertEquals(0, view.levelTwoPercent(), "No team yet means Level Two is 0%");
        assertFalse(view.certificateEligible(), "Level Two must also be at 100%");
    }

    @Test
    void thresholdsComeFromSettings() {
        when(progress.countByUserId(2L)).thenReturn(12L);

        Views.ProgressView view = service.progress(2L);

        assertEquals(80, view.policy().level2MinCompletion());
        assertEquals(65, view.policy().level2MinAssessment());
        assertEquals(75, view.policy().level2MinAttendance());
        assertFalse(view.levelTwoEligible(), "No assessments or attendance means eligibility is not met");
    }
}
