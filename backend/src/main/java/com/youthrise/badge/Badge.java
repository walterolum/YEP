package com.youthrise.badge;

import com.youthrise.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * A recognition award that a participant can earn once. Badges complement
 * certificates: a certificate proves programme completion, a badge marks a
 * smaller milestone.
 */
@Entity
@Table(name = "badges", uniqueConstraints = @UniqueConstraint(name = "uk_badges_code", columnNames = "code"))
public class Badge extends BaseEntity {

    @Column(name = "code", nullable = false, length = 40)
    private String code;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "criteria", nullable = false, length = 255)
    private String criteria;

    protected Badge() {
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getCriteria() {
        return criteria;
    }
}
