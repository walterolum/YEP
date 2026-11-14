package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.SessionSeries;

public interface SessionSeriesRepository extends JpaRepository<SessionSeries, Long> {

    List<SessionSeries> findByCreatedByIdOrderByStartsAtDesc(Long userId);
}
