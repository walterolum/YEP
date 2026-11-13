package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;

/** One cell of the roles and permissions matrix, enforced server-side. */
@Entity
@Table(name = "role_permissions")
public class RolePermission {

    @EmbeddedId
    private Key id;

    @Column(name = "allowed", nullable = false)
    private boolean allowed;

    protected RolePermission() {
    }

    public RolePermission(Enums.Role role, Enums.Permission permission, boolean allowed) {
        this.id = new Key(role.name(), permission.label());
        this.allowed = allowed;
    }

    public void setAllowed(boolean allowed) {
        this.allowed = allowed;
    }

    public Enums.Role getRole() {
        return Enums.Role.valueOf(id.role);
    }

    public String getPermission() {
        return id.permission;
    }

    public boolean isAllowed() {
        return allowed;
    }

    /** Composite primary key: role + permission. */
    @Embeddable
    public static class Key implements Serializable {

        @Column(name = "role", nullable = false, length = 20)
        private String role;

        @Column(name = "permission", nullable = false, length = 40)
        private String permission;

        protected Key() {
        }

        public Key(String role, String permission) {
            this.role = role;
            this.permission = permission;
        }

        @Override
        public boolean equals(Object other) {
            if (this == other) {
                return true;
            }
            if (!(other instanceof Key key)) {
                return false;
            }
            return role.equals(key.role) && permission.equals(key.permission);
        }

        @Override
        public int hashCode() {
            return Objects.hash(role, permission);
        }
    }
}
