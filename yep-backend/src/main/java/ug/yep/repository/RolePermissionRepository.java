package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.RolePermission;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermission.Key> {

    List<RolePermission> findAllByOrderByRoleAsc();
}
