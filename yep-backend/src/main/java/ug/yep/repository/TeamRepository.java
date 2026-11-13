package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ug.yep.entity.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    @Query("select distinct t from Team t join t.members m where m.id = :userId")
    List<Team> findByMemberId(@Param("userId") Long userId);

    List<Team> findByMentorIdOrderByNameAsc(Long mentorId);

    List<Team> findAllByOrderByNameAsc();

    Optional<Team> findByProjectId(Long projectId);
}
