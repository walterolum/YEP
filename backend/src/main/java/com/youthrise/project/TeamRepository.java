package com.youthrise.project;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeamRepository extends JpaRepository<Team, String> {

    @EntityGraph(attributePaths = {"programme", "mentor", "project", "memberships", "memberships.user"})
    @Query("select distinct t from Team t join t.memberships m where m.user.id = :userId order by t.name asc")
    List<Team> findForMember(@Param("userId") String userId);

    @EntityGraph(attributePaths = {"programme", "mentor", "project", "memberships", "memberships.user"})
    List<Team> findByMentorIdOrderByNameAsc(String mentorId);

    @Override
    @EntityGraph(attributePaths = {"programme", "mentor", "project", "memberships", "memberships.user"})
    Optional<Team> findById(String id);

    boolean existsByProgrammeIdAndNameIgnoreCase(String programmeId, String name);

    @EntityGraph(attributePaths = {"memberships", "memberships.user"})
    List<Team> findByProgrammeId(String programmeId);

    long countByProgrammeFacilitatorId(String facilitatorId);
}
