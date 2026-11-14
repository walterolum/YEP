package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Sponsorship;

public interface SponsorshipRepository extends JpaRepository<Sponsorship, Long> {

    List<Sponsorship> findBySponsorIdOrderByCreatedAtDesc(Long sponsorId);

    boolean existsBySponsorIdAndLearnerIdAndCourseId(Long sponsorId, Long learnerId, Long courseId);
}
