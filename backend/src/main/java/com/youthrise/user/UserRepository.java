package com.youthrise.user;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByOrderByFullNameAsc();

    /** Directory search for administrators; a null term lists every account. */
    @Query("""
            select u from User u
            where :term is null
               or lower(u.fullName) like lower(concat('%', :term, '%'))
               or lower(u.email) like lower(concat('%', :term, '%'))
            order by u.fullName asc
            """)
    List<User> searchDirectory(@Param("term") String term);

    /**
     * Role is the single-table inheritance discriminator, so it cannot be
     * changed through a managed entity. This narrow statement is the only
     * supported way to move an account between roles; the caller must clear the
     * persistence context afterwards.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "update users set role = :role, updated_at = :updatedAt where id = :id",
            nativeQuery = true)
    int updateRole(@Param("id") String id, @Param("role") String role,
                   @Param("updatedAt") Instant updatedAt);
}
