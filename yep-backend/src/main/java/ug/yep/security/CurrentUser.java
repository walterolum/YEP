package ug.yep.security;

import ug.yep.entity.Enums;

/** The authenticated caller, taken from the JWT and verified against the database. */
public record CurrentUser(Long id, String email, String fullName, Enums.Role role) {

    public boolean isAdmin() {
        return role == Enums.Role.ADMIN;
    }

    public boolean hasRole(Enums.Role... allowed) {
        for (Enums.Role candidate : allowed) {
            if (candidate == role) {
                return true;
            }
        }
        return false;
    }

    public String roleName() {
        return "ROLE_" + role.name();
    }
}
