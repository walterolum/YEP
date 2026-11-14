package ug.yep.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Course;
import ug.yep.entity.CourseEnrollment;
import ug.yep.entity.Enums;
import ug.yep.entity.Lesson;
import ug.yep.entity.LessonProgress;
import ug.yep.entity.Module;
import ug.yep.entity.Project;
import ug.yep.entity.Team;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.LessonProgressRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;

/**
 * Course → module → lesson content and the learner's course player.
 *
 * <p>Content is data: an administrator or facilitator publishes modules and lessons through this
 * service, so a new course never needs a code change. Lesson completion stays derived from
 * {@code lesson_progress}; the enrolment only stores where the learner stopped.</p>
 */
@Service
public class CourseContentService {

    private final CourseRepository courses;
    private final ModuleRepository modules;
    private final LessonRepository lessons;
    private final LessonProgressRepository progress;
    private final CourseEnrollmentRepository enrollments;
    private final TeamRepository teams;
    private final UserRepository users;
    private final CatalogService catalog;
    private final ProgressCalculator calculator;
    private final AuditService audit;

    public CourseContentService(CourseRepository courses, ModuleRepository modules,
                                LessonRepository lessons, LessonProgressRepository progress,
                                CourseEnrollmentRepository enrollments, TeamRepository teams,
                                UserRepository users, CatalogService catalog,
                                ProgressCalculator calculator, AuditService audit) {
        this.courses = courses;
        this.modules = modules;
        this.lessons = lessons;
        this.progress = progress;
        this.enrollments = enrollments;
        this.teams = teams;
        this.users = users;
        this.catalog = catalog;
        this.calculator = calculator;
        this.audit = audit;
    }

    // ------------------------------------------------------------------ learner read

    /** The player outline: modules, lessons, completion, resume point and Level Two project link. */
    @Transactional(readOnly = true)
    public Views.CourseOutlineView outline(Long userId, String slug) {
        Course course = courses.findBySlug(slug)
                .filter(Course::isPublished)
                .orElseThrow(() -> new NotFoundException("Course"));
        return outlineOf(userId, course);
    }

    /** Authoring view of the same outline, including drafts and modules not yet published. */
    @Transactional(readOnly = true)
    public Views.CourseOutlineView authoringOutline(Long actorId, Long courseId) {
        requireContentAuthor(actorId);
        Course course = courses.findById(courseId).orElseThrow(() -> new NotFoundException("Course"));
        return outlineOf(null, course);
    }

    private Views.CourseOutlineView outlineOf(Long userId, Course course) {
        List<Views.ModuleView> moduleViews = new ArrayList<>();
        long totalLessons = 0;
        long completedLessons = 0;
        for (Module module : modules.findByCourseIdOrderBySortOrderAsc(course.getId())) {
            List<Views.LessonView> lessonViews = new ArrayList<>();
            List<Lesson> moduleLessons = lessons.findByModuleIdOrderBySortOrderAsc(module.getId());
            long done = 0;
            for (Lesson lesson : moduleLessons) {
                boolean completed = userId != null
                        && progress.findByUserIdAndLessonId(userId, lesson.getId()).isPresent();
                if (completed) {
                    done++;
                }
                lessonViews.add(Views.LessonView.of(lesson, completed));
            }
            totalLessons += moduleLessons.size();
            completedLessons += done;
            moduleViews.add(new Views.ModuleView(module.getId(), module.getName(), module.getIcon(),
                    module.getOutcome(), moduleLessons.size(), done,
                    ProgressScoring.percent(done, moduleLessons.size()), lessonViews));
        }

        CourseEnrollment enrollment = userId == null ? null
                : enrollments.findByUserIdAndCourseId(userId, course.getId()).orElse(null);
        Project impactProject = course.getLevel() == 2 ? impactProject(userId) : null;
        int overallScore = userId == null ? 0 : calculator.courseScore(userId, course.getId());

        return new Views.CourseOutlineView(catalog.courseView(course, userId), enrollment != null,
                ProgressScoring.percent(completedLessons, totalLessons), completedLessons, totalLessons,
                overallScore, enrollment == null ? null : enrollment.getLastLessonId(),
                impactProject == null ? null : impactProject.getId(),
                impactProject == null ? null : impactProject.getTitle(), moduleViews);
    }

    @Transactional(readOnly = true)
    public List<Views.CourseProgressView> myCourseProgress(Long userId) {
        List<Views.CourseProgressView> rows = new ArrayList<>();
        for (CourseEnrollment enrollment : enrollments.findByUserIdOrderByEnrolledAtDesc(userId)) {
            Course course = enrollment.getCourse();
            long total = lessons.countByModuleCourseId(course.getId());
            long completed = progress.countCompletedInCourse(userId, course.getId());
            rows.add(new Views.CourseProgressView(course.getId(), course.getTitle(), course.getSlug(),
                    course.getLevel(), enrollment.getStatus().name(),
                    ProgressScoring.percent(completed, total), completed, total,
                    calculator.courseScore(userId, course.getId())));
        }
        return rows;
    }

    // ------------------------------------------------------------------ learner write

    /**
     * Marks a lesson complete or reopens it for an enrolled learner. Also records the resume
     * pointer and completes the enrolment once every lesson in the course is done.
     */
    @Transactional
    public Views.ModuleView markLesson(Long userId, Long courseId, Long lessonId, boolean completed) {
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        Course course = courses.findById(courseId).orElseThrow(() -> new NotFoundException("Course"));
        Lesson lesson = lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Lesson"));
        if (!lesson.getModule().getCourse().getId().equals(course.getId())) {
            throw new BusinessRuleException("That lesson is not part of this course.");
        }
        CourseEnrollment enrollment = enrollments.findByUserIdAndCourseId(userId, courseId).orElse(null);
        if (enrollment == null) {
            throw new ForbiddenException("Enrol in this course before working through its lessons.");
        }
        if (completed) {
            progress.findByUserIdAndLessonId(userId, lessonId)
                    .orElseGet(() -> progress.save(new LessonProgress(user, lesson)));
        } else {
            progress.deleteByUserIdAndLessonId(userId, lessonId);
            enrollment.reopen();
        }
        enrollment.resumeAt(lessonId);
        if (completed && progress.countCompletedInCourse(userId, courseId)
                >= lessons.countByModuleCourseId(courseId)) {
            enrollment.complete();
        }
        List<Views.LessonView> lessonViews = new ArrayList<>();
        long done = 0;
        List<Lesson> moduleLessons = lessons.findByModuleIdOrderBySortOrderAsc(lesson.getModule().getId());
        for (Lesson sibling : moduleLessons) {
            boolean siblingDone = progress.findByUserIdAndLessonId(userId, sibling.getId()).isPresent();
            if (siblingDone) {
                done++;
            }
            lessonViews.add(Views.LessonView.of(sibling, siblingDone));
        }
        return new Views.ModuleView(lesson.getModule().getId(), lesson.getModule().getName(),
                lesson.getModule().getIcon(), lesson.getModule().getOutcome(), moduleLessons.size(),
                done, ProgressScoring.percent(done, moduleLessons.size()), lessonViews);
    }

    // ------------------------------------------------------------------ authoring

    @Transactional
    public Views.ModuleView createModule(Long actorId, Requests.ModuleRequest request) {
        requireContentAuthor(actorId);
        Course course = courses.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course"));
        String name = required(request.name(), "Module name");
        int level = request.level() == null ? course.getLevel() : validLevel(request.level());
        Module module = new Module(course, name, request.icon(), request.outcome(),
                order(request.sortOrder()), level);
        Module saved = modules.save(module);
        recordAudit(actorId, "MODULE_CREATE", "module", saved.getId(),
                "Created " + saved.getName() + " in " + course.getCode());
        return moduleView(saved, actorId);
    }

    @Transactional
    public Views.ModuleView updateModule(Long actorId, Long moduleId, Requests.ModuleRequest request) {
        requireContentAuthor(actorId);
        Module module = modules.findById(moduleId)
                .orElseThrow(() -> new NotFoundException("Module"));
        module.update(required(request.name(), "Module name"), request.icon(), request.outcome(),
                order(request.sortOrder()),
                request.level() == null ? module.getLevel() : validLevel(request.level()));
        recordAudit(actorId, "MODULE_UPDATE", "module", moduleId, "Updated " + module.getName());
        return moduleView(module, actorId);
    }

    /** Refuses to delete a module that still owns lessons, so content is never lost silently. */
    @Transactional
    public void deleteModule(Long actorId, Long moduleId) {
        requireContentAuthor(actorId);
        Module module = modules.findById(moduleId)
                .orElseThrow(() -> new NotFoundException("Module"));
        long lessonCount = lessons.countByModuleId(moduleId);
        if (lessonCount > 0) {
            throw new BusinessRuleException("Remove the " + lessonCount
                    + " lesson(s) in this module before deleting it.");
        }
        modules.delete(module);
        recordAudit(actorId, "MODULE_DELETE", "module", moduleId, "Deleted " + module.getName());
    }

    @Transactional
    public Views.LessonView createLesson(Long actorId, Requests.LessonRequest request) {
        requireContentAuthor(actorId);
        Module module = modules.findById(request.moduleId())
                .orElseThrow(() -> new NotFoundException("Module"));
        Lesson lesson = new Lesson(module, required(request.title(), "Lesson title"),
                lessonType(request.type()), order(request.sortOrder()), request.content(),
                request.durationMinutes() == null ? 0 : request.durationMinutes());
        Lesson saved = lessons.save(lesson);
        recordAudit(actorId, "LESSON_CREATE", "lesson", saved.getId(),
                "Created " + saved.getTitle() + " in " + module.getName());
        return Views.LessonView.of(saved, false);
    }

    @Transactional
    public Views.LessonView updateLesson(Long actorId, Long lessonId, Requests.LessonRequest request) {
        requireContentAuthor(actorId);
        Lesson lesson = lessons.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Lesson"));
        lesson.update(required(request.title(), "Lesson title"), lessonType(request.type()),
                order(request.sortOrder()), request.content(),
                request.durationMinutes() == null ? 0 : request.durationMinutes());
        recordAudit(actorId, "LESSON_UPDATE", "lesson", lessonId, "Updated " + lesson.getTitle());
        return Views.LessonView.of(lesson, false);
    }

    /**
     * Refuses to delete a lesson that learners have completed: their progress is evidence and
     * removing it would rewrite history.
     */
    @Transactional
    public void deleteLesson(Long actorId, Long lessonId) {
        requireContentAuthor(actorId);
        Lesson lesson = lessons.findById(lessonId)
                .orElseThrow(() -> new NotFoundException("Lesson"));
        if (progress.existsByLessonId(lessonId)) {
            throw new BusinessRuleException(
                    "Learners have completed this lesson, so it cannot be deleted. Edit it instead.");
        }
        lessons.delete(lesson);
        recordAudit(actorId, "LESSON_DELETE", "lesson", lessonId, "Deleted " + lesson.getTitle());
    }

    // ------------------------------------------------------------------ helpers

    private Project impactProject(Long userId) {
        if (userId == null) {
            return null;
        }
        for (Team team : teams.findByMemberId(userId)) {
            if (team.getProject() != null) {
                return team.getProject();
            }
        }
        return null;
    }

    private Views.ModuleView moduleView(Module module, Long userId) {
        List<Lesson> moduleLessons = lessons.findByModuleIdOrderBySortOrderAsc(module.getId());
        List<Views.LessonView> lessonViews = new ArrayList<>();
        long done = 0;
        for (Lesson lesson : moduleLessons) {
            boolean completed = userId != null
                    && progress.findByUserIdAndLessonId(userId, lesson.getId()).isPresent();
            if (completed) {
                done++;
            }
            lessonViews.add(Views.LessonView.of(lesson, completed));
        }
        return new Views.ModuleView(module.getId(), module.getName(), module.getIcon(),
                module.getOutcome(), moduleLessons.size(), done,
                ProgressScoring.percent(done, moduleLessons.size()), lessonViews);
    }

    private void requireContentAuthor(Long actorId) {
        User actor = users.findById(actorId).orElseThrow(() -> new NotFoundException("Account"));
        if (actor.getRole() != Enums.Role.ADMIN && actor.getRole() != Enums.Role.FACILITATOR) {
            throw new ForbiddenException("Only administrators and facilitators manage course content.");
        }
    }

    private void recordAudit(Long actorId, String action, String targetType, Long id, String details) {
        User actor = users.findById(actorId).orElseThrow(() -> new NotFoundException("Account"));
        audit.record(actor, action, targetType, id, details);
    }

    private static Enums.LessonType lessonType(String value) {
        try {
            return Enums.LessonType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (RuntimeException ex) {
            throw new BusinessRuleException("Lesson type must be VIDEO, NOTES or ACTIVITY.");
        }
    }

    private static int validLevel(int level) {
        if (level != 1 && level != 2) {
            throw new BusinessRuleException("Module level must be 1 (Level One) or 2 (Level Two).");
        }
        return level;
    }

    private static int order(Integer value) {
        return value == null ? 0 : Math.max(0, value);
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new BusinessRuleException(label + " is required.");
        }
        return value.trim();
    }
}
