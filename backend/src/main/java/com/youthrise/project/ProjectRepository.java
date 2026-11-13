package com.youthrise.project;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, String> {

    Optional<Project> findByTeamId(String teamId);
}
