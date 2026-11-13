package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/** A single platform setting, stored as key/value so rules stay configurable. */
@Entity
@Table(name = "settings")
public class Setting {

    @Id
    @Column(name = "setting_key", length = 80, nullable = false)
    private String key;

    @Column(name = "setting_value", length = 255)
    private String value;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Setting() {
    }

    public Setting(String key, String value) {
        this.key = key;
        this.value = value;
        this.updatedAt = Instant.now();
    }

    public void setValue(String value) {
        this.value = value;
        this.updatedAt = Instant.now();
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
