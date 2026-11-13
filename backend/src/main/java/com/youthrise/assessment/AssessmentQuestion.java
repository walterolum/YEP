package com.youthrise.assessment;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

/**
 * One multiple-choice question in a quiz assessment.
 *
 * <p>The question owns its options and knows how to score an answer, so the
 * scoring rule lives with the domain object instead of in the controller. The
 * correct option is never exposed to participants.</p>
 */
@Entity
@Table(name = "assessment_questions", indexes = {
        @Index(name = "idx_assessment_questions_assessment", columnList = "assessment_id")
})
public class AssessmentQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(name = "prompt", nullable = false, length = 1000)
    private String prompt;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "points", nullable = false)
    private int points;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "assessment_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @OrderColumn(name = "position")
    private List<AnswerOption> options = new ArrayList<>();

    protected AssessmentQuestion() {
    }

    /** A single answer choice. Exactly one option per question is correct. */
    @Embeddable
    public static class AnswerOption {

        @Column(name = "label", nullable = false, length = 500)
        private String label;

        @Column(name = "correct", nullable = false)
        private boolean correct;

        protected AnswerOption() {
        }

        public AnswerOption(String label, boolean correct) {
            this.label = label;
            this.correct = correct;
        }

        public String getLabel() {
            return label;
        }

        public boolean isCorrect() {
            return correct;
        }
    }

    public static AssessmentQuestion create(Assessment assessment, String prompt, int points,
                                            int position, List<AnswerOption> options) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("A question needs a prompt");
        }
        if (points < 1) {
            throw new IllegalArgumentException("A question is worth at least one point");
        }
        if (options == null || options.size() < 2) {
            throw new IllegalArgumentException("A question needs at least two options");
        }
        long correct = options.stream().filter(AnswerOption::isCorrect).count();
        if (correct != 1) {
            throw new IllegalArgumentException("A question needs exactly one correct option");
        }
        AssessmentQuestion question = new AssessmentQuestion();
        question.assessment = assessment;
        question.prompt = prompt.trim();
        question.points = points;
        question.position = position;
        question.options = new ArrayList<>(options);
        return question;
    }

    /** Points earned by choosing {@code optionIndex}; wrong choices earn nothing. */
    public int score(int optionIndex) {
        if (optionIndex < 0 || optionIndex >= options.size()) {
            return 0;
        }
        return options.get(optionIndex).isCorrect() ? points : 0;
    }

    public boolean hasOption(int optionIndex) {
        return optionIndex >= 0 && optionIndex < options.size();
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public String getPrompt() {
        return prompt;
    }

    public int getPosition() {
        return position;
    }

    public int getPoints() {
        return points;
    }

    public List<AnswerOption> getOptions() {
        return options;
    }
}
