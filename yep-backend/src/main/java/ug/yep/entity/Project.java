package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/** A Level Two impact project proposal. */
@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "category", nullable = false, length = 40)
    private String category;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Enums.ProjectStatus status;

    protected Project() {
    }

    public Project(String title, String category, String description) {
        this.title = title.trim();
        this.category = category;
        this.description = description;
        this.status = Enums.ProjectStatus.PROPOSED;
    }

    /** Status flow: Proposed → Approved → In Progress → Completed (or Rejected). */
    public void moveTo(Enums.ProjectStatus next) {
        this.status = next;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public Enums.ProjectStatus getStatus() {
        return status;
    }
}
