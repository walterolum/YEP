package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Academy;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.CareerPathRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.UserRepository;

/** Instructor → reviewer workflow: drafts, attribution, submission and decisions. */
class CourseWorkflowServiceTest {

    private CourseRepository courses;
    private ModuleRepository modules;
    private UserRepository users;
    private CourseWorkflowService service;
    private CareerPath path;
    private User instructor;
    private User reviewer;

    @BeforeEach
    void setUp() {
        courses = mock(CourseRepository.class);
        CareerPathRepository careerPaths = mock(CareerPathRepository.class);
        modules = mock(ModuleRepository.class);
        users = mock(UserRepository.class);
        service = new CourseWorkflowService(courses, careerPaths, modules, users,
                mock(CatalogService.class), mock(AuditService.class));

        path = new CareerPath(new Academy("Tech & Digital", "tech-digital"),
                "Software Development", "software-development");
        ReflectionTestUtils.setField(path, "id", 2L);
        when(careerPaths.findById(2L)).thenReturn(Optional.of(path));

        instructor = User.create(Enums.Role.INSTRUCTOR, "Instructor One", "i@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(instructor, "id", 14L);
        reviewer = User.create(Enums.Role.REVIEWER, "Reviewer One", "r@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(reviewer, "id", 15L);
        when(users.findById(14L)).thenReturn(Optional.of(instructor));
        when(users.findById(15L)).thenReturn(Optional.of(reviewer));
        when(courses.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private Requests.InstructorCourseRequest request(boolean withAttribution) {
        return new Requests.InstructorCourseRequest(2L, "TECH-NEW-L1", "New Course",
                "Summary", "Description", 1, 20, "en", true,
                withAttribution ? "OpenStax" : null, withAttribution ? "https://openstax.org" : null,
                withAttribution ? "CC BY 4.0" : null, null,
                withAttribution ? "OpenStax" : null,
                withAttribution ? "Adapted from OpenStax, rewritten by YEP." : null);
    }

    @Test
    void anInstructorDraftStartsUnpublishedAndAssigned() {
        service.createDraft(14L, request(true));

        ArgumentCaptor<Course> saved = ArgumentCaptor.forClass(Course.class);
        org.mockito.Mockito.verify(courses).save(saved.capture());
        Course draft = saved.getValue();
        assertEquals(Enums.ReviewStatus.DRAFT, draft.getReviewStatus());
        assertFalse(draft.isPublished());
        assertEquals(14L, draft.getInstructor().getId());
        assertEquals("CC BY 4.0", draft.getLicence());
    }

    @Test
    void aCourseCannotBeSubmittedWithoutAttribution() {
        Course draft = new Course(path, "TECH-NEW-L1", "New Course", "new-course", 1);
        draft.assignInstructor(instructor);
        when(courses.findById(50L)).thenReturn(Optional.of(draft));
        when(modules.findByCourseIdOrderBySortOrderAsc(50L)).thenReturn(List.of(mock(ug.yep.entity.Module.class)));

        assertThrows(BusinessRuleException.class, () -> service.submit(14L, 50L));
    }

    @Test
    void submissionRequiresAtLeastOneModule() {
        Course draft = new Course(path, "TECH-NEW-L1", "New Course", "new-course", 1);
        draft.assignInstructor(instructor);
        draft.applyLicensing("en", true, "OpenStax", null, "CC BY 4.0", null, "OpenStax", "Credit text");
        when(courses.findById(50L)).thenReturn(Optional.of(draft));
        when(modules.findByCourseIdOrderBySortOrderAsc(50L)).thenReturn(List.of());

        assertThrows(BusinessRuleException.class, () -> service.submit(14L, 50L));
    }

    @Test
    void aSubmittedCourseIsApprovedAndPublished() {
        Course draft = new Course(path, "TECH-NEW-L1", "New Course", "new-course", 1);
        draft.assignInstructor(instructor);
        draft.applyLicensing("en", true, "OpenStax", null, "CC BY 4.0", null, "OpenStax", "Credit text");
        when(courses.findById(50L)).thenReturn(Optional.of(draft));
        when(modules.findByCourseIdOrderBySortOrderAsc(50L)).thenReturn(List.of(mock(ug.yep.entity.Module.class)));

        service.submit(14L, 50L);
        assertEquals(Enums.ReviewStatus.SUBMITTED, draft.getReviewStatus());

        service.decide(15L, 50L, new Requests.CourseDecisionRequest("APPROVE", "Looks good"));
        assertEquals(Enums.ReviewStatus.APPROVED, draft.getReviewStatus());
        assertTrue(draft.isPublished());
        assertEquals("Looks good", draft.getReviewNote());
    }

    @Test
    void aReviewerCannotApproveTheirOwnCourse() {
        Course draft = new Course(path, "TECH-NEW-L1", "New Course", "new-course", 1);
        draft.assignInstructor(reviewer);
        draft.applyLicensing("en", true, "OpenStax", null, "CC BY 4.0", null, "OpenStax", "Credit text");
        when(courses.findById(50L)).thenReturn(Optional.of(draft));

        assertThrows(ForbiddenException.class,
                () -> service.decide(15L, 50L, new Requests.CourseDecisionRequest("APPROVE", null)));
    }

    @Test
    void aParticipantCannotCreateACourse() {
        User participant = User.create(Enums.Role.PARTICIPANT, "Amara", "a@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(participant, "id", 2L);
        when(users.findById(2L)).thenReturn(Optional.of(participant));

        assertThrows(ForbiddenException.class, () -> service.createDraft(2L, request(true)));
    }
}
