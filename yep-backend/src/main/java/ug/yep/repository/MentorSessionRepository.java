package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.MentorSession;

public interface MentorSessionRepository extends JpaRepository<MentorSession, Long> {

    List<MentorSession> findByMentorshipMentorIdOrderByStartsAtAsc(Long mentorId);
}
