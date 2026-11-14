package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.AssessmentAttempt;

public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {

    Optional<AssessmentAttempt> findFirstByAssessmentIdAndUserIdAndStatusOrderByStartedAtDesc(
            Long assessmentId, Long userId, String status);

    List<AssessmentAttempt> findByAssessmentIdAndUserIdOrderByStartedAtDesc(Long assessmentId,
                                                                           Long userId);
}
