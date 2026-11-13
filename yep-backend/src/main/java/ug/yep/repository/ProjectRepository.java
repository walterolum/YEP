package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Enums;
import ug.yep.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByOrderByCreatedAtDesc();

    List<Project> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);

    List<Project> findByStatusOrderByCreatedAtDesc(Enums.ProjectStatus status);

    long countByStatusNot(Enums.ProjectStatus status);

    Optional<Project> findByTitleIgnoreCase(String title);
}
