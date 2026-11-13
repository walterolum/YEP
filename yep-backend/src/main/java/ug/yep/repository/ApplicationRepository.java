package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Application;
import ug.yep.entity.Enums;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Application> findByProgrammeId(Long programmeId);

    Optional<Application> findByProgrammeIdAndUserId(Long programmeId, Long userId);

    long countByProgrammeIdAndStatus(Long programmeId, Enums.ApplicationStatus status);
}
