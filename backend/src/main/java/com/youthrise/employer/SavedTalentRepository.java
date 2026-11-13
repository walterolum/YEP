package com.youthrise.employer;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedTalentRepository extends JpaRepository<SavedTalent, String> {

    Optional<SavedTalent> findByEmployerIdAndTalentId(String employerId, String talentId);

    boolean existsByEmployerIdAndTalentId(String employerId, String talentId);

    void deleteByEmployerIdAndTalentId(String employerId, String talentId);
}
