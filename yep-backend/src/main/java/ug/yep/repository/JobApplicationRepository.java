package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByPostingIdOrderByCreatedAtDesc(Long postingId);

    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<JobApplication> findByPostingIdAndUserId(Long postingId, Long userId);

    long countByStatus(String status);
}
