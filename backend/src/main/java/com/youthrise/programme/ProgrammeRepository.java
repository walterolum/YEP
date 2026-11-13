package com.youthrise.programme;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProgrammeRepository extends JpaRepository<Programme, String> {

    @EntityGraph(attributePaths = "facilitator")
    List<Programme> findByStatusNotOrderByStartsAtAsc(ProgrammeStatus status);

    @EntityGraph(attributePaths = "facilitator")
    List<Programme> findByFacilitatorIdOrderByStartsAtAsc(String facilitatorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Programme p where p.id = :id")
    Optional<Programme> findByIdForUpdate(@Param("id") String id);

    long countByStatusNot(ProgrammeStatus status);
}
