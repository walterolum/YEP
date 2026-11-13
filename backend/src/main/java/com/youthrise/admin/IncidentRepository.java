package com.youthrise.admin;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, String> {

    List<Incident> findAllByOrderByReportedAtDesc();

    long countByStatusNot(IncidentStatus status);
}
