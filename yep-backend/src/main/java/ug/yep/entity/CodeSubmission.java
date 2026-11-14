package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A learner's submission for a coding exercise and the runner's verdict. */
@Entity
@Table(name = "code_submissions")
public class CodeSubmission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    private CodingExercise exercise;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "code", nullable = false, columnDefinition = "mediumtext")
    private String code;

    /** PASSED, FAILED or REVIEW (runner disabled) — never guess a pass. */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "output", columnDefinition = "text")
    private String output;

    protected CodeSubmission() {
    }

    public CodeSubmission(CodingExercise exercise, User user, String code, String status,
                          int score, String output) {
        this.exercise = exercise;
        this.user = user;
        this.code = code;
        this.status = status;
        this.score = score;
        this.output = output;
    }

    public CodingExercise getExercise() {
        return exercise;
    }

    public String getStatus() {
        return status;
    }

    public int getScore() {
        return score;
    }

    public String getOutput() {
        return output;
    }
}
