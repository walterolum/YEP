package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByAssessmentIdOrderBySubmittedAtAsc(Long assessmentId);

    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);

    Optional<Submission> findByAssessmentIdAndUserId(Long assessmentId, Long userId);

    long countByUserId(Long userId);
}
