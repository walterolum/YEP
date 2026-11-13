package com.youthrise.exchange;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExchangeSessionRepository extends JpaRepository<ExchangeSession, String> {

    @EntityGraph(attributePaths = {"programme", "facilitator"})
    List<ExchangeSession> findAllByOrderByStartsAtAsc();

    @EntityGraph(attributePaths = {"programme", "facilitator"})
    List<ExchangeSession> findByProgrammeIdInOrderByStartsAtAsc(Collection<String> programmeIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ExchangeSession s where s.id = :id")
    Optional<ExchangeSession> findByIdForUpdate(@Param("id") String id);
}
