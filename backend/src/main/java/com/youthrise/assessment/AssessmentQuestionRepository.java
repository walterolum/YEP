package com.youthrise.assessment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, String> {

    List<AssessmentQuestion> findByAssessmentIdOrderByPositionAsc(String assessmentId);

    long countByAssessmentId(String assessmentId);
}
