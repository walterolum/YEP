package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.CodeSubmission;

public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, Long> {

    List<CodeSubmission> findByUserIdAndExerciseIdOrderByCreatedAtDesc(Long userId, Long exerciseId);
}
