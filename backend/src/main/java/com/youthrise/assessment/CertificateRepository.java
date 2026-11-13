package com.youthrise.assessment;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, String> {

    List<Certificate> findByParticipantIdOrderByCreatedAtDesc(String participantId);

    Optional<Certificate> findByCodeIgnoreCase(String code);

    boolean existsByProgrammeIdAndParticipantId(String programmeId, String participantId);

    long countByStatus(CertificateStatus status);
}
