package ug.yep.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Views;
import ug.yep.entity.EmailVerificationToken;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.EmailVerificationTokenRepository;
import ug.yep.repository.UserRepository;

/**
 * Issues and redeems single-use email verification tokens.
 *
 * <p>The raw token is never stored: only its SHA-256 hash. Until an SMTP provider is
 * configured (Phase 5), the token is delivered as an in-app notification, which keeps
 * the flow testable end to end without pretending mail was sent.</p>
 */
@Service
public class VerificationService {

    private static final Duration LIFETIME = Duration.ofHours(24);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailVerificationTokenRepository tokens;
    private final UserRepository users;
    private final NotificationService notifications;
    private final AuditService audit;

    public VerificationService(EmailVerificationTokenRepository tokens, UserRepository users,
                               NotificationService notifications, AuditService audit) {
        this.tokens = tokens;
        this.users = users;
        this.notifications = notifications;
        this.audit = audit;
    }

    /** Issues a token for the account and returns the raw value exactly once. */
    @Transactional
    public String issue(User user) {
        tokens.findFirstByUserAndUsedAtIsNullOrderByCreatedAtDesc(user)
                .ifPresent(EmailVerificationToken::use);
        String raw = randomToken();
        tokens.save(new EmailVerificationToken(user, hash(raw), Instant.now().plus(LIFETIME)));
        return raw;
    }

    @Transactional
    public Views.UserView verify(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BusinessRuleException("That verification link is not valid.");
        }
        EmailVerificationToken token = tokens.findByTokenHash(hash(rawToken.trim()))
                .orElseThrow(() -> new BusinessRuleException("That verification link is not valid."));
        if (!token.isUsable(Instant.now())) {
            throw new BusinessRuleException(
                    "That verification link has expired or was already used. Request a new one.");
        }
        User user = token.getUser();
        user.markEmailVerified();
        users.save(user);
        token.use();
        audit.record(user, "EMAIL_VERIFIED", "user", user.getId(), "Email address verified");
        return Views.UserView.of(user);
    }

    /** Re-issues a token and delivers it in-app; returns the raw value for development tools. */
    @Transactional
    public String resend(User user) {
        String raw = issue(user);
        notifications.send(user, "ACCOUNT",
                "Verify your email address with this code: " + raw
                        + " (valid for 24 hours).");
        return raw;
    }

    private static String randomToken() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }
}
