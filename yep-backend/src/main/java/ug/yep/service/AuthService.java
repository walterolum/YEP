package ug.yep.service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;
import ug.yep.security.JwtUtil;

/** Registration, sign-in and profile management. */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SettingsService settings;
    private final LoginRateLimiter rateLimiter;
    private final AuditService audit;
    private final NotificationService notifications;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       SettingsService settings, LoginRateLimiter rateLimiter, AuditService audit,
                       NotificationService notifications) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.settings = settings;
        this.rateLimiter = rateLimiter;
        this.audit = audit;
        this.notifications = notifications;
    }

    @Transactional
    public Views.AuthView signup(Requests.SignupRequest request) {
        if (request.confirmPassword() != null && !request.confirmPassword().equals(request.password())) {
            throw new BusinessRuleException("The two passwords do not match.");
        }
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessRuleException("An account with that email already exists.");
        }
        if (request.dateOfBirth() == null) {
            throw new BusinessRuleException("Date of birth is required to confirm your age.");
        }
        SettingsService.Policy policy = settings.policy();
        int age = Period.between(request.dateOfBirth(), LocalDate.now()).getYears();
        if (age < policy.minAge() || age > policy.maxAge()) {
            throw new BusinessRuleException("YEP is open to young people aged "
                    + policy.minAge() + " to " + policy.maxAge() + ". Your age does not meet the criteria.");
        }
        User user = User.create(Enums.Role.PARTICIPANT, request.fullName(), request.email(),
                request.phone(), passwordEncoder.encode(request.password()), Enums.UserStatus.PENDING);
        user.updateProfile(request.fullName(), request.phone(), request.country(), request.district(),
                request.dateOfBirth(), request.institution(), request.fieldOfStudy());
        user.changeStatus(Enums.UserStatus.PENDING);
        User saved = users.save(user);
        audit.record(saved, "REGISTER", "user", saved.getId(), "Self-registration submitted");
        return new Views.AuthView(null, 0, Views.UserView.of(saved));
    }

    @Transactional
    public Views.AuthView login(Requests.LoginRequest request) {
        String key = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        rateLimiter.check(key);
        User user = users.findByEmailIgnoreCase(key).orElse(null);
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            rateLimiter.fail(key);
            throw new BusinessRuleException("Incorrect email or password.");
        }
        switch (user.getStatus()) {
            case PENDING -> throw new BusinessRuleException(
                    "Your account is still awaiting approval. You will be notified once it is reviewed.");
            case REJECTED -> throw new BusinessRuleException(
                    "Your application was not approved. Please contact the YEP team for details.");
            case SUSPENDED -> throw new BusinessRuleException(
                    "Your account has been suspended. Please contact the YEP team.");
            default -> {
            }
        }
        rateLimiter.clear(key);
        user.recordLogin();
        CurrentUser current = new CurrentUser(user.getId(), user.getEmail(), user.getFullName(),
                user.getRole());
        String token = jwtUtil.issue(current);
        return new Views.AuthView(token, jwtUtil.expirySeconds(), Views.UserView.of(user));
    }

    @Transactional(readOnly = true)
    public Views.UserView me(Long userId) {
        return Views.UserView.of(require(userId));
    }

    @Transactional
    public Views.UserView updateProfile(Long userId, Requests.ProfileUpdateRequest request) {
        User user = require(userId);
        user.updateProfile(request.fullName(), request.phone(), request.country(), request.district(),
                request.dateOfBirth(), request.institution(), request.fieldOfStudy());
        if (request.skills() != null) {
            user.getSkills().clear();
            request.skills().stream().filter(skill -> skill != null && !skill.isBlank())
                    .limit(20).forEach(user::addSkill);
        }
        return Views.UserView.of(user);
    }

    @Transactional
    public void changePassword(Long userId, Requests.PasswordChangeRequest request) {
        User user = require(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessRuleException("Your current password is incorrect.");
        }
        user.changePassword(passwordEncoder.encode(request.newPassword()));
        audit.record(user, "PASSWORD_CHANGE", "user", user.getId(), "Password updated");
    }

    /** Admin: create a staff or participant account directly. */
    @Transactional
    public Views.UserView createUser(CurrentUser actor, Requests.CreateUserRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new BusinessRuleException("An account with that email already exists.");
        }
        Enums.Role role;
        try {
            role = Enums.Role.valueOf(request.role().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Unknown role: " + request.role());
        }
        String rawPassword = request.password() == null || request.password().isBlank()
                ? "Password123!" : request.password();
        User user = User.create(role, request.fullName(), request.email(), request.phone(),
                passwordEncoder.encode(rawPassword), Enums.UserStatus.APPROVED);
        User saved = users.save(user);
        audit.record(actorUser(actor), "USER_CREATE", "user", saved.getId(), "Created " + role);
        notifications.send(saved, "ACCOUNT", "Your " + role.name().toLowerCase() + " account is ready.");
        return Views.UserView.of(saved);
    }

    @Transactional
    public Views.UserView decideUser(CurrentUser actor, Long userId, Requests.DecisionRequest request) {
        User user = require(userId);
        Enums.UserStatus next;
        try {
            next = Enums.UserStatus.valueOf(request.status().toUpperCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Unknown status: " + request.status());
        }
        Enums.UserStatus current = user.getStatus();
        boolean allowed = switch (next) {
            case APPROVED -> current == Enums.UserStatus.PENDING || current == Enums.UserStatus.SUSPENDED;
            case REJECTED -> current == Enums.UserStatus.PENDING || current == Enums.UserStatus.APPROVED;
            case SUSPENDED -> current == Enums.UserStatus.APPROVED;
            case PENDING -> current == Enums.UserStatus.REJECTED;
        };
        if (!allowed) {
            throw new BusinessRuleException("An account cannot move from " + current + " to " + next + ".");
        }
        user.changeStatus(next);
        String note = request.note() == null || request.note().isBlank() ? "" : " Note: " + request.note();
        switch (next) {
            case APPROVED -> notifications.send(user, "ACCOUNT",
                    "Your YEP account has been approved. You can now sign in." + note);
            case REJECTED -> notifications.send(user, "ACCOUNT",
                    "Your YEP application was not approved." + note);
            case SUSPENDED -> notifications.send(user, "ACCOUNT",
                    "Your YEP account has been suspended." + note);
            default -> {
            }
        }
        audit.record(actorUser(actor), "USER_STATUS_" + next, "user", user.getId(),
                "Status changed from " + current + " to " + next);
        return Views.UserView.of(user);
    }

    @Transactional(readOnly = true)
    public List<Views.UserView> listUsers(String role, String status, String query) {
        return users.search(blankToNull(role), blankToNull(status), blankToNull(query)).stream()
                .map(Views.UserView::of).toList();
    }

    @Transactional(readOnly = true)
    public List<Views.UserView> byRole(Enums.Role role) {
        return users.findByRoleOrderByFullNameAsc(role).stream().map(Views.UserView::of).toList();
    }

    public User require(Long userId) {
        return users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
    }

    /** Loads the acting account; used where an entity reference is needed. */
    public User actorUser(CurrentUser actor) {
        return require(actor.id());
    }

    public void ensureSelfOrAdmin(CurrentUser actor, Long userId) {
        if (!actor.isAdmin() && !actor.id().equals(userId)) {
            throw new ForbiddenException("You can only access your own record.");
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
