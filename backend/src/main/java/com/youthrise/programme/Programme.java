package com.youthrise.programme;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "programmes")
public class Programme extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "summary", nullable = false, length = 400)
    private String summary;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "level", nullable = false)
    private int level;

    @Column(name = "theme", nullable = false, length = 80)
    private String theme;

    @Column(name = "duration_weeks", nullable = false)
    private int durationWeeks;

    @Column(name = "commitment", nullable = false, length = 80)
    private String commitment;

    @Column(name = "mode", nullable = false, length = 80)
    private String mode;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private ProgrammeStatus status;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "cohort", nullable = false, length = 80)
    private String cohort;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "facilitator_id", nullable = false)
    private User facilitator;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "programme_eligibility", joinColumns = @JoinColumn(name = "programme_id"))
    @OrderColumn(name = "position")
    @Column(name = "value", nullable = false, length = 500)
    private List<String> eligibility = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "programme_outcomes", joinColumns = @JoinColumn(name = "programme_id"))
    @OrderColumn(name = "position")
    @Column(name = "value", nullable = false, length = 500)
    private List<String> outcomes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "programme_skills", joinColumns = @JoinColumn(name = "programme_id"))
    @OrderColumn(name = "position")
    @Column(name = "value", nullable = false, length = 80)
    private List<String> skills = new ArrayList<>();

    @Formula("(select count(*) from enrolments e where e.programme_id = id and e.status = 'active')")
    private int enrolledCount;

    @Formula("(select count(*) from learning_modules m where m.programme_id = id and m.status = 'published')")
    private int moduleCount;

    protected Programme() {
    }

    public static Programme create(String title, String summary, String description, int level, String theme,
                                   int durationWeeks, String commitment, String mode, int capacity,
                                   ProgrammeStatus status, Instant startsAt, Instant endsAt, String cohort,
                                   User facilitator) {
        Programme programme = new Programme();
        programme.title = title.trim();
        programme.summary = summary.trim();
        programme.description = description.trim();
        programme.level = level;
        programme.theme = theme.trim();
        programme.durationWeeks = durationWeeks;
        programme.commitment = commitment.trim();
        programme.mode = mode.trim();
        programme.capacity = capacity;
        programme.status = status;
        programme.startsAt = startsAt;
        programme.endsAt = endsAt;
        programme.cohort = cohort.trim();
        programme.facilitator = facilitator;
        return programme;
    }

    public void replaceCurriculumCopy(List<String> eligibility, List<String> outcomes, List<String> skills) {
        this.eligibility = new ArrayList<>(eligibility);
        this.outcomes = new ArrayList<>(outcomes);
        this.skills = new ArrayList<>(skills);
    }

    public void changeStatus(ProgrammeStatus status) {
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getDescription() {
        return description;
    }

    public int getLevel() {
        return level;
    }

    public String getTheme() {
        return theme;
    }

    public int getDurationWeeks() {
        return durationWeeks;
    }

    public String getCommitment() {
        return commitment;
    }

    public String getMode() {
        return mode;
    }

    public int getCapacity() {
        return capacity;
    }

    public ProgrammeStatus getStatus() {
        return status;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public String getCohort() {
        return cohort;
    }

    public User getFacilitator() {
        return facilitator;
    }

    public List<String> getEligibility() {
        return eligibility;
    }

    public List<String> getOutcomes() {
        return outcomes;
    }

    public List<String> getSkills() {
        return skills;
    }

    public int getEnrolledCount() {
        return enrolledCount;
    }

    public int getModuleCount() {
        return moduleCount;
    }
}
