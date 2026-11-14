package ug.yep.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import ug.yep.entity.EmailVerificationToken;
import ug.yep.entity.User;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    Optional<EmailVerificationToken> findFirstByUserAndUsedAtIsNullOrderByCreatedAtDesc(User user);
}
