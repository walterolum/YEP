package com.youthrise.programme;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningModuleRepository extends JpaRepository<LearningModule, String> {

    List<LearningModule> findByProgrammeIdOrderByPositionAsc(String programmeId);

    List<LearningModule> findByProgrammeFacilitatorIdOrderByProgrammeIdAscPositionAsc(String facilitatorId);

    long countByProgrammeIdAndStatus(String programmeId, ContentStatus status);
}
