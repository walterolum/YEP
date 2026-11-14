package ug.yep.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.CertificateVerification;

public interface CertificateVerificationRepository extends JpaRepository<CertificateVerification, Long> {

    long countByCertificateId(Long certificateId);
}
