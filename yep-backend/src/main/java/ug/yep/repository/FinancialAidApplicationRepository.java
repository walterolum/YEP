package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.FinancialAidApplication;

public interface FinancialAidApplicationRepository extends JpaRepository<FinancialAidApplication, Long> {

    List<FinancialAidApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<FinancialAidApplication> findByStatusOrderByCreatedAtAsc(String status);

    List<FinancialAidApplication> findAllByOrderByCreatedAtDesc();

    Optional<FinancialAidApplication> findByUserIdAndCourseId(Long userId, Long courseId);
}
