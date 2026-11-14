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
import ug.yep.entity.Academy;
import ug.yep.entity.Assessment;
import ug.yep.entity.CareerPath;
import ug.yep.entity.CodingExercise;
import ug.yep.entity.Course;
import ug.yep.entity.Enums;
import ug.yep.entity.Lesson;
import ug.yep.entity.LessonNote;
import ug.yep.entity.LessonPost;
import ug.yep.entity.Module;
import ug.yep.entity.PracticeAttempt;
import ug.yep.entity.Question;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.AssessmentAttemptRepository;
import ug.yep.repository.AssessmentRepository;
import ug.yep.repository.CodeSubmissionRepository;
import ug.yep.repository.CodingExerciseRepository;
import ug.yep.repository.CourseEnrollmentRepository;
import ug.yep.repository.LessonNoteRepository;
import ug.yep.repository.LessonPostRepository;
import ug.yep.repository.LessonProgressRepository;
import ug.yep.repository.LessonRepository;
import ug.yep.repository.PracticeAttemptRepository;
import ug.yep.repository.QuestionRepository;
import ug.yep.repository.UserRepository;
import ug.yep.dto.Views;

/** Phase 3: notes, practice mastery, Q&amp;A, coding submissions and XP. */
class LearningExperienceServiceTest {

    private LessonNoteRepository notes;
    private LessonPostRepository posts;
    private PracticeAttemptRepository attempts;
    private CodingExerciseRepository exercises;
    private CodeSubmissionRepository submissions;
    private CourseEnrollmentRepository enrollments;
    private LearningExperienceService service;
    private Lesson lesson;
    private User learner;
    private Question question;

    @BeforeEach
    void setUp() {
        notes = mock(LessonNoteRepository.class);
        posts = mock(LessonPostRepository.class);
        attempts = mock(PracticeAttemptRepository.class);
        QuestionRepository questions = mock(QuestionRepository.class);
        exercises = mock(CodingExerciseRepository.class);
        submissions = mock(CodeSubmissionRepository.class);
        enrollments = mock(CourseEnrollmentRepository.class);
        LessonRepository lessons = mock(LessonRepository.class);
        LessonProgressRepository progress = mock(LessonProgressRepository.class);
        UserRepository users = mock(UserRepository.class);

        service = new LearningExperienceService(notes, posts, attempts, questions, exercises,
                submissions, mock(AssessmentAttemptRepository.class), mock(AssessmentRepository.class),
                lessons, progress, enrollments, users, mock(CodeRunner.class));

        CareerPath path = new CareerPath(new Academy("Tech & Digital", "tech-digital"),
                "Software Development", "software-development");
        Course course = new Course(path, "TECH-PY-L1", "Python", "python", 1);
        ReflectionTestUtils.setField(course, "id", 4L);
        Module module = new Module(course, "Variables", "🐍", "Store values.", 10, 1);
        ReflectionTestUtils.setField(module, "id", 200L);
        lesson = new Lesson(module, "Values, names and types", Enums.LessonType.NOTES, 10);
        ReflectionTestUtils.setField(lesson, "id", 200L);

        Assessment assessment = new Assessment(module, "Python practice",
                java.time.Instant.now().plusSeconds(86400), 30, true);
        question = assessment.addQuestion("What does input() return?", "int", "text", "list",
                "bool", "B");
        ReflectionTestUtils.setField(question, "id", 200L);
        when(questions.findById(200L)).thenReturn(Optional.of(question));

        learner = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(learner, "id", 2L);

        when(lessons.findById(200L)).thenReturn(Optional.of(lesson));
        when(users.findById(2L)).thenReturn(Optional.of(learner));
        when(enrollments.existsByUserIdAndCourseId(2L, 4L)).thenReturn(true);
        when(notes.save(any(LessonNote.class))).thenAnswer(i -> i.getArgument(0));
        when(posts.save(any(LessonPost.class))).thenAnswer(i -> i.getArgument(0));
        when(attempts.save(any(PracticeAttempt.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void savingANoteTwiceUpdatesTheSameRow() {
        when(notes.findByUserIdAndLessonId(2L, 200L)).thenReturn(Optional.empty());
        service.saveNote(2L, 200L, "  first  ");
        LessonNote existing = new LessonNote(learner, lesson, "first");
        when(notes.findByUserIdAndLessonId(2L, 200L)).thenReturn(Optional.of(existing));

        Views.NoteView saved = service.saveNote(2L, 200L, "second");

        assertEquals("second", saved.body());
        assertEquals("second", existing.getBody());
    }

    @Test
    void notesAreCappedSoTheBodyCannotGrowUnbounded() {
        String huge = "x".repeat(5001);
        assertThrows(BusinessRuleException.class, () -> service.saveNote(2L, 200L, huge));
    }

    @Test
    void aCorrectPracticeAnswerCountsTowardsMastery() {
        when(attempts.findForCourse(2L, 4L)).thenReturn(
                List.of(new PracticeAttempt(learner, question, "B", true)));

        Views.PracticeResultView result = service.answer(2L, 200L, "text");

        assertTrue(result.correct());
        assertEquals("B", result.correctOption());
        assertEquals(100, result.masteryPercent());
        assertEquals(100, service.mastery(2L, 4L).percent());
    }

    @Test
    void aWrongPracticeAnswerDoesNotCount() {
        when(attempts.findForCourse(2L, 4L)).thenReturn(
                List.of(new PracticeAttempt(learner, question, "A", false)));

        Views.PracticeResultView result = service.answer(2L, 200L, "A");

        assertFalse(result.correct());
        assertEquals(0, result.masteryPercent());
    }

    @Test
    void anEmptyQuestionIsRejected() {
        assertThrows(BusinessRuleException.class, () -> service.addPost(2L, 200L, "   "));
    }

    @Test
    void codeFromANonEnrolledLearnerIsRefused() {
        CodingExercise exercise = mock(CodingExercise.class);
        when(exercise.getLesson()).thenReturn(lesson);
        when(exercises.findById(200L)).thenReturn(Optional.of(exercise));
        when(enrollments.existsByUserIdAndCourseId(2L, 4L)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> service.submitCode(2L, 200L, "print(1)"));
    }
}
