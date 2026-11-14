package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.SessionFeedback;

public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, Long> {

    List<SessionFeedback> findBySessionIdOrderByCreatedAtDesc(Long sessionId);

    Optional<SessionFeedback> findBySessionIdAndUserId(Long sessionId, Long userId);
}
