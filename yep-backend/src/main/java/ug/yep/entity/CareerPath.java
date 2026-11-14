package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A career path inside an academy (for example "Software Development"). */
@Entity
@Table(name = "career_paths")
public class CareerPath extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "academy_id", nullable = false)
    private Academy academy;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "slug", nullable = false, length = 160, unique = true)
    private String slug;

    @Column(name = "summary", length = 500)
    private String summary;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "published", nullable = false)
    private boolean published = true;

    protected CareerPath() {
    }

    public CareerPath(Academy academy, String title, String slug) {
        this.academy = academy;
        this.title = title.trim();
        this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public void update(Academy academy, String title, String slug, String summary,
                       String description, String icon, int sortOrder) {
        if (academy != null) {
            this.academy = academy;
        }
        if (title != null && !title.isBlank()) {
            this.title = title.trim();
        }
        if (slug != null && !slug.isBlank()) {
            this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
        }
        this.summary = summary;
        this.description = description;
        this.icon = icon;
        this.sortOrder = sortOrder;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public Academy getAcademy() {
        return academy;
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
