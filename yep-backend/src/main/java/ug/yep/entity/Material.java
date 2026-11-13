package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A downloadable or linkable learning material. */
@Entity
@Table(name = "materials")
public class Material extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private Enums.MaterialType type;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    protected Material() {
    }

    public Material(Module module, String title, Enums.MaterialType type, String url) {
        this.module = module;
        this.title = title;
        this.type = type;
        this.url = url;
    }

    public Module getModule() {
        return module;
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
