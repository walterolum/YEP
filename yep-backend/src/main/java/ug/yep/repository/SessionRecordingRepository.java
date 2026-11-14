package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.SessionRecording;

public interface SessionRecordingRepository extends JpaRepository<SessionRecording, Long> {

    List<SessionRecording> findBySessionIdOrderByCreatedAtAsc(Long sessionId);
}
