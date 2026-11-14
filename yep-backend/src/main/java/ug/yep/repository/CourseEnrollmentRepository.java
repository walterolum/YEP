package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.CourseEnrollment;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    Optional<CourseEnrollment> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    List<CourseEnrollment> findByUserIdOrderByEnrolledAtDesc(Long userId);

    List<CourseEnrollment> findByCourseId(Long courseId);

    long countByCourseId(Long courseId);
}
