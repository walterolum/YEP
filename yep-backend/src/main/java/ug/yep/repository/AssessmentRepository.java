package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Assessment;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findAllByOrderByDueDateAsc();

    List<Assessment> findByModuleIdOrderByDueDateAsc(Long moduleId);

    List<Assessment> findByPublishedTrueOrderByDueDateAsc();
}
