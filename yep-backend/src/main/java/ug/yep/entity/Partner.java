package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** A partner, NGO, employer or technology partner. */
@Entity
@Table(name = "partners")
public class Partner extends BaseEntity {

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "type", nullable = false, length = 20)
    private String type;

    @Column(name = "icon", length = 16)
    private String icon;

    @Column(name = "active", nullable = false)
    private boolean active;

    protected Partner() {
    }

    public Partner(String name, String type, String icon, boolean active) {
        this.name = name;
        this.type = type;
        this.icon = icon;
        this.active = active;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getIcon() {
        return icon;
    }

    public boolean isActive() {
        return active;
    }
}
