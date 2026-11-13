package com.youthrise.badge;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, String> {

    Optional<Badge> findByCodeIgnoreCase(String code);

    List<Badge> findAllByOrderByNameAsc();
}
