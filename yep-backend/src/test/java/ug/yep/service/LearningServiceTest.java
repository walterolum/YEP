package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ug.yep.dto.Views;
import ug.yep.entity.Milestone;
import ug.yep.entity.Project;
import ug.yep.entity.Team;
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

/**
 * The dashboard combines lesson completion with the weighted overall score; the gate is one
 * number (default 80) and the certificate still needs both levels complete.
 */
class LearningServiceTest {

    private LessonRepository lessons;
    private LessonProgressRepository progress;
    private TeamRepository teams;
    private MilestoneRepository milestones;
    private SettingsService settings;
    private ProgressCalculator calculator;
    private LearningService service;

    @BeforeEach
    void setUp() {
        ModuleRepository modules = mock(ModuleRepository.class);
        lessons = mock(LessonRepository.class);
        progress = mock(LessonProgressRepository.class);
        settings = mock(SettingsService.class);
        calculator = mock(ProgressCalculator.class);
        teams = mock(TeamRepository.class);
        milestones = mock(MilestoneRepository.class);
        service = new LearningService(modules, lessons, progress,
                mock(MaterialRepository.class), teams, milestones,
                mock(SubmissionRepository.class), mock(AttendanceRepository.class),
                mock(AssessmentRepository.class), settings, mock(UserRepository.class), calculator);

        when(lessons.count()).thenReturn(15L);
        when(calculator.publishedLessonCount()).thenReturn(15L);
        when(settings.policy()).thenReturn(new SettingsService.Policy(18, 35, 80, 65, 75));
        when(modules.findAllByOrderBySortOrderAsc()).thenReturn(List.of());
        when(calculator.careerPathScores(anyLong())).thenReturn(Map.of());
        when(calculator.unlocksLevelTwo(80)).thenReturn(true);
        when(calculator.unlocksLevelTwo(79)).thenReturn(false);
    }

    @Test
    void eightyPercentOfLessonsIsReportedButIsNotEnoughOnItsOwn() {
        when(progress.countByUserId(2L)).thenReturn(12L);
        when(calculator.completedInPublishedCourses(2L)).thenReturn(12L);
        when(calculator.globalLessonPercent(2L)).thenReturn(80);
        when(calculator.assessmentAverage(2L)).thenReturn(0);
        when(calculator.attendancePercent(2L)).thenReturn(0);
        when(calculator.overall(80, 0, 0)).thenReturn(32);

        Views.ProgressView view = service.progress(2L);

        assertEquals(80, view.levelOnePercent());
        assertEquals(12, view.completedLessons());
        assertEquals(15, view.totalLessons());
        assertEquals(32, view.overallScore(), "40% of an 80% lesson rate with no other evidence");
        assertFalse(view.levelTwoUnlocked(), "The gate is the weighted overall score, not lessons alone");
    }

    @Test
    void overallScoreEightyUnlocksLevelTwo() {
        when(progress.countByUserId(2L)).thenReturn(12L);
        when(calculator.globalLessonPercent(2L)).thenReturn(70);
        when(calculator.assessmentAverage(2L)).thenReturn(90);
        when(calculator.attendancePercent(2L)).thenReturn(80);
        when(calculator.overall(70, 90, 80)).thenReturn(80);

        Views.ProgressView view = service.progress(2L);

        assertEquals(80, view.overallScore());
        assertTrue(view.levelTwoUnlocked());
        assertTrue(view.levelTwoEligible(), "80 overall and 90/70 clear the extra quality thresholds");
    }

    @Test
    void seventyNineOverallStaysLocked() {
        when(progress.countByUserId(3L)).thenReturn(11L);
        when(calculator.globalLessonPercent(3L)).thenReturn(73);
        when(calculator.assessmentAverage(3L)).thenReturn(85);
        when(calculator.attendancePercent(3L)).thenReturn(75);
        when(calculator.overall(73, 85, 75)).thenReturn(79);

        Views.ProgressView view = service.progress(3L);

        assertEquals(79, view.overallScore());
        assertFalse(view.levelTwoUnlocked());
        assertFalse(view.certificateEligible());
    }

    @Test
    void aLearnerAlreadyInLevelTwoIsNeverLockedOut() {
        Team team = mock(Team.class);
        Project project = mock(Project.class);
        Milestone milestone = mock(Milestone.class);
        when(team.getProject()).thenReturn(project);
        when(project.getId()).thenReturn(1L);
        when(milestone.isCompleted()).thenReturn(true);
        when(teams.findByMemberId(2L)).thenReturn(List.of(team));
        when(milestones.findByProjectIdOrderBySortOrderAsc(1L)).thenReturn(List.of(milestone));
        when(calculator.globalLessonPercent(2L)).thenReturn(100);
        when(calculator.assessmentAverage(2L)).thenReturn(77);
        when(calculator.attendancePercent(2L)).thenReturn(0);
        when(calculator.overall(100, 77, 0)).thenReturn(71);

        Views.ProgressView view = service.progress(2L);

        assertEquals(71, view.overallScore());
        assertTrue(view.levelTwoUnlocked(), "Level Two work already started stays open");
        assertEquals(100, view.levelTwoPercent());
    }

    @Test
    void certificateNeedsBothLevelsComplete() {
        when(calculator.globalLessonPercent(2L)).thenReturn(100);
        when(calculator.assessmentAverage(2L)).thenReturn(100);
        when(calculator.attendancePercent(2L)).thenReturn(100);
        when(calculator.overall(100, 100, 100)).thenReturn(100);
        when(progress.countByUserId(2L)).thenReturn(15L);

        Views.ProgressView view = service.progress(2L);

        assertEquals(100, view.levelOnePercent());
        assertEquals(0, view.levelTwoPercent(), "No team yet means Level Two is 0%");
        assertFalse(view.certificateEligible(), "Level Two must also be at 100%");
    }

    @Test
    void thresholdsComeFromSettings() {
        when(calculator.globalLessonPercent(2L)).thenReturn(80);

        Views.ProgressView view = service.progress(2L);

        assertEquals(80, view.policy().level2MinCompletion());
        assertEquals(65, view.policy().level2MinAssessment());
        assertEquals(75, view.policy().level2MinAttendance());
    }
}
