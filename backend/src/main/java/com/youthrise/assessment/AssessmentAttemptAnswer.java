package com.youthrise.assessment;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * A participant's chosen option for one quiz question, with the points awarded
 * at submission time. Keeping the award immutable makes a marked quiz auditable
 * even if the question bank is edited later.
 */
@Entity
@Table(name = "assessment_attempt_answers", uniqueConstraints =
        @UniqueConstraint(name = "uk_attempt_answers_question", columnNames = {"attempt_id", "question_id"}))
public class AssessmentAttemptAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private AssessmentAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private AssessmentQuestion question;

    @Column(name = "option_index", nullable = false)
    private int optionIndex;

    @Column(name = "awarded_points", nullable = false)
    private int awardedPoints;

    protected AssessmentAttemptAnswer() {
    }

    public static AssessmentAttemptAnswer record(AssessmentAttempt attempt, AssessmentQuestion question,
                                                 int optionIndex) {
        if (!question.hasOption(optionIndex)) {
            throw new IllegalArgumentException("Choose one of the listed options for every question");
        }
        AssessmentAttemptAnswer answer = new AssessmentAttemptAnswer();
        answer.attempt = attempt;
        answer.question = question;
        answer.optionIndex = optionIndex;
        answer.awardedPoints = question.score(optionIndex);
        return answer;
    }

    public AssessmentAttempt getAttempt() {
        return attempt;
    }

    public AssessmentQuestion getQuestion() {
        return question;
    }

    public int getOptionIndex() {
        return optionIndex;
    }

    public int getAwardedPoints() {
        return awardedPoints;
    }
}
