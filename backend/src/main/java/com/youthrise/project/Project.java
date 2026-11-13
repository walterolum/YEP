package com.youthrise.project;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false, unique = true)
    private Team team;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "problem", nullable = false, length = 500)
    private String problem;

    @Column(name = "theme", nullable = false, length = 80)
    private String theme;

    @Column(name = "summary", nullable = false, length = 1000)
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProjectStatus status;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "project_objectives", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "value", nullable = false, length = 500)
    private List<String> objectives = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<Milestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("addedAt ASC")
    private List<ProjectResource> resources = new ArrayList<>();

    protected Project() {
    }

    public static Project create(Team team, String title, String problem, String theme, String summary,
                                 ProjectStatus status, List<String> objectives) {
        Project project = new Project();
        project.team = team;
        project.title = title.trim();
        project.problem = problem.trim();
        project.theme = theme.trim();
        project.summary = summary.trim();
        project.status = status;
        project.objectives = new ArrayList<>(objectives);
        return project;
    }

    public void addMilestone(Milestone milestone) {
        milestones.add(milestone);
    }

    public void changeStatus(ProjectStatus status) {
        this.status = status;
    }

    public Team getTeam() {
        return team;
    }

    public String getTitle() {
        return title;
    }

    public String getProblem() {
        return problem;
    }

    public String getTheme() {
        return theme;
    }

    public String getSummary() {
        return summary;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public List<String> getObjectives() {
        return objectives;
    }

    public List<Milestone> getMilestones() {
        return milestones;
    }

    public List<ProjectResource> getResources() {
        return resources;
    }
}
