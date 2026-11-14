package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.LessonPost;

public interface LessonPostRepository extends JpaRepository<LessonPost, Long> {

    List<LessonPost> findByLessonIdOrderByCreatedAtAsc(Long lessonId);

    long countByUserId(Long userId);
}
