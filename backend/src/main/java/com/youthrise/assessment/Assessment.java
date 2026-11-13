package com.youthrise.assessment;

import com.youthrise.common.BaseEntity;
import com.youthrise.programme.Programme;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessments")
public class Assessment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "programme_id", nullable = false)
    private Programme programme;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private AssessmentType type;

    @Column(name = "description", nullable = false, length = 1000)
    private String description;

    @Column(name = "opens_at")
    private Instant opensAt;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Column(name = "max_score", nullable = false)
    private int maxScore;

    @Column(name = "max_attempts", nullable = false)
    private int maxAttempts;

    @Column(name = "published", nullable = false)
    private boolean published;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "assessment_instructions", joinColumns = @JoinColumn(name = "assessment_id"))
    @OrderColumn(name = "position")
    @Column(name = "value", nullable = false, length = 1000)
    private List<String> instructions = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "assessment_criteria", joinColumns = @JoinColumn(name = "assessment_id"))
    @OrderColumn(name = "position")
    private List<Criterion> criteria = new ArrayList<>();

    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true,
            fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<AssessmentQuestion> questions = new ArrayList<>();

    protected Assessment() {
    }

    @Embeddable
    public static class Criterion {

        @Column(name = "criterion_key", nullable = false, length = 40)
        private String code;

        @Column(name = "label", nullable = false, length = 160)
        private String label;

        @Column(name = "description", nullable = false, length = 500)
        private String description;

        @Column(name = "max_score", nullable = false)
        private int maxScore;

        protected Criterion() {
        }

        public Criterion(String code, String label, String description, int maxScore) {
            this.code = code;
            this.label = label;
            this.description = description;
            this.maxScore = maxScore;
        }

        public String getCode() {
            return code;
        }

        public String getLabel() {
            return label;
        }

        public String getDescription() {
            return description;
        }

        public int getMaxScore() {
            return maxScore;
        }
    }

    public static Assessment create(Programme programme, String title, AssessmentType type, String description,
                                    Instant opensAt, Instant dueAt, int maxScore, int maxAttempts,
                                    boolean published, List<String> instructions, List<Criterion> criteria) {
        Assessment assessment = new Assessment();
        assessment.programme = programme;
        assessment.title = title.trim();
        assessment.type = type;
        assessment.description = description.trim();
        assessment.opensAt = opensAt;
        assessment.dueAt = dueAt;
        assessment.maxScore = maxScore;
        assessment.maxAttempts = maxAttempts;
        assessment.published = published;
        assessment.instructions = new ArrayList<>(instructions);
        assessment.criteria = new ArrayList<>(criteria);
        return assessment;
    }

    public boolean isOpenAt(Instant now) {
        return published && (opensAt == null || !now.isBefore(opensAt)) && now.isBefore(dueAt);
    }

    public Programme getProgramme() {
        return programme;
    }

    public String getTitle() {
        return title;
    }

    public AssessmentType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public Instant getOpensAt() {
        return opensAt;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public int getMaxScore() {
        return maxScore;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public boolean isPublished() {
        return published;
    }

    public List<String> getInstructions() {
        return instructions;
    }

    public List<Criterion> getCriteria() {
        return criteria;
    }

    /** Quiz questions ordered for presentation; empty for written assessments. */
    public List<AssessmentQuestion> getQuestions() {
        return questions;
    }

    public void addQuestion(AssessmentQuestion question) {
        questions.add(question);
    }
}
