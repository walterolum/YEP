package com.youthrise.auth;

import com.youthrise.common.ApiException;
import com.youthrise.common.AuditService;
import com.youthrise.common.Hashes;
import com.youthrise.common.RateLimiter;
import com.youthrise.common.exception.DuplicateEmailException;
import com.youthrise.config.AppProperties;
import com.youthrise.user.AccountStatus;
import com.youthrise.user.EligibilityPolicy;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserDtos;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int VERIFICATION_CODE_DIGITS = 1_000_000;
    private static final int MAX_CODE_ATTEMPTS = 5;
    private static final Duration VERIFICATION_TTL = Duration.ofMinutes(30);
    private static final Duration RESET_TTL = Duration.ofMinutes(30);
    private static final String GENERIC_RESET_MESSAGE =
            "If an account exists for that address, a reset link has been sent.";

    private final UserRepository users;
    private final AuthTokenRepository tokens;
    private final ConsentRepository consents;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;
    private final CsrfTokenRepository csrfTokenRepository;
    private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;
    private final RateLimiter rateLimiter;
    private final Mailer mailer;
    private final AuditService audit;
    private final AppProperties properties;
    private final SecureRandom random = new SecureRandom();
    private final String dummyHash;

    public AuthService(UserRepository users, AuthTokenRepository tokens, ConsentRepository consents,
                       PasswordEncoder passwordEncoder, SecurityContextRepository securityContextRepository,
                       CsrfTokenRepository csrfTokenRepository,
                       FindByIndexNameSessionRepository<? extends Session> sessionRepository,
                       RateLimiter rateLimiter, Mailer mailer, AuditService audit, AppProperties properties) {
        this.users = users;
        this.tokens = tokens;
        this.consents = consents;
        this.passwordEncoder = passwordEncoder;
        this.securityContextRepository = securityContextRepository;
        this.csrfTokenRepository = csrfTokenRepository;
        this.sessionRepository = sessionRepository;
        this.rateLimiter = rateLimiter;
        this.mailer = mailer;
        this.audit = audit;
        this.properties = properties;
        // Equalises the cost of an unknown-account login with a wrong-password login.
        this.dummyHash = passwordEncoder.encode(java.util.UUID.randomUUID().toString());
    }

    @Transactional
    public AuthDtos.AuthSessionResponse register(AuthDtos.RegisterRequest request,
                                                 HttpServletRequest httpRequest,
                                                 HttpServletResponse httpResponse) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiter.check("register:ip:" + ip, 10, Duration.ofHours(1));

        String email = User.normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw emailInUse();
        }
        EligibilityPolicy.requireEligible(request.dateOfBirth());

        User user = User.register(request.fullName(), email, request.phone(), request.country(),
                passwordEncoder.encode(request.password()), "Africa/Kampala", request.dateOfBirth());
        Set<String> interests = request.interests() == null ? Set.of() : request.interests();
        user.updateProfile(null, null, null, null, null, null, null, interests, null, null, null);
        try {
            users.saveAndFlush(user);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw emailInUse();
        }

        consents.save(Consent.record(user, Consent.Type.PRIVACY_POLICY, true, properties.policyVersion()));
        consents.save(Consent.record(user, Consent.Type.COMMUNICATIONS,
                request.communicationsConsent(), properties.policyVersion()));

        String code = issueVerificationCode(user);
        mailer.sendEmailVerification(user.getEmail(), user.getFullName(), code);
        audit.success(user.getId(), user.getEmail(), user.getRole().name(), "REGISTER", "user:" + user.getId(), ip);

        establishSession(user, httpRequest, httpResponse);
        return sessionResponse(user, httpRequest);
    }

    @Transactional
    public AuthDtos.AuthSessionResponse login(AuthDtos.LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        String ip = httpRequest.getRemoteAddr();
        String email = User.normalizeEmail(request.email());
        rateLimiter.check("login:ip:" + ip, 40, Duration.ofMinutes(15));
        rateLimiter.check("login:account:" + email, 10, Duration.ofMinutes(15));

        User user = users.findByEmailIgnoreCase(email).orElse(null);
        String hash = user == null ? dummyHash : user.getPasswordHash();
        boolean matches = hash != null && passwordEncoder.matches(request.password(), hash);

        if (user == null || !matches) {
            audit.failed(user == null ? null : user.getId(), email,
                    user == null ? null : user.getRole().name(), "LOGIN", "session", "invalid_credentials", ip);
            throw ApiException.unauthorized("INVALID_CREDENTIALS", "The email or password is not correct.");
        }
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            audit.failed(user.getId(), email, user.getRole().name(), "LOGIN", "session", "suspended", ip);
            throw ApiException.forbidden("ACCOUNT_SUSPENDED",
                    "This account is suspended. Contact platform support if you believe this is an error.");
        }
        if (user.getStatus() == AccountStatus.INVITED) {
            audit.failed(user.getId(), email, user.getRole().name(), "LOGIN", "session", "invited", ip);
            throw ApiException.forbidden("ACCOUNT_INVITED",
                    "This invitation has not been activated yet. Use the invitation link in your email.");
        }
        if (user.getPasswordHash() == null) {
            throw ApiException.forbidden("ACCOUNT_NOT_ACTIVE", "This account is not ready to sign in yet.");
        }

        user.recordLogin(Instant.now());
        rateLimiter.reset("login:account:" + email);
        rateLimiter.reset("login:ip:" + ip);
        audit.success(user.getId(), user.getEmail(), user.getRole().name(), "LOGIN", "session", ip);

        establishSession(user, httpRequest, httpResponse);
        return sessionResponse(user, httpRequest);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AuthSessionResponse currentSession(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return null;
        }
        User user = users.findById(principal.id()).orElse(null);
        if (user == null || !user.isActive()) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            return null;
        }
        return sessionResponse(user, request);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            audit.success(principal.id(), principal.email(), principal.role().name(), "LOGOUT", "session",
                    request.getRemoteAddr());
        }
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        csrfTokenRepository.saveToken(null, request, response);
    }

    @Transactional
    public AuthDtos.MessageResponse requestPasswordReset(AuthDtos.PasswordResetRequest request,
                                                         HttpServletRequest httpRequest) {
        String email = User.normalizeEmail(request.email());
        String ip = httpRequest.getRemoteAddr();
        rateLimiter.check("reset:ip:" + ip, 20, Duration.ofHours(1));
        rateLimiter.check("reset:account:" + email, 5, Duration.ofHours(1));

        users.findByEmailIgnoreCase(email).filter(User::isActive).ifPresent(user -> {
            tokens.findByUserIdAndPurposeAndUsedAtIsNull(user.getId(), AuthToken.Purpose.PASSWORD_RESET)
                    .forEach(AuthToken::markUsed);
            String rawToken = randomToken(32);
            tokens.save(AuthToken.issue(user, AuthToken.Purpose.PASSWORD_RESET,
                    Hashes.sha256(rawToken), Instant.now().plus(RESET_TTL)));
            String url = properties.publicAppUrl() + "/reset-password?token=" + rawToken;
            mailer.sendPasswordReset(user.getEmail(), user.getFullName(), url);
            audit.success(user.getId(), user.getEmail(), user.getRole().name(),
                    "PASSWORD_RESET_REQUESTED", "user:" + user.getId(), ip);
        });
        // The same answer is returned for known and unknown addresses.
        return new AuthDtos.MessageResponse(GENERIC_RESET_MESSAGE);
    }

    @Transactional(noRollbackFor = ApiException.class)
    public AuthDtos.MessageResponse resetPassword(AuthDtos.PasswordResetConfirmRequest request,
                                                  HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiter.check("reset-confirm:ip:" + ip, 20, Duration.ofHours(1));

        AuthToken token = tokens
                .findByTokenHashAndPurpose(Hashes.sha256(request.token()), AuthToken.Purpose.PASSWORD_RESET)
                .orElseThrow(() -> ApiException.badRequest("INVALID_CODE",
                        "That reset link is not recognised. Request a new link."));
        if (token.getUsedAt() != null || !Instant.now().isBefore(token.getExpiresAt())) {
            throw ApiException.gone("RESET_LINK_EXPIRED",
                    "This reset link has expired. Request a new link to continue.");
        }

        User user = token.getUser();
        if (!user.isActive()) {
            throw ApiException.forbidden("ACCOUNT_SUSPENDED", "This account cannot be reset while suspended.");
        }
        user.changePassword(passwordEncoder.encode(request.password()));
        user.markEmailVerified(Instant.now());
        token.markUsed();
        invalidateSessions(user.getEmail());
        audit.success(user.getId(), user.getEmail(), user.getRole().name(),
                "PASSWORD_RESET", "user:" + user.getId(), ip);
        return new AuthDtos.MessageResponse("Your password has been updated. Sign in to continue.");
    }

    /**
     * Changes the password of the signed-in account after checking the current
     * one. Other sessions are invalidated so a stolen session cannot outlive the
     * change.
     */
    @Transactional
    public AuthDtos.MessageResponse changePassword(AuthDtos.ChangePasswordRequest request,
                                                   UserPrincipal principal,
                                                   HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiter.check("password-change:" + principal.id(), 5, Duration.ofHours(1));
        User user = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND",
                        "That account could not be found."));
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            audit.failed(user.getId(), user.getEmail(), user.getRole().name(),
                    "PASSWORD_CHANGE", "user:" + user.getId(), "wrong_current_password", ip);
            throw ApiException.validation("currentPassword", "Your current password is not correct.");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw ApiException.validation("newPassword", "Choose a password you have not used before.");
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        invalidateSessions(user.getEmail());
        audit.success(user.getId(), user.getEmail(), user.getRole().name(),
                "PASSWORD_CHANGED", "user:" + user.getId(), ip);
        return new AuthDtos.MessageResponse("Your password has been updated. Sign in again to continue.");
    }

    @Transactional(noRollbackFor = ApiException.class)
    public AuthDtos.VerifiedResponse verifyEmail(AuthDtos.VerifyRequest request,
                                                 UserPrincipal principal,
                                                 HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiter.check("verify:ip:" + ip, 20, Duration.ofHours(1));
        String hash = Hashes.sha256(request.code().trim());

        AuthToken token = (principal == null
                ? tokens.findByTokenHashAndPurpose(hash, AuthToken.Purpose.EMAIL_VERIFICATION)
                : tokens.findByUserIdAndPurposeAndUsedAtIsNull(principal.id(), AuthToken.Purpose.EMAIL_VERIFICATION)
                        .stream().filter(candidate -> candidate.getTokenHash().equals(hash)).findFirst())
                .orElse(null);

        if (token == null || !token.isUsable(Instant.now(), MAX_CODE_ATTEMPTS)) {
            if (principal != null) {
                tokens.findByUserIdAndPurposeAndUsedAtIsNull(principal.id(), AuthToken.Purpose.EMAIL_VERIFICATION)
                        .forEach(AuthToken::registerFailedAttempt);
            }
            audit.failed(principal == null ? null : principal.id(),
                    principal == null ? null : principal.email(),
                    principal == null ? null : principal.role().name(),
                    "EMAIL_VERIFY", "user", "invalid_code", ip);
            throw ApiException.badRequest("INVALID_CODE",
                    "That verification code is not correct or has expired. Request a new code.");
        }

        User user = token.getUser();
        token.markUsed();
        user.markEmailVerified(Instant.now());
        audit.success(user.getId(), user.getEmail(), user.getRole().name(),
                "EMAIL_VERIFIED", "user:" + user.getId(), ip);
        return new AuthDtos.VerifiedResponse(true);
    }

    @Transactional(readOnly = true)
    public boolean isEmailVerified(String userId) {
        return users.findById(userId).map(User::isEmailVerified).orElse(false);
    }

    private String issueVerificationCode(User user) {
        tokens.findByUserIdAndPurposeAndUsedAtIsNull(user.getId(), AuthToken.Purpose.EMAIL_VERIFICATION)
                .forEach(AuthToken::markUsed);
        for (int attempt = 0; attempt < 5; attempt++) {
            String code = String.format(Locale.ROOT, "%06d", random.nextInt(VERIFICATION_CODE_DIGITS));
            String hash = Hashes.sha256(code);
            if (tokens.findByTokenHashAndPurpose(hash, AuthToken.Purpose.EMAIL_VERIFICATION).isEmpty()) {
                tokens.save(AuthToken.issue(user, AuthToken.Purpose.EMAIL_VERIFICATION,
                        hash, Instant.now().plus(VERIFICATION_TTL)));
                return code;
            }
        }
        throw new IllegalStateException("Could not allocate a unique verification code");
    }

    private String randomToken(int bytes) {
        byte[] buffer = new byte[bytes];
        random.nextBytes(buffer);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
    }

    private ApiException emailInUse() {
        return new DuplicateEmailException();
    }

    private void establishSession(User user, HttpServletRequest request, HttpServletResponse response) {
        HttpSession existing = request.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }
        HttpSession session = request.getSession(true);
        session.setMaxInactiveInterval((int) Duration.ofHours(8).toSeconds());

        UserPrincipal principal = UserPrincipal.from(user);
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        // A new login gets a new CSRF token as well as a new session identifier.
        csrfTokenRepository.saveToken(null, request, response);
        CsrfToken token = csrfTokenRepository.generateToken(request);
        csrfTokenRepository.saveToken(token, request, response);
    }

    private void invalidateSessions(String email) {
        Map<String, ? extends Session> sessions = sessionRepository.findByPrincipalName(email);
        sessions.keySet().forEach(sessionRepository::deleteById);
    }

    private AuthDtos.AuthSessionResponse sessionResponse(User user, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        long now = System.currentTimeMillis();
        long issuedAt = session == null ? now : session.getCreationTime();
        long expiresAt = session == null ? now + Duration.ofHours(8).toMillis()
                : session.getLastAccessedTime() + session.getMaxInactiveInterval() * 1000L;
        return new AuthDtos.AuthSessionResponse(UserDtos.UserResponse.from(user), issuedAt, expiresAt, false);
    }
}
