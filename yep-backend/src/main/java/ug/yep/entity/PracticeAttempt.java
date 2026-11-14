package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** One attempt at a practice question, used to compute mastery. */
@Entity
@Table(name = "practice_attempts")
public class PracticeAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "chosen_option", nullable = false, length = 1)
    private String chosenOption;

    @Column(name = "correct", nullable = false)
    private boolean correct;

    protected PracticeAttempt() {
    }

    public PracticeAttempt(User user, Question question, String chosenOption, boolean correct) {
        this.user = user;
        this.question = question;
        this.chosenOption = chosenOption;
        this.correct = correct;
    }

    public Question getQuestion() {
        return question;
    }

    public boolean isCorrect() {
        return correct;
    }
}
