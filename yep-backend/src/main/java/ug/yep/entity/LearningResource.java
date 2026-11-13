package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A mentor-contributed resource. */
@Entity
@Table(name = "resources")
public class LearningResource extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private Enums.MaterialType type;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    protected LearningResource() {
    }

    public LearningResource(User owner, String title, Enums.MaterialType type, String url) {
        this.owner = owner;
        this.title = title;
        this.type = type;
        this.url = url;
    }

    public User getOwner() {
        return owner;
    }

    public String getTitle() {
        return title;
    }

    public Enums.MaterialType getType() {
        return type;
    }

    public String getUrl() {
        return url;
    }
}
