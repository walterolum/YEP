package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Module;

public interface ModuleRepository extends JpaRepository<Module, Long> {

    List<Module> findAllByOrderBySortOrderAsc();
}
