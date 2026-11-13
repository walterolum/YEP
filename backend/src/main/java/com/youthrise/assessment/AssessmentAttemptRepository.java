package com.youthrise.assessment;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, String> {

    Optional<AssessmentAttempt> findFirstByAssessmentIdAndUserIdOrderByAttemptNoDesc(String assessmentId,
                                                                                     String userId);

    List<AssessmentAttempt> findByAssessmentIdAndUserIdOrderByAttemptNoDesc(String assessmentId, String userId);

    long countByAssessmentIdAndUserId(String assessmentId, String userId);

    Optional<AssessmentAttempt> findByIdAndAssessmentId(String id, String assessmentId);
}
