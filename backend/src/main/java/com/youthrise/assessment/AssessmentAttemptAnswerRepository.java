package com.youthrise.assessment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentAttemptAnswerRepository extends JpaRepository<AssessmentAttemptAnswer, String> {

    List<AssessmentAttemptAnswer> findByAttemptId(String attemptId);
}
