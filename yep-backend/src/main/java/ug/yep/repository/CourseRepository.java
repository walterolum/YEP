package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findBySlug(String slug);

    Optional<Course> findByCodeIgnoreCase(String code);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsByCodeIgnoreCase(String code);

    List<Course> findByCareerPathIdOrderBySortOrderAscTitleAsc(Long careerPathId);

    List<Course> findByCareerPathIdAndPublishedTrueOrderBySortOrderAscTitleAsc(Long careerPathId);

    List<Course> findByPublishedTrueOrderBySortOrderAscTitleAsc();

    List<Course> findAllByOrderBySortOrderAscTitleAsc();

    long countByPublishedTrue();
}
