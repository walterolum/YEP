package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;
import ug.yep.security.JwtUtil;

/** Account status machine and the sign-in gate for pending, rejected and suspended users. */
class AuthServiceTest {

    private UserRepository users;
    private SettingsService settings;
    private AuthService service;
    private final CurrentUser admin =
            new CurrentUser(1L, "admin@yep.example", "YEP Admin", Enums.Role.ADMIN);

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        settings = mock(SettingsService.class);
        when(settings.policy()).thenReturn(new SettingsService.Policy(18, 35, 80, 65, 75));
        service = new AuthService(users, new BCryptPasswordEncoder(), mock(JwtUtil.class),
                settings, mock(LoginRateLimiter.class), mock(AuditService.class),
                mock(NotificationService.class), new CountryDirectory(),
                new RegistrationRateLimiter(), mock(VerificationService.class));

        User adminUser = User.create(Enums.Role.ADMIN, "YEP Admin", "admin@yep.example", null,
                "hash", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(adminUser, "id", 1L);
        when(users.findById(1L)).thenReturn(Optional.of(adminUser));
    }

    private User participant(Enums.UserStatus status) {
        User user = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "hash", status);
        ReflectionTestUtils.setField(user, "id", 2L);
        when(users.findById(2L)).thenReturn(Optional.of(user));
        return user;
    }

    @Test
    void pendingCanBeApproved() {
        participant(Enums.UserStatus.PENDING);
        var view = service.decideUser(admin, 2L, new Requests.DecisionRequest("APPROVED", "Welcome"));
        assertEquals("APPROVED", view.status());
    }

    @Test
    void suspendedCanBeReinstated() {
        participant(Enums.UserStatus.SUSPENDED);
        var view = service.decideUser(admin, 2L, new Requests.DecisionRequest("APPROVED", null));
        assertEquals("APPROVED", view.status());
    }

    @Test
    void rejectedCanReturnToPendingButNotStraightToApproved() {
        participant(Enums.UserStatus.REJECTED);

        assertThrows(BusinessRuleException.class,
                () -> service.decideUser(admin, 2L, new Requests.DecisionRequest("APPROVED", null)));

        var view = service.decideUser(admin, 2L, new Requests.DecisionRequest("PENDING", null));
        assertEquals("PENDING", view.status());
    }

    @Test
    void pendingCannotBeSuspendedDirectly() {
        participant(Enums.UserStatus.PENDING);
        assertThrows(BusinessRuleException.class,
                () -> service.decideUser(admin, 2L, new Requests.DecisionRequest("SUSPENDED", null)));
    }

    @Test
    void pendingAccountCannotSignIn() {
        User pending = participant(Enums.UserStatus.PENDING);
        pending.changePassword(new BCryptPasswordEncoder().encode("Password123!"));
        when(users.findByEmailIgnoreCase("amara@yep.example")).thenReturn(Optional.of(pending));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.login(new Requests.LoginRequest("amara@yep.example", "Password123!")));
        assertEquals("Your account is still awaiting approval. You will be notified once it is reviewed.",
                error.getMessage());
    }

    @Test
    void suspendedAccountCannotSignIn() {
        User suspended = participant(Enums.UserStatus.SUSPENDED);
        suspended.changePassword(new BCryptPasswordEncoder().encode("Password123!"));
        when(users.findByEmailIgnoreCase("amara@yep.example")).thenReturn(Optional.of(suspended));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.login(new Requests.LoginRequest("amara@yep.example", "Password123!")));
        assertEquals("Your account has been suspended. Please contact the YEP team.", error.getMessage());
    }

    @Test
    void signupOutsideAgeRangeIsRejected() {
        Requests.SignupRequest request = signup(LocalDate.now().minusYears(15));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.signup(request));
        assertEquals("YEP is open to young people aged 18 to 35. Your age does not meet the criteria.",
                error.getMessage());
    }

    @Test
    void signupRequiresTermsAndPrivacyConsent() {
        Requests.SignupRequest request = new Requests.SignupRequest("Young Person",
                "young@yep.example", "+256", "700000000", "Password123!", "Password123!",
                "Uganda", "UG", "Kampala", LocalDate.now().minusYears(22), null, null, null,
                null, null, null, null, null, false, false, "LEVEL_ONE");

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.signup(request));
        assertEquals("Please accept the participation terms and the privacy notice to continue.",
                error.getMessage());
    }

    @Test
    void signupWithinAgeRangeIsPending() {
        when(users.existsByEmailIgnoreCase("new@yep.example")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 11L);
            return saved;
        });
        Requests.SignupRequest request = signup(LocalDate.now().minusYears(22));

        var result = service.signup(request);
        assertEquals("PENDING", result.user().status());
    }

    private Requests.SignupRequest signup(LocalDate dateOfBirth) {
        return new Requests.SignupRequest("New Person", "new@yep.example", "+256", "700000000",
                "Password123!", "Password123!", "Uganda", "UG", "Kampala", dateOfBirth,
                "Makerere University", "Computer Science", "FEMALE", "UNIVERSITY", "UNEMPLOYED",
                "Become a developer", "en", java.util.Set.of("technology", "design"),
                true, true, "LEVEL_ONE");
    }

    @Test
    void signupRequiresAMobileNumber() {
        Requests.SignupRequest request = new Requests.SignupRequest("No Phone", "phone@yep.example",
                "+256", null, "Password123!", "Password123!", "Uganda", "UG", "Kampala",
                LocalDate.now().minusYears(22), null, null, null, null, null, null, null, null,
                true, true, "LEVEL_ONE");

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.signup(request));
        assertEquals("A mobile number is required.", error.getMessage());
    }

    @Test
    void signupRejectsAWeakPassword() {
        Requests.SignupRequest request = new Requests.SignupRequest("Weak Pass", "weak@yep.example",
                "+256", "700000000", "abcdefgh", "abcdefgh", "Uganda", "UG", "Kampala",
                LocalDate.now().minusYears(22), null, null, null, null, null, null, null, null,
                true, true, "LEVEL_ONE");

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.signup(request));
        assertEquals("Choose a stronger password: mix upper and lower case with a number or a symbol.",
                error.getMessage());
    }

    @Test
    void signupRejectsAnUnknownCountryCode() {
        Requests.SignupRequest request = new Requests.SignupRequest("No Country", "zz@yep.example",
                "+256", "700000000", "Password123!", "Password123!", "Atlantis", "ZZ", "Kampala",
                LocalDate.now().minusYears(22), null, null, null, null, null, null, null, null,
                true, true, "LEVEL_ONE");

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.signup(request));
        assertEquals("Choose a country from the list.", error.getMessage());
    }

    @Test
    void signupStoresDialCodeCountryCodeAndDigitsOnlyPhone() {
        when(users.existsByEmailIgnoreCase("new@yep.example")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var view = service.signup(signup(LocalDate.now().minusYears(24)));

        assertEquals("+256", view.user().phoneCountryCode());
        assertEquals("UG", view.user().countryCode());
        assertEquals("Uganda", view.user().country());
        assertEquals("700000000", view.user().phone());
    }

    @Test
    void loginIsBlockedUntilTheEmailIsVerifiedWhenRequired() {
        User approved = participant(Enums.UserStatus.APPROVED);
        approved.changePassword(new BCryptPasswordEncoder().encode("Password123!"));
        when(users.findByEmailIgnoreCase("amara@yep.example")).thenReturn(Optional.of(approved));
        when(settings.requireEmailVerification()).thenReturn(true);

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.login(new Requests.LoginRequest("amara@yep.example", "Password123!")));
        assertEquals("Please verify your email address before signing in. "
                + "Check your notifications for the code.", error.getMessage());
    }
}
