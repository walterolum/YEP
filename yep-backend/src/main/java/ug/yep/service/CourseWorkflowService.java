package ug.yep.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.CareerPathRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.UserRepository;

/**
 * Instructor → reviewer workflow. An instructor drafts a course, adds modules and lessons in the
 * content manager, submits it, and a reviewer either approves (which publishes it) or returns it
 * with a note. Attribution is required before submission.
 */
@Service
public class CourseWorkflowService {

    private final CourseRepository courses;
    private final CareerPathRepository careerPaths;
    private final ModuleRepository modules;
    private final UserRepository users;
    private final CatalogService catalog;
    private final AuditService audit;

    public CourseWorkflowService(CourseRepository courses, CareerPathRepository careerPaths,
                                 ModuleRepository modules, UserRepository users,
                                 CatalogService catalog, AuditService audit) {
        this.courses = courses;
        this.careerPaths = careerPaths;
        this.modules = modules;
        this.users = users;
        this.catalog = catalog;
        this.audit = audit;
    }

    @Transactional
    public Views.CourseView createDraft(Long actorId, Requests.InstructorCourseRequest request) {
        User actor = author(actorId);
        CareerPath path = careerPaths.findById(request.careerPathId())
                .orElseThrow(() -> new NotFoundException("Career path"));
        String code = request.code().trim().toUpperCase(java.util.Locale.ROOT).replace(' ', '-');
        if (courses.existsByCodeIgnoreCase(code)) {
            throw new BusinessRuleException("A course with the code " + code + " already exists.");
        }
        String title = request.title().trim();
        String slug = CatalogService.slugify(title);
        if (courses.existsBySlugIgnoreCase(slug)) {
            slug = slug + "-" + code.toLowerCase(java.util.Locale.ROOT);
        }
        Course course = new Course(path, code, title, slug, request.level() == 2 ? 2 : 1);
        course.update(path, code, title, slug, request.summary(), request.description(),
                request.level() == 2 ? 2 : 1, Math.max(0, request.durationHours()),
                "📘", 500);
        course.applyLicensing(request.language(), request.certificateAvailable(),
                request.sourceName(), request.sourceUrl(), request.licence(),
                request.licenceUrl(), request.author(), request.attributionText());
        course.assignInstructor(actor);
        course.setPublished(false);
        Course saved = courses.save(course);
        audit.record(actor, "COURSE_DRAFT", "course", saved.getId(),
                "Drafted " + saved.getCode() + " — " + saved.getTitle());
        return catalog.courseView(saved, null);
    }

    @Transactional
    public Views.CourseView submit(Long actorId, Long courseId) {
        User actor = author(actorId);
        Course course = courses.findById(courseId).orElseThrow(() -> new NotFoundException("Course"));
        if (course.getInstructor() == null || !course.getInstructor().getId().equals(actor.getId())) {
            throw new ForbiddenException("You can only submit a course you created.");
        }
        if (modules.findByCourseIdOrderBySortOrderAsc(courseId).isEmpty()) {
            throw new BusinessRuleException("Add at least one module before submitting this course.");
        }
        course.submitForReview();
        courses.save(course);
        audit.record(actor, "COURSE_SUBMIT", "course", courseId,
                "Submitted " + course.getCode() + " for review");
        return catalog.courseView(course, null);
    }

    @Transactional(readOnly = true)
    public List<Views.CourseView> myCourses(Long actorId) {
        author(actorId);
        List<Views.CourseView> views = new ArrayList<>();
        for (Course course : courses.findAllByOrderBySortOrderAscTitleAsc()) {
            if (course.getInstructor() != null && course.getInstructor().getId().equals(actorId)) {
                views.add(catalog.courseView(course, null));
            }
        }
        return views;
    }

    /** Reviewer queue: everything waiting for a decision, newest submissions first by title. */
    @Transactional(readOnly = true)
    public List<Views.CourseView> submissions() {
        List<Views.CourseView> views = new ArrayList<>();
        for (Course course : courses.findAllByOrderBySortOrderAscTitleAsc()) {
            Enums.ReviewStatus status = course.getReviewStatus();
            if (status == Enums.ReviewStatus.SUBMITTED
                    || status == Enums.ReviewStatus.CHANGES_REQUESTED) {
                views.add(catalog.courseView(course, null));
            }
        }
        return views;
    }

    @Transactional
    public Views.CourseView decide(Long actorId, Long courseId, Requests.CourseDecisionRequest request) {
        User actor = users.findById(actorId).orElseThrow(() -> new NotFoundException("Account"));
        if (!actor.canReviewContent() && actor.getRole() != Enums.Role.ADMIN) {
            throw new ForbiddenException("Only reviewers can decide on course submissions.");
        }
        Course course = courses.findById(courseId).orElseThrow(() -> new NotFoundException("Course"));
        if (course.getInstructor() != null && course.getInstructor().getId().equals(actorId)) {
            throw new ForbiddenException("You cannot review your own course.");
        }
        String decision = request.decision().trim().toUpperCase(java.util.Locale.ROOT);
        switch (decision) {
            case "APPROVE" -> {
                if (course.getReviewStatus() != Enums.ReviewStatus.SUBMITTED) {
                    throw new BusinessRuleException("Only a submitted course can be approved.");
                }
                if (!course.attributionComplete()) {
                    throw new BusinessRuleException(
                            "The course is missing its source, licence, author or attribution.");
                }
                course.approve(actor, request.note());
            }
            case "CHANGES" -> course.requestChanges(actor, request.note());
            default -> throw new BusinessRuleException("Decision must be APPROVE or CHANGES.");
        }
        courses.save(course);
        audit.record(actor, "COURSE_" + decision, "course", courseId,
                course.getCode() + " → " + course.getReviewStatus());
        return catalog.courseView(course, null);
    }

    private User author(Long actorId) {
        User actor = users.findById(actorId).orElseThrow(() -> new NotFoundException("Account"));
        if (!actor.canAuthorContent()) {
            throw new ForbiddenException("Your role cannot create courses.");
        }
        return actor;
    }
}
