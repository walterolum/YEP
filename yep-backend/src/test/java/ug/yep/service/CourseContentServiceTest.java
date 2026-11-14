package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.entity.Academy;
import ug.yep.entity.CareerPath;
import ug.yep.entity.Course;
import ug.yep.entity.Enums;
import ug.yep.entity.Lesson;
import ug.yep.entity.Module;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.CourseRepository;
import ug.yep.repository.LessonProgressRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.TeamRepository;
import ug.yep.repository.UserRepository;

/** Content authoring is role-checked on the server and never rewrites learner evidence. */
class CourseContentServiceTest {

    private CourseRepository courses;
    private ModuleRepository modules;
    private LessonRepository lessons;
    private LessonProgressRepository progress;
    private UserRepository users;
    private CourseContentService service;

    private Course webCourse;
    private Course otherCourse;

    @BeforeEach
    void setUp() {
        courses = mock(CourseRepository.class);
        modules = mock(ModuleRepository.class);
        lessons = mock(LessonRepository.class);
        progress = mock(LessonProgressRepository.class);
        users = mock(UserRepository.class);
        service = new CourseContentService(courses, modules, lessons, progress,
                mock(CourseEnrollmentRepository.class), mock(TeamRepository.class), users,
                mock(CatalogService.class), mock(ProgressCalculator.class), mock(AuditService.class));

        Academy academy = new Academy("Tech & Digital", "tech-digital");
        CareerPath path = new CareerPath(academy, "Software Development", "software-development");
        webCourse = new Course(path, "TECH-TEST-L1", "Web", "web-test", 1);
        webCourse.setPublished(true);
        ReflectionTestUtils.setField(webCourse, "id", 1L);
        otherCourse = new Course(path, "TECH-OTHER-L1", "Other", "other-test", 1);
        otherCourse.setPublished(true);
        ReflectionTestUtils.setField(otherCourse, "id", 2L);
    }

    @Test
    void aParticipantCannotAuthorModules() {
        User participant = mock(User.class);
        when(participant.getRole()).thenReturn(Enums.Role.PARTICIPANT);
        when(users.findById(5L)).thenReturn(Optional.of(participant));

        assertThrows(ForbiddenException.class, () -> service.createModule(5L,
                new ug.yep.dto.Requests.ModuleRequest(1L, "New module", "📘", null, 1, 1)));
    }

    @Test
    void aLessonFromAnotherCourseCannotBeCompletedThroughThisCourse() {
        Module webModule = new Module(webCourse, "Web module", "📘", null, 1, 1);
        Module otherModule = new Module(otherCourse, "Other module", "📘", null, 1, 1);
        Lesson otherLesson = new Lesson(otherModule, "Not yours", Enums.LessonType.NOTES, 1, "x", 5);
        when(users.findById(2L)).thenReturn(Optional.of(mock(User.class)));
        when(courses.findById(1L)).thenReturn(Optional.of(webCourse));
        when(lessons.findById(9L)).thenReturn(Optional.of(otherLesson));

        assertThrows(BusinessRuleException.class,
                () -> service.markLesson(2L, 1L, 9L, true));
        // webModule exists only to show the two courses are separate.
        org.junit.jupiter.api.Assertions.assertEquals(webCourse, webModule.getCourse());
    }

    @Test
    void aLessonWithCompletionsCannotBeDeleted() {
        User admin = mock(User.class);
        when(admin.getRole()).thenReturn(Enums.Role.ADMIN);
        when(users.findById(1L)).thenReturn(Optional.of(admin));
        Lesson lesson = mock(Lesson.class);
        when(lesson.getTitle()).thenReturn("Evidence lesson");
        when(lessons.findById(4L)).thenReturn(Optional.of(lesson));
        when(progress.existsByLessonId(4L)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> service.deleteLesson(1L, 4L));
    }

    @Test
    void aModuleWithLessonsCannotBeDeleted() {
        User admin = mock(User.class);
        when(admin.getRole()).thenReturn(Enums.Role.ADMIN);
        when(users.findById(1L)).thenReturn(Optional.of(admin));
        Module module = mock(Module.class);
        when(module.getName()).thenReturn("Module with lessons");
        when(modules.findById(3L)).thenReturn(Optional.of(module));
        when(lessons.countByModuleId(3L)).thenReturn(2L);

        assertThrows(BusinessRuleException.class, () -> service.deleteModule(1L, 3L));
    }
}
