package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Lesson;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByModuleIdOrderBySortOrderAsc(Long moduleId);

    List<Lesson> findAllByOrderByModuleSortOrderAscSortOrderAsc();

    long countByModuleId(Long moduleId);
}
