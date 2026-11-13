package com.youthrise.assessment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.youthrise.common.exception.ScoringException;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Scoring rules for both marking paths: an automatically marked quiz and a
 * facilitator-marked written submission.
 */
class AssessmentScoringRulesTest {

    @Test
    void aQuestionAwardsPointsOnlyForTheCorrectOption() {
        Assessment assessment = assessment(20);
        AssessmentQuestion question = AssessmentQuestion.create(assessment, "What is 2 + 2?", 5, 0,
                List.of(new AssessmentQuestion.AnswerOption("4", true),
                        new AssessmentQuestion.AnswerOption("5", false)));

        assertThat(question.score(0)).isEqualTo(5);
        assertThat(question.score(1)).isZero();
        assertThat(question.score(9)).isZero();
        assertThat(question.hasOption(1)).isTrue();
        assertThat(question.hasOption(2)).isFalse();
    }

    @Test
    void aQuizCannotBeCreatedWithoutExactlyOneCorrectAnswer() {
        Assessment assessment = assessment(20);
        assertThatThrownBy(() -> AssessmentQuestion.create(assessment, "Prompt", 5, 0,
                List.of(new AssessmentQuestion.AnswerOption("A", true),
                        new AssessmentQuestion.AnswerOption("B", true))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("exactly one correct option");

        assertThatThrownBy(() -> AssessmentQuestion.create(assessment, "Prompt", 5, 0,
                List.of(new AssessmentQuestion.AnswerOption("A", false))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least two options");
    }

    @Test
    void automaticMarkingIsBoundedByTheAssessmentMaximum() {
        Assessment assessment = assessment(20);
        User participant = participant();

        AssessmentAttempt marked = AssessmentAttempt.autoGraded(assessment, participant, 1,
                "Answers", 15, "Scored automatically");

        assertThat(marked.getStatus()).isEqualTo(AttemptStatus.GRADED);
        assertThat(marked.getScore()).isEqualTo(15);
        assertThat(marked.getGrader()).isNull();
        assertThat(marked.percentage()).isEqualTo(75.0);
        assertThat(marked.isPassed()).isTrue();

        assertThatThrownBy(() -> AssessmentAttempt.autoGraded(assessment, participant, 2,
                "Answers", 25, "Too high"))
                .isInstanceOf(ScoringException.class);
    }

    @Test
    void manualMarkingUsesTheSameRangeAndPassMark() {
        Assessment assessment = assessment(20);
        User participant = participant();
        User facilitator = User.invited("Facilitator", "fac@example.org", Role.FACILITATOR,
                "Uganda", "Africa/Kampala");

        AssessmentAttempt attempt = AssessmentAttempt.submit(assessment, participant, 1, "Essay");
        attempt.grade(facilitator, 9, "Below the pass mark");

        assertThat(attempt.isGraded()).isTrue();
        assertThat(attempt.isPassed()).isFalse();
        assertThat(attempt.getGrader()).isEqualTo(facilitator);
        assertThatThrownBy(() -> attempt.grade(facilitator, 10, "Second marking"))
                .isInstanceOf(IllegalStateException.class);
    }

    private static Assessment assessment(int maxScore) {
        User facilitator = User.invited("Facilitator", "fac@example.org", Role.FACILITATOR,
                "Uganda", "Africa/Kampala");
        Instant now = Instant.now();
        Programme programme = Programme.create("Digital Literacy", "Summary", "Description", 1,
                "Digital", 4, "2 hours a week", "Online", 25, ProgrammeStatus.OPEN,
                now.minus(1, ChronoUnit.DAYS), now.plus(30, ChronoUnit.DAYS), "2026-A", facilitator);
        return Assessment.create(programme, "Quiz", AssessmentType.QUIZ, "Check understanding",
                now.minus(1, ChronoUnit.DAYS), now.plus(7, ChronoUnit.DAYS), maxScore, 2, true,
                List.of(), List.of());
    }

    private static User participant() {
        return User.register("Participant", "p@example.org", null, "Uganda", "hash",
                "Africa/Kampala", LocalDate.of(2001, 2, 2));
    }
}
