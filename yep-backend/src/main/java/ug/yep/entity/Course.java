package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * A course inside a career path. Level 1 courses form Level One; Level 2 courses
 * are the advanced/impact stage after the overall 80% gate.
 */
@Entity
@Table(name = "courses")
public class Course extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "career_path_id", nullable = false)
    private CareerPath careerPath;

    @Column(name = "code", nullable = false, length = 40, unique = true)
    private String code;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "slug", nullable = false, length = 160, unique = true)
    private String slug;

    @Column(name = "summary", length = 500)
    private String summary;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "level", nullable = false)
    private int level = 1;

    @Column(name = "duration_hours", nullable = false)
    private int durationHours;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "published", nullable = false)
    private boolean published;

    protected Course() {
    }

    public Course(CareerPath careerPath, String code, String title, String slug, int level) {
        this.careerPath = careerPath;
        this.code = code.trim().toUpperCase(java.util.Locale.ROOT);
        this.title = title.trim();
        this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
        this.level = level;
    }

    public void update(CareerPath careerPath, String code, String title, String slug, String summary,
                       String description, int level, int durationHours, String icon, int sortOrder) {
        if (careerPath != null) {
            this.careerPath = careerPath;
        }
        if (code != null && !code.isBlank()) {
            this.code = code.trim().toUpperCase(java.util.Locale.ROOT);
        }
        if (title != null && !title.isBlank()) {
            this.title = title.trim();
        }
        if (slug != null && !slug.isBlank()) {
            this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
        }
        this.summary = summary;
        this.description = description;
        if (level == 1 || level == 2) {
            this.level = level;
        }
        this.durationHours = Math.max(0, durationHours);
        this.icon = icon;
        this.sortOrder = sortOrder;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public CareerPath getCareerPath() {
        return careerPath;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getSlug() {
        return slug;
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

    public int getDurationHours() {
        return durationHours;
    }

    public String getIcon() {
        return icon;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isPublished() {
        return published;
    }
}
