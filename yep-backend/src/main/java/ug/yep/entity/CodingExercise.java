package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A coding exercise attached to a lesson, with instructions and an expected result. */
@Entity
@Table(name = "coding_exercises")
public class CodingExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "language", nullable = false, length = 20)
    private String language;

    @Column(name = "instructions", nullable = false, columnDefinition = "text")
    private String instructions;

    @Column(name = "starter_code", columnDefinition = "text")
    private String starterCode;

    @Column(name = "expected_output", columnDefinition = "text")
    private String expectedOutput;

    @Column(name = "points", nullable = false)
    private int points;

    protected CodingExercise() {
    }

    public Lesson getLesson() {
        return lesson;
    }

    public String getTitle() {
        return title;
    }

    public String getLanguage() {
        return language;
    }

    public String getInstructions() {
        return instructions;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public int getPoints() {
        return points;
    }
}
