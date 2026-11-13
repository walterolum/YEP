package com.youthrise.notification;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Notification> findByIdAndUserId(String id, String userId);

    @Modifying(clearAutomatically = true)
    @Query("""
            update Notification n set n.readAt = :now
            where n.user.id = :userId and n.readAt is null
            """)
    int markAllRead(@Param("userId") String userId, @Param("now") Instant now);
}
