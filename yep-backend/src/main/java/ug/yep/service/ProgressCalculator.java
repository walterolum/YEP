package ug.yep.service;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.Assessment;
import ug.yep.entity.CareerPath;
import ug.yep.entity.CourseEnrollment;
import ug.yep.entity.Submission;
import ug.yep.repository.AttendanceRepository;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.LessonProgressRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.SubmissionRepository;

/**
 * Derives every learner score from stored rows: lesson completion, assessment average,
 * attendance and the weighted overall score. Nothing here is editable state, so a score can
 * never drift away from the data behind it.
 */
@Service
public class ProgressCalculator {

    private final LessonRepository lessons;
    private final LessonProgressRepository progress;
    private final SubmissionRepository submissions;
    private final AttendanceRepository attendance;
    private final CourseEnrollmentRepository enrollments;
    private final SettingsService settings;

    public ProgressCalculator(LessonRepository lessons, LessonProgressRepository progress,
                              SubmissionRepository submissions, AttendanceRepository attendance,
                              CourseEnrollmentRepository enrollments, SettingsService settings) {
        this.lessons = lessons;
        this.progress = progress;
        this.submissions = submissions;
        this.attendance = attendance;
        this.enrollments = enrollments;
        this.settings = settings;
    }

    @Transactional(readOnly = true)
    public int globalLessonPercent(Long userId) {
        return ProgressScoring.percent(completedInPublishedCourses(userId), publishedLessonCount());
    }

    /** Denominator for the global percentage: lessons in published courses only. */
    @Transactional(readOnly = true)
    public long publishedLessonCount() {
        return lessons.countInPublishedCourses();
    }

    @Transactional(readOnly = true)
    public long completedInPublishedCourses(Long userId) {
        return progress.countCompletedInPublishedCourses(userId);
    }

    @Transactional(readOnly = true)
    public int courseLessonPercent(Long userId, Long courseId) {
        return ProgressScoring.percent(progress.countCompletedInCourse(userId, courseId),
                lessons.countByModuleCourseId(courseId));
    }

    @Transactional(readOnly = true)
    public int careerPathLessonPercent(Long userId, Long careerPathId) {
        return ProgressScoring.percent(progress.countCompletedInCareerPath(userId, careerPathId),
                lessons.countByModuleCourseCareerPathId(careerPathId));
    }

    /** Mean percentage of every scored assessment; 0 when the learner has none. */
    @Transactional(readOnly = true)
    public int assessmentAverage(Long userId) {
        List<Submission> scored = submissions.findByUserIdOrderBySubmittedAtDesc(userId).stream()
                .filter(submission -> submission.getScore() != null)
                .toList();
        if (scored.isEmpty()) {
            return 0;
        }
        double total = 0;
        for (Submission submission : scored) {
            Assessment assessment = submission.getAssessment();
            total += assessment.percentage(submission.getScore());
        }
        return ProgressScoring.percentClamped((int) Math.round(total / scored.size()));
    }

    @Transactional(readOnly = true)
    public int attendancePercent(Long userId) {
        long total = attendance.countByUserId(userId);
        if (total == 0) {
            return 0;
        }
        return ProgressScoring.percentClamped(
                (int) Math.round(attendance.countByUserIdAndPresentTrue(userId) * 100.0 / total));
    }

    @Transactional(readOnly = true)
    public int overallScore(Long userId) {
        return overall(globalLessonPercent(userId), assessmentAverage(userId), attendancePercent(userId));
    }

    @Transactional(readOnly = true)
    public int courseScore(Long userId, Long courseId) {
        return overall(courseLessonPercent(userId, courseId), assessmentAverage(userId),
                attendancePercent(userId));
    }

    @Transactional(readOnly = true)
    public int careerPathScore(Long userId, Long careerPathId) {
        return overall(careerPathLessonPercent(userId, careerPathId), assessmentAverage(userId),
                attendancePercent(userId));
    }

    /**
     * Path-scoped score for every career path the learner is enrolled in, keyed by path title.
     * Duplicate paths are resolved once.
     */
    @Transactional(readOnly = true)
    public Map<String, Integer> careerPathScores(Long userId) {
        Map<String, Integer> scores = new LinkedHashMap<>();
        Set<Long> seen = new HashSet<>();
        for (CourseEnrollment enrollment : enrollments.findByUserIdOrderByEnrolledAtDesc(userId)) {
            CareerPath path = enrollment.getCourse().getCareerPath();
            if (!seen.add(path.getId())) {
                continue;
            }
            scores.put(path.getTitle(), careerPathScore(userId, path.getId()));
        }
        return scores;
    }

    /** One weighted score from the three inputs, using the weights held in settings. */
    public int overall(int lessonsPercent, int assessmentPercent, int attendancePercent) {
        SettingsService.Weights weights = settings.weights();
        return ProgressScoring.overall(lessonsPercent, assessmentPercent, attendancePercent,
                weights.lessons(), weights.assessments(), weights.attendance());
    }

    /** True when the overall score reaches the Level Two threshold in settings. */
    public boolean unlocksLevelTwo(int overallScore) {
        return overallScore >= settings.policy().level2MinCompletion();
    }
}
