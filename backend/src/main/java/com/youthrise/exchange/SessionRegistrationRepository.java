package com.youthrise.exchange;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionRegistrationRepository extends JpaRepository<SessionRegistration, String> {

    Optional<SessionRegistration> findBySessionIdAndUserId(String sessionId, String userId);

    @EntityGraph(attributePaths = {"session", "session.programme"})
    List<SessionRegistration> findByUserId(String userId);

    long countBySessionId(String sessionId);

    @Query("select r.session.id from SessionRegistration r where r.user.id = :userId")
    List<String> findSessionIdsForUser(@Param("userId") String userId);

    /** Aggregated registration facts used for attendance reporting: [userId, programmeId, sessionId]. */
    @Query("""
            select r.user.id, r.session.programme.id, r.session.id from SessionRegistration r
            where r.session.programme.id in :programmeIds
            """)
    List<Object[]> findRegistrationFacts(@Param("programmeIds") Collection<String> programmeIds);
}
