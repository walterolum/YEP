package com.youthrise.project;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubmissionRepository extends JpaRepository<Submission, String> {

    List<Submission> findByTeamIdOrderBySubmittedAtDesc(String teamId);

    List<Submission> findByTeamMentorIdOrderBySubmittedAtDesc(String mentorId);

    @Query("""
            select count(s) from Submission s
            where s.team.programme.facilitator.id = :facilitatorId and s.status in :statuses
            """)
    long countForFacilitatorByStatus(@Param("facilitatorId") String facilitatorId,
                                     @Param("statuses") Collection<SubmissionStatus> statuses);

    long countByStatusIn(Collection<SubmissionStatus> statuses);
}
