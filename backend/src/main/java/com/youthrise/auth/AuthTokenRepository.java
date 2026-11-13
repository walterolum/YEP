package com.youthrise.auth;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthTokenRepository extends JpaRepository<AuthToken, String> {

    Optional<AuthToken> findByTokenHashAndPurpose(String tokenHash, AuthToken.Purpose purpose);

    List<AuthToken> findByUserIdAndPurposeAndUsedAtIsNull(String userId, AuthToken.Purpose purpose);
}
