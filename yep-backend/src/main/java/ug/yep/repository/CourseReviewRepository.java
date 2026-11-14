package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.CourseReview;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    List<CourseReview> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<CourseReview> findByUserIdAndCourseId(Long userId, Long courseId);

    long countByCourseId(Long courseId);
}
