package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * A top-level academy group (for example "Tech &amp; Digital").
 *
 * <p>Academies are data, not code: an administrator can add another one from the
 * console and it immediately becomes available to career paths and courses.</p>
 */
@Entity
@Table(name = "academies")
public class Academy extends BaseEntity {

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "slug", nullable = false, length = 160, unique = true)
    private String slug;

    @Column(name = "tagline", length = 240)
    private String tagline;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "colour", length = 16)
    private String colour;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "published", nullable = false)
    private boolean published = true;

    protected Academy() {
    }

    public Academy(String name, String slug) {
        this.name = name.trim();
        this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public void update(String name, String slug, String tagline, String description, String icon,
                       String colour, int sortOrder) {
        if (name != null && !name.isBlank()) {
            this.name = name.trim();
        }
        if (slug != null && !slug.isBlank()) {
            this.slug = slug.trim().toLowerCase(java.util.Locale.ROOT);
        }
        this.tagline = tagline;
        this.description = description;
        this.icon = icon;
        this.colour = colour;
        this.sortOrder = sortOrder;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getTagline() {
        return tagline;
    }

    public String getDescription() {
        return description;
    }

    public String getIcon() {
        return icon;
    }

    public String getColour() {
        return colour;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isPublished() {
        return published;
    }
}
