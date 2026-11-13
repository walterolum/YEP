package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.LessonProgress;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {

    List<LessonProgress> findByUserId(Long userId);

    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    long countByUserId(Long userId);

    void deleteByUserIdAndLessonId(Long userId, Long lessonId);
}
