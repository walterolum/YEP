package com.youthrise.auth;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsentRepository extends JpaRepository<Consent, String> {

    List<Consent> findByUserId(String userId);
}
