package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.LearningResource;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {

    List<LearningResource> findAllByOrderByCreatedAtDesc();

    List<LearningResource> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
}
