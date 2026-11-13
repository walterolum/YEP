package ug.yep.report.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import ug.yep.entity.Project;
import ug.yep.entity.Team;
import ug.yep.report.ReportGenerator;
import ug.yep.repository.MilestoneRepository;
import ug.yep.repository.ProjectRepository;
import ug.yep.repository.TeamRepository;

/** Level Two projects with team and milestone completion. */
@Component
public class ProjectReport implements ReportGenerator {

    private final ProjectRepository projects;
    private final TeamRepository teams;
    private final MilestoneRepository milestones;

    public ProjectReport(ProjectRepository projects, TeamRepository teams,
                         MilestoneRepository milestones) {
        this.projects = projects;
        this.teams = teams;
        this.milestones = milestones;
    }

    @Override
    public String key() {
        return "projects";
    }

    @Override
    public String title() {
        return "Level Two Projects";
    }

    @Override
    public List<String> columns() {
        return List.of("Project", "Category", "Status", "Team", "Milestones", "Completed");
    }

    @Override
    public List<List<Object>> rows(Map<String, Object> filters) {
        List<List<Object>> rows = new ArrayList<>();
        for (Project project : projects.findAllByOrderByCreatedAtDesc()) {
            Team team = teams.findByProjectId(project.getId()).orElse(null);
            long total = milestones.countByProjectId(project.getId());
            long done = milestones.countByProjectIdAndCompletedTrue(project.getId());
            rows.add(List.of(project.getTitle(), project.getCategory(), project.getStatus().name(),
                    team == null ? "Unassigned" : team.getName(), total, done));
        }
        return rows;
    }
}
