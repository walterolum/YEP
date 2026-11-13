package ug.yep.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.Enums;
import ug.yep.entity.RolePermission;
import ug.yep.exception.ForbiddenException;
import ug.yep.repository.RolePermissionRepository;
import ug.yep.security.CurrentUser;

/** Enforces the roles-and-permissions matrix stored in the database. */
@Service
public class PermissionService {

    private final RolePermissionRepository permissions;

    public PermissionService(RolePermissionRepository permissions) {
        this.permissions = permissions;
    }

    @Transactional(readOnly = true)
    public boolean allows(Enums.Role role, String permission) {
        return permissions.findAll().stream()
                .filter(entry -> entry.getRole() == role)
                .filter(entry -> entry.getPermission().equalsIgnoreCase(permission))
                .findFirst()
                .map(RolePermission::isAllowed)
                .orElse(role == Enums.Role.ADMIN);
    }

    public void require(CurrentUser actor, Enums.Permission permission) {
        if (!allows(actor.role(), permission.label())) {
            throw new ForbiddenException("Your role cannot access " + permission.label().toLowerCase() + ".");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> matrix() {
        Map<String, Map<String, Boolean>> byRole = new LinkedHashMap<>();
        for (Enums.Role role : Enums.Role.values()) {
            Map<String, Boolean> row = new LinkedHashMap<>();
            for (Enums.Permission permission : Enums.Permission.values()) {
                row.put(permission.label(), false);
            }
            byRole.put(role.name(), row);
        }
        for (RolePermission entry : permissions.findAll()) {
            byRole.computeIfAbsent(entry.getRole().name(), key -> new LinkedHashMap<>())
                    .put(entry.getPermission(), entry.isAllowed());
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        byRole.forEach((role, row) -> {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("role", role);
            view.put("permissions", row);
            rows.add(view);
        });
        return rows;
    }

    @Transactional
    public void update(String roleName, String permissionLabel, boolean allowed) {
        Enums.Role role;
        try {
            role = Enums.Role.valueOf(roleName.toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ForbiddenException("Unknown role: " + roleName);
        }
        Enums.Permission permission = Enums.Permission.fromLabel(permissionLabel);
        RolePermission entry = permissions.findAll().stream()
                .filter(existing -> existing.getRole() == role
                        && existing.getPermission().equalsIgnoreCase(permission.label()))
                .findFirst()
                .orElseGet(() -> new RolePermission(role, permission, allowed));
        entry.setAllowed(allowed);
        permissions.save(entry);
    }
}
