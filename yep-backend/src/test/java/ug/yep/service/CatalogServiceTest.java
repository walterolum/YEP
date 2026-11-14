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
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Academy;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.Enums;
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

/** Catalogue visibility rules, admin slug handling and idempotent enrolment. */
class CatalogServiceTest {

    private AcademyRepository academies;
    private CareerPathRepository careerPaths;
    private CourseRepository courses;
    private CourseEnrollmentRepository enrollments;
    private UserRepository users;
    private CatalogService service;

    @BeforeEach
    void setUp() {
        academies = mock(AcademyRepository.class);
        careerPaths = mock(CareerPathRepository.class);
        courses = mock(CourseRepository.class);
        enrollments = mock(CourseEnrollmentRepository.class);
        users = mock(UserRepository.class);
        service = new CatalogService(academies, careerPaths, courses, enrollments,
                mock(ModuleRepository.class), mock(LessonRepository.class), users,
                mock(AuditService.class));
    }

    @Test
    void slugifyProducesStableAsciiAddresses() {
        assertEquals("tech-digital", CatalogService.slugify("Tech & Digital"));
        assertEquals("creative-arts", CatalogService.slugify("  Creative   Arts  "));
        assertEquals("academy", CatalogService.slugify("!!!"));
    }

    @Test
    void unpublishedAcademyIsNotVisibleToThePublic() {
        Academy hidden = new Academy("Hidden Academy", "hidden-academy");
        hidden.setPublished(false);
        when(academies.findBySlug("hidden-academy")).thenReturn(Optional.of(hidden));

        assertThrows(NotFoundException.class, () -> service.academyDetail("hidden-academy"));
    }

    @Test
    void academyDetailListsOnlyPublishedCareerPaths() {
        Academy academy = academy(3L, "Tech & Digital", "tech-digital");
        CareerPath path = new CareerPath(academy, "Software Development", "software-development");
        ReflectionTestUtils.setField(path, "id", 4L);
        when(academies.findBySlug("tech-digital")).thenReturn(Optional.of(academy));
        when(careerPaths.findByAcademyIdAndPublishedTrueOrderBySortOrderAscTitleAsc(3L))
                .thenReturn(List.of(path));
        when(courses.findByCareerPathIdAndPublishedTrueOrderBySortOrderAscTitleAsc(4L))
                .thenReturn(List.of());

        var detail = service.academyDetail("tech-digital");

        assertEquals("Tech & Digital", detail.academy().name());
        assertEquals(1, detail.careerPaths().size());
        assertEquals("Software Development", detail.careerPaths().get(0).title());
    }

    @Test
    void adminCanCreateAcademyWithGeneratedSlug() {
        when(users.findById(1L)).thenReturn(Optional.of(admin()));
        when(academies.save(any(Academy.class))).thenAnswer(invocation -> {
            Academy saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 9L);
            return saved;
        });

        var view = service.createAcademy(new CatalogService.CurrentActor(1L),
                new Requests.AcademyRequest("Tech & Digital", null, "Build things", null, "💻",
                        "#1d4ed8", 0, true));

        assertEquals("Tech & Digital", view.name());
        assertEquals("tech-digital", view.slug());
        assertTrue(view.published());
    }

    @Test
    void duplicateAcademySlugIsRejected() {
        when(users.findById(1L)).thenReturn(Optional.of(admin()));
        when(academies.findBySlug("tech-digital"))
                .thenReturn(Optional.of(academy(3L, "Tech & Digital", "tech-digital")));

        assertThrows(BusinessRuleException.class,
                () -> service.createAcademy(new CatalogService.CurrentActor(1L),
                        new Requests.AcademyRequest("Tech & Digital", null, null, null, null, null, 0, true)));
    }

    @Test
    void courseMustUseLevelOneOrLevelTwo() {
        when(users.findById(1L)).thenReturn(Optional.of(admin()));
        CareerPath path = new CareerPath(academy(3L, "Tech", "tech"), "Software", "software");
        ReflectionTestUtils.setField(path, "id", 4L);
        when(careerPaths.findById(4L)).thenReturn(Optional.of(path));

        assertThrows(BusinessRuleException.class,
                () -> service.createCourse(new CatalogService.CurrentActor(1L),
                        new Requests.CourseRequest(4L, "TECH-101", "Intro", null, null, null, 3, 10,
                                null, 0, true)));
    }

    @Test
    void participantCanEnrolInPublishedCourse() {
        User learner = participant(2L);
        Course course = publishedCourse();
        when(users.findById(2L)).thenReturn(Optional.of(learner));
        when(courses.findById(7L)).thenReturn(Optional.of(course));
        when(enrollments.findByUserIdAndCourseId(2L, 7L)).thenReturn(Optional.empty());
        when(enrollments.save(any())).thenAnswer(invocation -> {
            var saved = invocation.getArgument(0, ug.yep.entity.CourseEnrollment.class);
            ReflectionTestUtils.setField(saved, "id", 12L);
            return saved;
        });

        var view = service.enroll(2L, 7L);

        assertEquals(12L, view.id());
        assertEquals("ENROLLED", view.status());
    }

    @Test
    void staffCannotEnrolAsParticipants() {
        when(users.findById(1L)).thenReturn(Optional.of(admin()));
        when(courses.findById(7L)).thenReturn(Optional.of(publishedCourse()));

        assertThrows(ForbiddenException.class, () -> service.enroll(1L, 7L));
    }

    @Test
    void unpublishedCourseCannotBeJoined() {
        User learner = participant(2L);
        Course draft = publishedCourse();
        draft.setPublished(false);
        when(users.findById(2L)).thenReturn(Optional.of(learner));
        when(courses.findById(7L)).thenReturn(Optional.of(draft));

        assertThrows(BusinessRuleException.class, () -> service.enroll(2L, 7L));
    }

    @Test
    void searchFiltersByAcademyAndLevel() {
        Course course = publishedCourse();
        when(courses.findByPublishedTrueOrderBySortOrderAscTitleAsc()).thenReturn(List.of(course));

        var mine = service.searchCourses("tech-digital", 1, null, 2L);
        var other = service.searchCourses("health", null, null, 2L);

        assertEquals(1, mine.size());
        assertTrue(other.isEmpty());
        assertFalse(mine.get(0).enrolled());
    }

    private Academy academy(Long id, String name, String slug) {
        Academy academy = new Academy(name, slug);
        ReflectionTestUtils.setField(academy, "id", id);
        return academy;
    }

    private User admin() {
        User user = User.create(Enums.Role.ADMIN, "YEP Admin", "admin@yep.example", null, "hash",
                Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(user, "id", 1L);
        return user;
    }

    private User participant(Long id) {
        User user = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example", null,
                "hash", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Course publishedCourse() {
        Academy academy = academy(3L, "Tech & Digital", "tech-digital");
        CareerPath path = new CareerPath(academy, "Software Development", "software-development");
        ReflectionTestUtils.setField(path, "id", 4L);
        Course course = new Course(path, "TECH-101", "Web Foundations", "web-foundations", 1);
        ReflectionTestUtils.setField(course, "id", 7L);
        course.setPublished(true);
        return course;
    }
}
