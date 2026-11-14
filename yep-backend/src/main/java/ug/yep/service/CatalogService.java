package ug.yep.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Academy;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.CourseEnrollment;
import ug.yep.entity.Enums;
import ug.yep.entity.Module;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.AcademyRepository;
import ug.yep.repository.CareerPathRepository;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.UserRepository;

/**
 * Academy → career path → course catalogue and course enrolment.
 *
 * <p>All catalogue content is data: administrators create and publish it through
 * this service, so a new academy never needs a code change.</p>
 */
@Service
public class CatalogService {

    private final AcademyRepository academies;
    private final CareerPathRepository careerPaths;
    private final CourseRepository courses;
    private final CourseEnrollmentRepository enrollments;
    private final ModuleRepository modules;
    private final LessonRepository lessons;
    private final UserRepository users;
    private final AuditService audit;

    public CatalogService(AcademyRepository academies, CareerPathRepository careerPaths,
                          CourseRepository courses, CourseEnrollmentRepository enrollments,
                          ModuleRepository modules, LessonRepository lessons, UserRepository users,
                          AuditService audit) {
        this.academies = academies;
        this.careerPaths = careerPaths;
        this.courses = courses;
        this.enrollments = enrollments;
        this.modules = modules;
        this.lessons = lessons;
        this.users = users;
        this.audit = audit;
    }

    // ------------------------------------------------------------------ public read

    @Transactional(readOnly = true)
    public List<Views.AcademyView> publishedAcademies() {
        List<Views.AcademyView> views = new ArrayList<>();
        for (Academy academy : academies.findByPublishedTrueOrderBySortOrderAscNameAsc()) {
            views.add(academyView(academy, true));
        }
        return views;
    }

    @Transactional(readOnly = true)
    public Views.AcademyDetailView academyDetail(String slug) {
        Academy academy = academies.findBySlug(slug)
                .filter(Academy::isPublished)
                .orElseThrow(() -> new NotFoundException("Academy"));
        List<Views.CareerPathView> paths = new ArrayList<>();
        for (CareerPath path : careerPaths
                .findByAcademyIdAndPublishedTrueOrderBySortOrderAscTitleAsc(academy.getId())) {
            paths.add(careerPathView(path, true, null));
        }
        return new Views.AcademyDetailView(academyView(academy, true), paths);
    }

    @Transactional(readOnly = true)
    public List<Views.CourseView> searchCourses(String academySlug, Integer level, String query,
                                                Long userId) {
        String needle = query == null ? null : query.trim().toLowerCase(Locale.ROOT);
        String slug = academySlug == null ? null : academySlug.trim().toLowerCase(Locale.ROOT);
        List<Views.CourseView> views = new ArrayList<>();
        for (Course course : courses.findByPublishedTrueOrderBySortOrderAscTitleAsc()) {
            if (slug != null && !slug.isBlank()
                    && !course.getCareerPath().getAcademy().getSlug().equals(slug)) {
                continue;
            }
            if (level != null && course.getLevel() != level) {
                continue;
            }
            if (needle != null && !needle.isBlank()
                    && !(course.getTitle().toLowerCase(Locale.ROOT).contains(needle)
                    || course.getCode().toLowerCase(Locale.ROOT).contains(needle)
                    || (course.getSummary() != null
                    && course.getSummary().toLowerCase(Locale.ROOT).contains(needle)))) {
                continue;
            }
            views.add(courseView(course, userId));
        }
        return views;
    }

    @Transactional(readOnly = true)
    public Views.CourseView courseDetail(String slug, Long userId) {
        Course course = courses.findBySlug(slug)
                .filter(Course::isPublished)
                .orElseThrow(() -> new NotFoundException("Course"));
        return courseView(course, userId);
    }

    @Transactional(readOnly = true)
    public List<Views.EnrollmentView> myEnrollments(Long userId) {
        return enrollments.findByUserIdOrderByEnrolledAtDesc(userId).stream()
                .map(Views.EnrollmentView::of).toList();
    }

    /**
     * Enrols a participant. Calling it twice returns the existing enrolment instead
     * of creating a duplicate, and an unpublished course cannot be joined.
     */
    @Transactional
    public Views.EnrollmentView enroll(Long userId, Long courseId) {
        User user = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        if (user.getRole() != Enums.Role.PARTICIPANT) {
            throw new ForbiddenException("Only participants can enrol in a course.");
        }
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course"));
        if (!course.isPublished()) {
            throw new BusinessRuleException("This course is not open for enrolment yet.");
        }
        CourseEnrollment enrollment = enrollments.findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> enrollments.save(new CourseEnrollment(user, course)));
        audit.record(user, "COURSE_ENROL", "course", courseId,
                "Enrolled in " + course.getCode() + " — " + course.getTitle());
        return Views.EnrollmentView.of(enrollment);
    }

    // ------------------------------------------------------------------ admin read

    @Transactional(readOnly = true)
    public List<Views.AcademyDetailView> adminCatalogue() {
        List<Views.AcademyDetailView> tree = new ArrayList<>();
        for (Academy academy : academies.findAllByOrderBySortOrderAscNameAsc()) {
            List<Views.CareerPathView> paths = new ArrayList<>();
            for (CareerPath path : careerPaths.findByAcademyIdOrderBySortOrderAscTitleAsc(academy.getId())) {
                paths.add(careerPathView(path, false, null));
            }
            tree.add(new Views.AcademyDetailView(academyView(academy, false), paths));
        }
        return tree;
    }

    @Transactional(readOnly = true)
    public List<Views.CourseView> adminCourses() {
        return courses.findAllByOrderBySortOrderAscTitleAsc().stream()
                .map(course -> courseView(course, null)).toList();
    }

    // ------------------------------------------------------------------ admin write

    @Transactional
    public Views.AcademyView createAcademy(CurrentActor actor, Requests.AcademyRequest request) {
        String name = required(request.name(), "Academy name");
        String slug = uniqueAcademySlug(slugify(blankTo(request.slug(), name)), null);
        Academy academy = new Academy(name, slug);
        academy.update(name, slug, request.tagline(), request.description(), request.icon(),
                colour(request.colour()), request.sortOrder());
        if (request.published() != null) {
            academy.setPublished(request.published());
        }
        Academy saved = academies.save(academy);
        recordAudit(actor, "ACADEMY_CREATE", "academy", saved.getId(), "Created " + saved.getName());
        return academyView(saved, false);
    }

    @Transactional
    public Views.AcademyView updateAcademy(CurrentActor actor, Long id, Requests.AcademyRequest request) {
        Academy academy = academies.findById(id)
                .orElseThrow(() -> new NotFoundException("Academy"));
        String name = required(request.name(), "Academy name");
        String slug = uniqueAcademySlug(slugify(blankTo(request.slug(), name)), id);
        academy.update(name, slug, request.tagline(), request.description(), request.icon(),
                colour(request.colour()), request.sortOrder());
        if (request.published() != null) {
            academy.setPublished(request.published());
        }
        recordAudit(actor, "ACADEMY_UPDATE", "academy", id, "Updated " + academy.getName());
        return academyView(academy, false);
    }

    @Transactional
    public Views.CareerPathView createCareerPath(CurrentActor actor, Requests.CareerPathRequest request) {
        Academy academy = academies.findById(request.academyId())
                .orElseThrow(() -> new NotFoundException("Academy"));
        String title = required(request.title(), "Career path title");
        String slug = uniqueCareerPathSlug(slugify(blankTo(request.slug(), title)), null);
        CareerPath path = new CareerPath(academy, title, slug);
        path.update(academy, title, slug, request.summary(), request.description(), request.icon(),
                request.sortOrder());
        if (request.published() != null) {
            path.setPublished(request.published());
        }
        CareerPath saved = careerPaths.save(path);
        recordAudit(actor, "CAREER_PATH_CREATE", "career_path", saved.getId(), "Created " + saved.getTitle());
        return careerPathView(saved, false, null);
    }

    @Transactional
    public Views.CareerPathView updateCareerPath(CurrentActor actor, Long id,
                                                 Requests.CareerPathRequest request) {
        CareerPath path = careerPaths.findById(id)
                .orElseThrow(() -> new NotFoundException("Career path"));
        Academy academy = academies.findById(request.academyId())
                .orElseThrow(() -> new NotFoundException("Academy"));
        String title = required(request.title(), "Career path title");
        String slug = uniqueCareerPathSlug(slugify(blankTo(request.slug(), title)), id);
        path.update(academy, title, slug, request.summary(), request.description(), request.icon(),
                request.sortOrder());
        if (request.published() != null) {
            path.setPublished(request.published());
        }
        recordAudit(actor, "CAREER_PATH_UPDATE", "career_path", id, "Updated " + path.getTitle());
        return careerPathView(path, false, null);
    }

    @Transactional
    public Views.CourseView createCourse(CurrentActor actor, Requests.CourseRequest request) {
        CareerPath path = careerPaths.findById(request.careerPathId())
                .orElseThrow(() -> new NotFoundException("Career path"));
        String code = courseCode(request.code());
        String title = required(request.title(), "Course title");
        if (courses.existsByCodeIgnoreCase(code)) {
            throw new BusinessRuleException("A course with the code " + code + " already exists.");
        }
        String slug = uniqueCourseSlug(slugify(blankTo(request.slug(), title)), null);
        Course course = new Course(path, code, title, slug, level(request.level()));
        course.update(path, code, title, slug, request.summary(), request.description(),
                level(request.level()), request.durationHours(), request.icon(), request.sortOrder());
        if (request.published() != null) {
            course.setPublished(request.published());
        }
        Course saved = courses.save(course);
        recordAudit(actor, "COURSE_CREATE", "course", saved.getId(), "Created " + saved.getCode());
        return courseView(saved, null);
    }

    @Transactional
    public Views.CourseView updateCourse(CurrentActor actor, Long id, Requests.CourseRequest request) {
        Course course = courses.findById(id)
                .orElseThrow(() -> new NotFoundException("Course"));
        CareerPath path = careerPaths.findById(request.careerPathId())
                .orElseThrow(() -> new NotFoundException("Career path"));
        String code = courseCode(request.code());
        courses.findByCodeIgnoreCase(code).filter(other -> !other.getId().equals(id)).ifPresent(other -> {
            throw new BusinessRuleException("A course with the code " + code + " already exists.");
        });
        String title = required(request.title(), "Course title");
        String slug = uniqueCourseSlug(slugify(blankTo(request.slug(), title)), id);
        course.update(path, code, title, slug, request.summary(), request.description(),
                level(request.level()), request.durationHours(), request.icon(), request.sortOrder());
        if (request.published() != null) {
            course.setPublished(request.published());
        }
        recordAudit(actor, "COURSE_UPDATE", "course", id, "Updated " + course.getCode());
        return courseView(course, null);
    }

    @Transactional
    public Views.AcademyView publishAcademy(CurrentActor actor, Long id, boolean published) {
        Academy academy = academies.findById(id)
                .orElseThrow(() -> new NotFoundException("Academy"));
        academy.setPublished(published);
        recordAudit(actor, published ? "ACADEMY_PUBLISH" : "ACADEMY_UNPUBLISH", "academy", id,
                academy.getName() + (published ? " published" : " unpublished"));
        return academyView(academy, false);
    }

    @Transactional
    public Views.CareerPathView publishCareerPath(CurrentActor actor, Long id, boolean published) {
        CareerPath path = careerPaths.findById(id)
                .orElseThrow(() -> new NotFoundException("Career path"));
        path.setPublished(published);
        recordAudit(actor, published ? "CAREER_PATH_PUBLISH" : "CAREER_PATH_UNPUBLISH",
                "career_path", id, path.getTitle() + (published ? " published" : " unpublished"));
        return careerPathView(path, false, null);
    }

    @Transactional
    public Views.CourseView publishCourse(CurrentActor actor, Long id, boolean published) {
        Course course = courses.findById(id)
                .orElseThrow(() -> new NotFoundException("Course"));
        course.setPublished(published);
        recordAudit(actor, published ? "COURSE_PUBLISH" : "COURSE_UNPUBLISH", "course", id,
                course.getCode() + (published ? " published" : " unpublished"));
        return courseView(course, null);
    }

    // ------------------------------------------------------------------ builders

    private Views.AcademyView academyView(Academy academy, boolean publishedOnly) {
        List<CareerPath> paths = publishedOnly
                ? careerPaths.findByAcademyIdAndPublishedTrueOrderBySortOrderAscTitleAsc(academy.getId())
                : careerPaths.findByAcademyIdOrderBySortOrderAscTitleAsc(academy.getId());
        long courseCount = 0;
        for (CareerPath path : paths) {
            courseCount += publishedOnly
                    ? courses.findByCareerPathIdAndPublishedTrueOrderBySortOrderAscTitleAsc(path.getId()).size()
                    : courses.findByCareerPathIdOrderBySortOrderAscTitleAsc(path.getId()).size();
        }
        return new Views.AcademyView(academy.getId(), academy.getName(), academy.getSlug(),
                academy.getTagline(), academy.getDescription(), academy.getIcon(), academy.getColour(),
                academy.getSortOrder(), academy.isPublished(), paths.size(), courseCount);
    }

    private Views.CareerPathView careerPathView(CareerPath path, boolean publishedOnly, Long userId) {
        List<Views.CourseView> courseViews = new ArrayList<>();
        List<Course> pathCourses = publishedOnly
                ? courses.findByCareerPathIdAndPublishedTrueOrderBySortOrderAscTitleAsc(path.getId())
                : courses.findByCareerPathIdOrderBySortOrderAscTitleAsc(path.getId());
        for (Course course : pathCourses) {
            courseViews.add(courseView(course, userId));
        }
        return new Views.CareerPathView(path.getId(), path.getAcademy().getId(),
                path.getAcademy().getName(), path.getTitle(), path.getSlug(), path.getSummary(),
                path.getDescription(), path.getIcon(), path.getSortOrder(), path.isPublished(),
                courseViews);
    }

    /** Shared course summary, also used by the course player. */
    public Views.CourseView courseView(Course course, Long userId) {
        List<Module> courseModules = modules.findByCourseIdOrderBySortOrderAsc(course.getId());
        long lessonCount = 0;
        for (Module module : courseModules) {
            lessonCount += lessons.countByModuleId(module.getId());
        }
        boolean enrolled = userId != null && enrollments.existsByUserIdAndCourseId(userId, course.getId());
        return new Views.CourseView(course.getId(), course.getCareerPath().getId(),
                course.getCareerPath().getTitle(), course.getCareerPath().getAcademy().getId(),
                course.getCareerPath().getAcademy().getName(), course.getCode(), course.getTitle(),
                course.getSlug(), course.getSummary(), course.getDescription(), course.getLevel(),
                course.getDurationHours(), course.getIcon(), courseModules.size(), lessonCount,
                course.isPublished(), enrolled);
    }

    // ------------------------------------------------------------------ helpers

    private void recordAudit(CurrentActor actor, String action, String targetType, Long id,
                             String details) {
        User user = users.findById(actor.id()).orElseThrow(() -> new NotFoundException("Account"));
        audit.record(user, action, targetType, id, details);
    }

    private String uniqueAcademySlug(String slug, Long existingId) {
        Academy match = academies.findBySlug(slug).orElse(null);
        if (match != null && !match.getId().equals(existingId)) {
            throw new BusinessRuleException("That academy address is already in use.");
        }
        return slug;
    }

    private String uniqueCareerPathSlug(String slug, Long existingId) {
        CareerPath match = careerPaths.findBySlug(slug).orElse(null);
        if (match != null && !match.getId().equals(existingId)) {
            throw new BusinessRuleException("That career path address is already in use.");
        }
        return slug;
    }

    private String uniqueCourseSlug(String slug, Long existingId) {
        Course match = courses.findBySlug(slug).orElse(null);
        if (match != null && !match.getId().equals(existingId)) {
            throw new BusinessRuleException("That course address is already in use.");
        }
        return slug;
    }

    private static String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new BusinessRuleException(label + " is required.");
        }
        return value.trim();
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static int level(int level) {
        if (level != 1 && level != 2) {
            throw new BusinessRuleException("Course level must be 1 (Level One) or 2 (Level Two).");
        }
        return level;
    }

    private static String courseCode(String value) {
        String code = required(value, "Course code").toUpperCase(Locale.ROOT).replace(' ', '-');
        if (!code.matches("[A-Z0-9][A-Z0-9-]{1,39}")) {
            throw new BusinessRuleException(
                    "Course code must be 2–40 letters, digits or hyphens (for example TECH-WEB-L1).");
        }
        return code;
    }

    private static String colour(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String colour = value.trim();
        if (!colour.matches("#[0-9a-fA-F]{3,8}")) {
            throw new BusinessRuleException("Colour must be a hex value such as #1d4ed8.");
        }
        return colour;
    }

    /** Lower-case ASCII slug; never empty. */
    static String slugify(String value) {
        String ascii = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = ascii.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "academy" : slug;
    }

    /** Minimal view of the acting account, kept out of the web layer. */
    public record CurrentActor(Long id) {
        public static CurrentActor of(ug.yep.security.CurrentUser user) {
            return new CurrentActor(user.id());
        }
    }
}
