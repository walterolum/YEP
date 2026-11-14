package ug.yep.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Views;
import ug.yep.entity.AssessmentAttempt;
import ug.yep.entity.CodeSubmission;
import ug.yep.entity.CodingExercise;
import ug.yep.entity.CourseEnrollment;
import ug.yep.entity.Lesson;
import ug.yep.entity.LessonNote;
import ug.yep.entity.LessonPost;
import ug.yep.entity.PracticeAttempt;
import ug.yep.entity.Question;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
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

/**
 * Phase 3 learning experience: private notes, per-lesson Q&amp;A, practice questions with
 * mastery, coding exercises, XP/badges and assessment attempts.
 */
@Service
public class LearningExperienceService {

    private final LessonNoteRepository notes;
    private final LessonPostRepository posts;
    private final PracticeAttemptRepository attempts;
    private final QuestionRepository questions;
    private final CodingExerciseRepository exercises;
    private final CodeSubmissionRepository submissions;
    private final AssessmentAttemptRepository examAttempts;
    private final AssessmentRepository assessments;
    private final LessonRepository lessons;
    private final LessonProgressRepository progress;
    private final CourseEnrollmentRepository enrollments;
    private final UserRepository users;
    private final CodeRunner runner;

    public LearningExperienceService(LessonNoteRepository notes, LessonPostRepository posts,
                                     PracticeAttemptRepository attempts, QuestionRepository questions,
                                     CodingExerciseRepository exercises,
                                     CodeSubmissionRepository submissions,
                                     AssessmentAttemptRepository examAttempts,
                                     AssessmentRepository assessments, LessonRepository lessons,
                                     LessonProgressRepository progress,
                                     CourseEnrollmentRepository enrollments,
                                     UserRepository users, CodeRunner runner) {
        this.notes = notes;
        this.posts = posts;
        this.attempts = attempts;
        this.questions = questions;
        this.exercises = exercises;
        this.submissions = submissions;
        this.examAttempts = examAttempts;
        this.assessments = assessments;
        this.lessons = lessons;
        this.progress = progress;
        this.enrollments = enrollments;
        this.users = users;
        this.runner = runner;
    }

    // ------------------------------------------------------------------ notes

    @Transactional
    public Views.NoteView saveNote(Long userId, Long lessonId, String body) {
        Lesson lesson = lesson(lessonId);
        String clean = body == null ? "" : body.trim();
        if (clean.length() > 5000) {
            throw new BusinessRuleException("Notes must be 5000 characters or fewer.");
        }
        LessonNote note = notes.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> new LessonNote(user(userId), lesson, clean));
        note.update(clean);
        notes.save(note);
        return new Views.NoteView(lessonId, note.getBody(), note.getUpdatedAt());
    }

    public Views.NoteView note(Long userId, Long lessonId) {
        lesson(lessonId);
        return notes.findByUserIdAndLessonId(userId, lessonId)
                .map(note -> new Views.NoteView(lessonId, note.getBody(), note.getUpdatedAt()))
                .orElse(new Views.NoteView(lessonId, "", null));
    }

    // -------------------------------------------------------------------- Q&A

    public List<Views.LessonPostView> lessonPosts(Long lessonId) {
        lesson(lessonId);
        return posts.findByLessonIdOrderByCreatedAtAsc(lessonId).stream()
                .map(post -> new Views.LessonPostView(post.getId(), post.getUser().getFullName(),
                        post.getUser().getRole().name(), post.getBody(), post.getCreatedAt()))
                .toList();
    }

    @Transactional
    public Views.LessonPostView addPost(Long userId, Long lessonId, String body) {
        Lesson lesson = lesson(lessonId);
        String clean = body == null ? "" : body.trim();
        if (clean.isBlank()) {
            throw new BusinessRuleException("Write a question or an answer first.");
        }
        LessonPost saved = posts.save(new LessonPost(lesson, user(userId), clean));
        return new Views.LessonPostView(saved.getId(), saved.getUser().getFullName(),
                saved.getUser().getRole().name(), saved.getBody(), saved.getCreatedAt());
    }

    // --------------------------------------------------------------- practice

    public List<Views.PracticeQuestionView> practice(Long lessonId) {
        Lesson lesson = lesson(lessonId);
        return questions.findPracticeForModule(lesson.getModule().getId()).stream()
                .limit(10)
                .map(question -> new Views.PracticeQuestionView(question.getId(), question.getPrompt(),
                        question.options()))
                .toList();
    }

    @Transactional
    public Views.PracticeResultView answer(Long userId, Long questionId, String choice) {
        Question question = questions.findById(questionId)
                .orElseThrow(() -> new NotFoundException("Practice question"));
        String normalized = normalize(question, choice);
        if (normalized == null) {
            throw new BusinessRuleException("Choose one of the listed options.");
        }
        boolean correct = question.isCorrect(normalized);
        attempts.save(new PracticeAttempt(user(userId), question, normalized, correct));
        Long courseId = question.getAssessment().getModule().getCourse() == null ? null
                : question.getAssessment().getModule().getCourse().getId();
        int mastery = courseId == null ? 0 : mastery(userId, courseId).percent();
        return new Views.PracticeResultView(correct, question.getCorrectOption(), mastery);
    }

    public Views.MasteryView mastery(Long userId, Long courseId) {
        List<PracticeAttempt> rows = attempts.findForCourse(userId, courseId);
        Map<Long, Boolean> latest = new LinkedHashMap<>();
        for (PracticeAttempt attempt : rows) {
            latest.put(attempt.getQuestion().getId(), attempt.isCorrect());
        }
        int total = latest.size();
        int correct = (int) latest.values().stream().filter(Boolean::booleanValue).count();
        int percent = total == 0 ? 0 : (int) Math.round(correct * 100.0 / total);
        return new Views.MasteryView(courseId, total, correct, percent);
    }

    // ---------------------------------------------------------------- coding

    public Views.CodingExerciseView exercise(Long userId, Long lessonId) {
        CodingExercise exercise = exercises.findFirstByLessonIdOrderByIdAsc(lessonId)
                .orElseThrow(() -> new NotFoundException("Coding exercise"));
        String lastStatus = submissions.findByUserIdAndExerciseIdOrderByCreatedAtDesc(userId,
                        exercise.getId()).stream().findFirst().map(CodeSubmission::getStatus).orElse(null);
        return new Views.CodingExerciseView(exercise.getId(), exercise.getTitle(),
                exercise.getLanguage(), exercise.getInstructions(), exercise.getStarterCode(),
                lastStatus, exercise.getPoints());
    }

    @Transactional
    public Views.CodeRunView submitCode(Long userId, Long exerciseId, String code) {
        CodingExercise exercise = exercises.findById(exerciseId)
                .orElseThrow(() -> new NotFoundException("Coding exercise"));
        requireEnrolment(userId, exercise.getLesson());
        String source = code == null ? "" : code.trim();
        if (source.isBlank()) {
            throw new BusinessRuleException("Write some code before submitting.");
        }
        if (source.length() > 20000) {
            throw new BusinessRuleException("Submissions are limited to 20,000 characters.");
        }
        CodeRunner.Result result = runner.run(exercise.getLanguage(), source,
                exercise.getExpectedOutput());
        submissions.save(new CodeSubmission(exercise, user(userId), source, result.status(),
                result.score(), result.output()));
        return new Views.CodeRunView(result.status(), result.score(), result.output());
    }

    // ------------------------------------------------------------- attempts

    @Transactional
    public Views.AttemptView startAttempt(Long userId, Long assessmentId) {
        var assessment = assessments.findById(assessmentId)
                .orElseThrow(() -> new NotFoundException("Assessment"));
        if (!assessment.isPublished()) {
            throw new BusinessRuleException("This assessment is not open yet.");
        }
        AssessmentAttempt attempt = examAttempts
                .findFirstByAssessmentIdAndUserIdAndStatusOrderByStartedAtDesc(assessmentId, userId, "OPEN")
                .orElseGet(() -> examAttempts.save(new AssessmentAttempt(assessment, user(userId),
                        java.time.Instant.now())));
        int minutes = Math.max(10, assessment.getQuestions().size() * 5);
        return new Views.AttemptView(attempt.getId(), assessmentId, attempt.getStartedAt(),
                attempt.getStartedAt().plusSeconds(minutes * 60L), attempt.getStatus(), minutes);
    }

    public List<Views.AttemptView> attempts(Long userId, Long assessmentId) {
        return examAttempts.findByAssessmentIdAndUserIdOrderByStartedAtDesc(assessmentId, userId)
                .stream().map(attempt -> new Views.AttemptView(attempt.getId(), assessmentId,
                        attempt.getStartedAt(), null, attempt.getStatus(), 0))
                .toList();
    }

    /** Called when an assessment is submitted so the open attempt is closed with its score. */
    @Transactional
    public void recordSubmission(Long userId, Long assessmentId) {
        examAttempts.findFirstByAssessmentIdAndUserIdAndStatusOrderByStartedAtDesc(assessmentId,
                userId, "OPEN").ifPresent(attempt -> {
                    attempt.finish(0, java.time.Instant.now());
                    examAttempts.save(attempt);
                });
    }

    // ------------------------------------------------------------ XP/badges

    public Views.LearningProfileView profile(Long userId) {
        long completed = progress.countByUserId(userId);
        long correct = attempts.countByUserIdAndCorrectTrue(userId);
        long answered = attempts.findByUserIdOrderByCreatedAtAsc(userId).size();
        long conversations = posts.countByUserId(userId);
        int xp = (int) (completed * 10 + correct * 5 + conversations * 2);
        List<Views.BadgeView> badges = new ArrayList<>();
        badges.add(new Views.BadgeView("FIRST_STEP", "First step", "🎯", completed >= 1));
        badges.add(new Views.BadgeView("REGULAR", "Regular learner", "📘", completed >= 5));
        badges.add(new Views.BadgeView("PRACTISED", "Practice makes progress", "🧠", correct >= 10));
        badges.add(new Views.BadgeView("HELPER", "Asks and helps", "💬", conversations >= 1));
        badges.add(new Views.BadgeView("CENTURION", "100 XP", "🏅", xp >= 100));
        return new Views.LearningProfileView(xp, (int) completed, (int) answered, (int) correct,
                badges);
    }

    // ---------------------------------------------------------------- helper

    private String normalize(Question question, String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String value = raw.trim();
        if (value.length() == 1 && "ABCD".contains(value.toUpperCase(java.util.Locale.ROOT))) {
            return value.toUpperCase(java.util.Locale.ROOT);
        }
        int index = question.options().indexOf(value);
        return index >= 0 ? String.valueOf((char) ('A' + index)) : null;
    }

    private void requireEnrolment(Long userId, Lesson lesson) {
        Long courseId = lesson.getModule().getCourse() == null ? null
                : lesson.getModule().getCourse().getId();
        if (courseId == null || !enrollments.existsByUserIdAndCourseId(userId, courseId)) {
            throw new ForbiddenException("Enrol in the course before submitting work.");
        }
    }

    private Lesson lesson(Long lessonId) {
        return lessons.findById(lessonId).orElseThrow(() -> new NotFoundException("Lesson"));
    }

    private User user(Long userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
    }
}
