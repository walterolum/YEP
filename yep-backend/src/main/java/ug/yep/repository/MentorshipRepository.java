package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Enums;
import ug.yep.entity.Mentorship;

public interface MentorshipRepository extends JpaRepository<Mentorship, Long> {

    List<Mentorship> findByMentorIdOrderByCreatedAtDesc(Long mentorId);

    List<Mentorship> findByMenteeIdOrderByCreatedAtDesc(Long menteeId);

    List<Mentorship> findByMentorIdAndStatusOrderByCreatedAtDesc(Long mentorId, Enums.MentorshipStatus status);

    Optional<Mentorship> findByMentorIdAndMenteeId(Long mentorId, Long menteeId);
}
