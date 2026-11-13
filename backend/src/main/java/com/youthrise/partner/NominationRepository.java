package com.youthrise.partner;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NominationRepository extends JpaRepository<Nomination, String> {

    List<Nomination> findAllByOrderByNominatedAtDesc();

    List<Nomination> findByNominatedByIdOrderByNominatedAtDesc(String nominatedById);

    @Query("select distinct n.programme.id from Nomination n where n.nominatedBy.id = :userId")
    List<String> findProgrammeIdsByNominatedById(@Param("userId") String userId);

    boolean existsByProgrammeIdAndLearnerEmailIgnoreCaseAndStatusNot(String programmeId, String learnerEmail,
                                                                     NominationStatus status);

    long countByStatus(NominationStatus status);
}
