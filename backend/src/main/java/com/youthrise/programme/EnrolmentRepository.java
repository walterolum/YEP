package com.youthrise.programme;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EnrolmentRepository extends JpaRepository<Enrolment, String> {

    Optional<Enrolment> findByProgrammeIdAndUserId(String programmeId, String userId);

    List<Enrolment> findByUserIdOrderByEnrolledAtDesc(String userId);

    long countByProgrammeIdAndStatus(String programmeId, EnrolmentStatus status);

    @Query("""
            select count(e) from Enrolment e
            where e.programme.id = :programmeId and e.status in ('active', 'completed')
            """)
    long countSeated(@Param("programmeId") String programmeId);

    List<Enrolment> findByProgrammeId(String programmeId);

    @Query("select count(distinct e.programme.id) from Enrolment e")
    long countActiveCohorts();

    @EntityGraph(attributePaths = {"programme", "user"})
    List<Enrolment> findAllByOrderByEnrolledAtDesc();

    @EntityGraph(attributePaths = {"programme", "user"})
    List<Enrolment> findByProgrammeIdInOrderByEnrolledAtDesc(Collection<String> programmeIds);

    @EntityGraph(attributePaths = {"programme", "user"})
    List<Enrolment> findByProgrammeFacilitatorIdOrderByEnrolledAtDesc(String facilitatorId);

    @Query("select coalesce(avg(e.progress), 0) from Enrolment e where e.programme.facilitator.id = :facilitatorId")
    Double averageProgressForFacilitator(@Param("facilitatorId") String facilitatorId);

    @Query("select coalesce(avg(e.progress), 0) from Enrolment e")
    Double averageProgress();
}
