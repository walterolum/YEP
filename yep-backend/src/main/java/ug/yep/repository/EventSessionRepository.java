package ug.yep.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.EventSession;

public interface EventSessionRepository extends JpaRepository<EventSession, Long> {

    List<EventSession> findAllByOrderByStartsAtAsc();

    List<EventSession> findByStartsAtBetweenOrderByStartsAtAsc(Instant from, Instant to);

    List<EventSession> findByStartsAtAfterOrderByStartsAtAsc(Instant from);
}
