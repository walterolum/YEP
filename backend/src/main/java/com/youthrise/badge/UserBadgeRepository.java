package com.youthrise.badge;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeRepository extends JpaRepository<UserBadge, String> {

    @EntityGraph(attributePaths = {"badge", "awardedBy"})
    List<UserBadge> findByUserIdOrderByAwardedAtDesc(String userId);

    boolean existsByUserIdAndBadgeId(String userId, String badgeId);
}
