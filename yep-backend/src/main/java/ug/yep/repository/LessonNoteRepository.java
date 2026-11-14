package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.LessonNote;

public interface LessonNoteRepository extends JpaRepository<LessonNote, Long> {

    Optional<LessonNote> findByUserIdAndLessonId(Long userId, Long lessonId);

    List<LessonNote> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
