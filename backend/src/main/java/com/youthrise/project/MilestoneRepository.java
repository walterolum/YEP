package com.youthrise.project;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, String> {

    Optional<Milestone> findByIdAndProjectId(String id, String projectId);
}
