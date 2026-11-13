package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A multiple-choice question belonging to an assessment. */
@Entity
@Table(name = "questions")
public class Question extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @Column(name = "prompt", nullable = false, length = 500)
    private String prompt;

    @Column(name = "option_a", nullable = false, length = 300)
    private String optionA;

    @Column(name = "option_b", nullable = false, length = 300)
    private String optionB;

    @Column(name = "option_c", length = 300)
    private String optionC;

    @Column(name = "option_d", length = 300)
    private String optionD;

    @Column(name = "correct_option", nullable = false, length = 1)
    private String correctOption;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected Question() {
    }

    public Question(Assessment assessment, String prompt, String optionA, String optionB,
                    String optionC, String optionD, String correctOption, int sortOrder) {
        this.assessment = assessment;
        this.prompt = prompt;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption == null ? "A" : correctOption.toUpperCase(java.util.Locale.ROOT);
        this.sortOrder = sortOrder;
    }

    public boolean isCorrect(String choice) {
        return choice != null && correctOption.equalsIgnoreCase(choice);
    }

    public java.util.List<String> options() {
        java.util.List<String> options = new java.util.ArrayList<>(4);
        for (String option : new String[] {optionA, optionB, optionC, optionD}) {
            if (option != null && !option.isBlank()) {
                options.add(option);
            }
        }
        return options;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public String getPrompt() {
        return prompt;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
