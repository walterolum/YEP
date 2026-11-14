package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A project, certificate or piece of work a learner shows to employers. */
@Entity
@Table(name = "portfolio_items")
public class PortfolioItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "type", nullable = false, length = 30)
    private String type;

    protected PortfolioItem() {
    }

    public PortfolioItem(User user, String title, String description, String url, String type) {
        this.user = user;
        this.title = title;
        this.description = description;
        this.url = url;
        this.type = type == null ? "PROJECT" : type.toUpperCase(java.util.Locale.ROOT);
    }

    public void update(String title, String description, String url) {
        this.title = title;
        this.description = description;
        this.url = url;
    }

    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getUrl() {
        return url;
    }

    public String getType() {
        return type;
    }
}
