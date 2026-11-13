package com.youthrise.project;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "project_resources")
public class ProjectResource extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "kind", nullable = false, length = 40)
    private String kind;

    @Column(name = "added_by", nullable = false, length = 160)
    private String addedBy;

    @Column(name = "added_at", nullable = false)
    private Instant addedAt;

    protected ProjectResource() {
    }

    public static ProjectResource create(Project project, String label, String kind, String addedBy) {
        ProjectResource resource = new ProjectResource();
        resource.project = project;
        resource.label = label.trim();
        resource.kind = kind.trim();
        resource.addedBy = addedBy.trim();
        resource.addedAt = Instant.now();
        return resource;
    }

    public Project getProject() {
        return project;
    }

    public String getLabel() {
        return label;
    }

    public String getKind() {
        return kind;
    }

    public String getAddedBy() {
        return addedBy;
    }

    public Instant getAddedAt() {
        return addedAt;
    }
}
