package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Material;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findAllByOrderByCreatedAtDesc();
}
