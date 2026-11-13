package com.youthrise.assessment;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentRepository extends JpaRepository<Assessment, String> {

    List<Assessment> findByProgrammeIdInAndPublishedTrueOrderByDueAtAsc(Collection<String> programmeIds);

    List<Assessment> findByProgrammeIdAndPublishedTrueOrderByDueAtAsc(String programmeId);
}
