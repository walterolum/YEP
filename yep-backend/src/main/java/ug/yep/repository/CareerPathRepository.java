package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.CareerPath;

public interface CareerPathRepository extends JpaRepository<CareerPath, Long> {

    Optional<CareerPath> findBySlug(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    List<CareerPath> findByAcademyIdOrderBySortOrderAscTitleAsc(Long academyId);

    List<CareerPath> findByAcademyIdAndPublishedTrueOrderBySortOrderAscTitleAsc(Long academyId);

    List<CareerPath> findAllByOrderBySortOrderAscTitleAsc();

    long countByPublishedTrue();
}
