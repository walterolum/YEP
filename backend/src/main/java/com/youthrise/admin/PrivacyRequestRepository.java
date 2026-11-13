package com.youthrise.admin;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivacyRequestRepository extends JpaRepository<PrivacyRequest, String> {

    List<PrivacyRequest> findAllByOrderByReceivedAtDesc();

    long countByStatusNot(PrivacyRequestStatus status);
}
