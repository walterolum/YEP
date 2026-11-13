package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** A Level One learning module. Each module owns three ordered lessons. */
@Entity
@Table(name = "modules")
public class Module extends BaseEntity {

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
