package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Deliverable;

public interface DeliverableRepository extends JpaRepository<Deliverable, Long> {

    List<Deliverable> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
