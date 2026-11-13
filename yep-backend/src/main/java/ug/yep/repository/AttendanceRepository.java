package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findBySessionId(Long sessionId);

    List<Attendance> findByUserId(Long userId);

    Optional<Attendance> findBySessionIdAndUserId(Long sessionId, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndPresentTrue(Long userId);
}
