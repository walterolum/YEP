package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ug.yep.entity.PracticeAttempt;

public interface PracticeAttemptRepository extends JpaRepository<PracticeAttempt, Long> {

    long countByUserIdAndCorrectTrue(Long userId);

    List<PracticeAttempt> findByUserIdOrderByCreatedAtAsc(Long userId);

    @Query("select a from PracticeAttempt a join fetch a.question q join fetch q.assessment s "
            + "join fetch s.module m where a.user.id = :userId and m.course.id = :courseId")
    List<PracticeAttempt> findForCourse(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
