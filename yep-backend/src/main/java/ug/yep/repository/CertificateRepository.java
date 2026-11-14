package ug.yep.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.Certificate;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByCodeIgnoreCase(String code);

    Optional<Certificate> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByCodeIgnoreCase(String code);

    List<Certificate> findAllByOrderByIssuedAtDesc();

    Optional<Certificate> findFirstByUserIdOrderByIssuedAtDesc(Long userId);

    Optional<Certificate> findByUserIdAndScopeAndScopeId(Long userId, String scope, Long scopeId);

    boolean existsByUserIdAndScopeAndScopeId(Long userId, String scope, Long scopeId);

    long countByIssuedAtAfter(java.time.Instant after);
}
