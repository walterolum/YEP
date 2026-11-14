package ug.yep.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.CodingExercise;

public interface CodingExerciseRepository extends JpaRepository<CodingExercise, Long> {

    Optional<CodingExercise> findFirstByLessonIdOrderByIdAsc(Long lessonId);
}
