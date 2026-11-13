package com.youthrise.employer;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TalentProfileRepository extends JpaRepository<TalentProfile, String> {

    Optional<TalentProfile> findByUserId(String userId);

    @Override
    @EntityGraph(attributePaths = "user")
    List<TalentProfile> findAll();
}
