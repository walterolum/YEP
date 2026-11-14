package ug.yep.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Views;
import ug.yep.entity.Assessment;
import ug.yep.entity.Lesson;
import ug.yep.entity.LessonProgress;
import ug.yep.entity.Milestone;
import ug.yep.entity.Module;
import ug.yep.entity.Team;
import ug.yep.entity.User;
import ug.yep.exception.NotFoundException;
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
 * Level One and Level Two progress.
 *
 * <p>Level One is lessons completed / total lessons. Level Two is project milestones
 * completed / total milestones. Both are computed from the database, never stored as
 * editable numbers.</p>
 */
@Service
public class LearningService {

    private final ModuleRepository modules;
    private final LessonRepository lessons;
    private final LessonProgressRepository progress;
    private final MaterialRepository materials;
    private final TeamRepository teams;
    private final MilestoneRepository milestones;
    private final SubmissionRepository submissions;
    private final AttendanceRepository attendance;
    private final AssessmentRepository assessments;
    private final SettingsService settings;
    private final UserRepository users;
    private final ProgressCalculator calculator;

    public LearningService(ModuleRepository modules, LessonRepository lessons,
                           LessonProgressRepository progress, MaterialRepository materials,
                           TeamRepository teams, MilestoneRepository milestones,
                           SubmissionRepository submissions, AttendanceRepository attendance,
                           AssessmentRepository assessments, SettingsService settings,
                           UserRepository users, ProgressCalculator calculator) {
        this.modules = modules;
        this.lessons = lessons;
        this.progress = progress;
        this.materials = materials;
        this.teams = teams;
        this.milestones = milestones;
        this.submissions = submissions;
        this.attendance = attendance;
        this.assessments = assessments;
        this.settings = settings;
        this.users = users;
        this.calculator = calculator;
    }

    @Transactional(readOnly = true)
    public List<Views.ModuleView> modules(Long userId) {
        List<Views.ModuleView> views = new ArrayList<>();
        for (Module module : modules.findAllByOrderBySortOrderAsc()) {
            List<Lesson> moduleLessons = lessons.findByModuleIdOrderBySortOrderAsc(module.getId());
            List<Views.LessonView> lessonViews = new ArrayList<>();
            long done = 0;
            for (Lesson lesson : moduleLessons) {
                boolean completed = progress.findByUserIdAndLessonId(userId, lesson.getId()).isPresent();
                if (completed) {
                    done++;
                }
                lessonViews.add(Views.LessonView.of(lesson, completed));
            }
            int percent = moduleLessons.isEmpty() ? 0
                    : (int) Math.round(done * 100.0 / moduleLessons.size());
            views.add(new Views.ModuleView(module.getId(), module.getName(), module.getIcon(),
                    module.getOutcome(), moduleLessons.size(), done, percent, lessonViews));
        }
        return views;
    }

    @Transactional
    public Views.LessonView completeLesson(Long userId, Long lessonId, boolean completed) {
        Lesson lesson = lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Lesson"));
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        if (completed) {
            progress.findByUserIdAndLessonId(userId, lessonId)
                    .orElseGet(() -> progress.save(new LessonProgress(user, lesson)));
        } else {
            progress.deleteByUserIdAndLessonId(userId, lessonId);
        }
        return Views.LessonView.of(lesson, completed);
    }

    @Transactional(readOnly = true)
    public Views.ProgressView progress(Long userId) {
        SettingsService.Policy policy = settings.policy();
        long totalLessons = calculator.publishedLessonCount();
        long completedLessons = calculator.completedInPublishedCourses(userId);
        int levelOne = calculator.globalLessonPercent(userId);

        ProgressCounts levelTwo = levelTwoCounts(userId);
        int levelTwoPercent = levelTwo.total == 0 ? 0
                : (int) Math.round(levelTwo.completed * 100.0 / levelTwo.total);

        int assessmentAverage = calculator.assessmentAverage(userId);
        int attendancePercent = calculator.attendancePercent(userId);

        // One weighted score decides the gate; the extra thresholds remain as quality checks.
        int overallScore = calculator.overall(levelOne, assessmentAverage, attendancePercent);
        // The gate is monotonic: a learner who already holds a Level Two project is never
        // retroactively locked out by a later rule or weight change.
        boolean unlocked = calculator.unlocksLevelTwo(overallScore) || levelTwo.total > 0;
        boolean eligible = unlocked && assessmentAverage >= policy.level2MinAssessment()
                && attendancePercent >= policy.level2MinAttendance();

        Map<String, Integer> modulePercents = new LinkedHashMap<>();
        for (Views.ModuleView module : modules(userId)) {
            modulePercents.put(module.name(), module.percent());
        }

        return new Views.ProgressView(levelOne, completedLessons, totalLessons, levelTwoPercent,
                unlocked, eligible, levelTwo.completed, levelTwo.total, assessmentAverage,
                attendancePercent, levelOne == 100 && levelTwoPercent == 100,
                new Views.PolicyView(policy.minAge(), policy.maxAge(), policy.level2MinCompletion(),
                        policy.level2MinAssessment(), policy.level2MinAttendance()),
                modulePercents, overallScore, calculator.careerPathScores(userId));
    }

    /** Milestone totals across every project the participant's teams work on. */
    private ProgressCounts levelTwoCounts(Long userId) {
        long completed = 0;
        long total = 0;
        for (Team team : teams.findByMemberId(userId)) {
            if (team.getProject() == null) {
                continue;
            }
            List<Milestone> projectMilestones =
                    milestones.findByProjectIdOrderBySortOrderAsc(team.getProject().getId());
            total += projectMilestones.size();
            completed += projectMilestones.stream().filter(Milestone::isCompleted).count();
        }
        return new ProgressCounts(completed, total);
    }

    @Transactional(readOnly = true)
    public Views.LessonDetailView lessonDetail(Long userId, Long lessonId) {
        Lesson lesson = lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Lesson"));
        boolean completed = progress.findByUserIdAndLessonId(userId, lessonId).isPresent();
        return Views.LessonDetailView.of(lesson, completed);
    }

    @Transactional(readOnly = true)
    public List<Views.MaterialView> materials() {
        return materials.findAllByOrderByCreatedAtDesc().stream().map(Views.MaterialView::of).toList();
    }

    @Transactional(readOnly = true)
    public List<Assessment> publishedAssessments() {
        return assessments.findByPublishedTrueOrderByDueDateAsc();
    }

    private record ProgressCounts(long completed, long total) {
    }
}
