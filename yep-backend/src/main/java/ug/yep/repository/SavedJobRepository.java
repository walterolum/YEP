package ug.yep.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.SavedJob;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {

    List<SavedJob> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByPostingIdAndUserId(Long postingId, Long userId);

    void deleteByPostingIdAndUserId(Long postingId, Long userId);
}
