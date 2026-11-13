package ug.yep.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** A module assessment: question bank decides the pass score automatically. */
@Entity
@Table(name = "assessments")
public class Assessment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "due_date", nullable = false)
    private Instant dueDate;

    @Column(name = "total_marks", nullable = false)
    private int totalMarks;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "results_published", nullable = false)
    private boolean resultsPublished;

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<Question> questions = new ArrayList<>();

    protected Assessment() {
    }

    public Assessment(Module module, String title, Instant dueDate, int totalMarks, boolean published) {
        this.module = module;
        this.title = title;
        this.dueDate = dueDate;
        this.totalMarks = totalMarks;
        this.published = published;
    }

    public Question addQuestion(String prompt, String optionA, String optionB, String optionC,
                                String optionD, String correctOption) {
        Question question = new Question(this, prompt, optionA, optionB, optionC, optionD,
                correctOption, questions.size() + 1);
        questions.add(question);
        return question;
    }

    /** Percentage score for a submission, rounded to the nearest whole mark. */
    public int percentage(int score) {
        if (totalMarks <= 0) {
            return 0;
        }
        return (int) Math.round(score * 100.0 / totalMarks);
    }

    public void publishResults(boolean published) {
        this.resultsPublished = published;
    }

    public Module getModule() {
        return module;
    }

    public String getTitle() {
        return title;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public int getTotalMarks() {
        return totalMarks;
    }

    public boolean isPublished() {
        return published;
    }

    public boolean isResultsPublished() {
        return resultsPublished;
    }

    public List<Question> getQuestions() {
        return questions;
    }
}
