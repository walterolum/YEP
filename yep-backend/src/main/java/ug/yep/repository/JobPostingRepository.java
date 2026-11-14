package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.JobPosting;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    List<JobPosting> findByPublishedTrueOrderByCreatedAtDesc();

    List<JobPosting> findByEmployerIdOrderByCreatedAtDesc(Long employerId);
}
