package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A module inside a course. Each module owns ordered lessons. */
@Entity
@Table(name = "modules")
public class Module extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "outcome", length = 600)
    private String outcome;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "level", nullable = false)
    private int level;

    protected Module() {
    }

    public Module(String name, String icon, int sortOrder, int level) {
        this.name = name;
        this.icon = icon;
        this.sortOrder = sortOrder;
        this.level = level;
    }

    public Module(Course course, String name, String icon, String outcome, int sortOrder, int level) {
        this.course = course;
        this.name = name;
        this.icon = icon;
        this.outcome = outcome;
        this.sortOrder = sortOrder;
        this.level = level;
    }

    /** Authoring update. The course is fixed once the module exists. */
    public void update(String name, String icon, String outcome, int sortOrder, int level) {
        if (name != null && !name.isBlank()) {
            this.name = name.trim();
        }
        this.icon = icon;
        this.outcome = outcome;
        this.sortOrder = Math.max(0, sortOrder);
        if (level == 1 || level == 2) {
            this.level = level;
        }
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getName() {
        return name;
    }

    public String getIcon() {
        return icon;
    }

    public String getOutcome() {
        return outcome;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public int getLevel() {
        return level;
    }
}
