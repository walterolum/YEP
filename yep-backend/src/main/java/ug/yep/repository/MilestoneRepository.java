package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Milestone;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectIdOrderBySortOrderAsc(Long projectId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndCompletedTrue(Long projectId);
}
