package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Academy;

public interface AcademyRepository extends JpaRepository<Academy, Long> {

    Optional<Academy> findBySlug(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    List<Academy> findAllByOrderBySortOrderAscNameAsc();

    List<Academy> findByPublishedTrueOrderBySortOrderAscNameAsc();

    long countByPublishedTrue();
}
