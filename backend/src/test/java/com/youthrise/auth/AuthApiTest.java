package com.youthrise.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.youthrise.user.AccountStatus;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserRepository;
import jakarta.servlet.http.Cookie;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private Mailer mailer;

    @Test
    void registrationCreatesAccountAndSessionWithoutMarkingEmailVerified() throws Exception {
        String email = uniqueEmail();
        String body = """
                {
                  "fullName": "Amina Nakato",
                  "email": "%s",
                  "country": "Uganda",
                  "dateOfBirth": "2000-05-10",
                  "password": "Password1",
                  "interests": ["Climate"],
                  "privacyAccepted": true,
                  "communicationsConsent": false
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.demo").value(false))
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.user.role").value("participant"))
                .andExpect(jsonPath("$.user.emailVerified").value(false))
                .andExpect(cookie().exists("YOUTHRISE_SESSION"))
                .andExpect(cookie().httpOnly("YOUTHRISE_SESSION", true));

        assertThat(users.findByEmailIgnoreCase(email)).isPresent();
        verify(mailer).sendEmailVerification(eq(email), eq("Amina Nakato"), anyString());
    }

    @Test
    void registrationRejectsApplicantsOutsideTheYouthAgeRange() throws Exception {
        String body = """
                {
                  "fullName": "Too Young",
                  "email": "%s",
                  "country": "Uganda",
                  "dateOfBirth": "%s",
                  "password": "Password1",
                  "interests": [],
                  "privacyAccepted": true,
                  "communicationsConsent": false
                }
                """.formatted(uniqueEmail(), LocalDate.now(java.time.ZoneOffset.UTC).minusYears(17));

        mockMvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("ELIGIBILITY"));
    }

    @Test
    void registrationRejectsDuplicateEmailCaseInsensitively() throws Exception {
        User existing = createUser(Role.PARTICIPANT, true);
        String body = """
                {
                  "fullName": "Another Person",
                  "email": "%s",
                  "country": "Kenya",
                  "dateOfBirth": "1999-03-04",
                  "password": "Password1",
                  "interests": [],
                  "privacyAccepted": true,
                  "communicationsConsent": false
                }
                """.formatted(existing.getEmail().toUpperCase());

        mockMvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_IN_USE"));
    }

    @Test
    void registrationRequiresPrivacyConsent() throws Exception {
        String body = """
                {
                  "fullName": "No Consent",
                  "email": "%s",
                  "country": "Kenya",
                  "dateOfBirth": "1999-03-04",
                  "password": "Password1",
                  "interests": [],
                  "privacyAccepted": false,
                  "communicationsConsent": false
                }
                """.formatted(uniqueEmail());

        mockMvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("VALIDATION"));
    }

    @Test
    void loginRotatesTheSessionAndExposesTheCurrentUser() throws Exception {
        User user = createUser(Role.PARTICIPANT, true);
        MockHttpSession anonymousSession = new MockHttpSession();
        String previousId = anonymousSession.getId();

        MvcResult login = mockMvc.perform(post("/api/auth/login").with(csrf())
                        .session(anonymousSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "Password1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(user.getId()))
                .andExpect(jsonPath("$.user.role").value("participant"))
                .andExpect(cookie().exists("YOUTHRISE_SESSION"))
                .andReturn();

        Cookie session = sessionCookie(login);
        assertThat(decodedSessionId(session)).isNotEqualTo(previousId);

        mockMvc.perform(get("/api/me").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(user.getEmail()))
                .andExpect(jsonPath("$.status").value("active"));
    }

    @Test
    void anonymousRequestsAreRejectedWithAJsonError() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"));
    }

    @Test
    void stateChangingRequestsWithoutCsrfAreRejected() throws Exception {
        User user = createUser(Role.PARTICIPANT, true);
        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "Password1")))
                .andExpect(status().isForbidden());
    }

    @Test
    void suspendedAccountsCannotSignIn() throws Exception {
        User user = createUser(Role.PARTICIPANT, true);
        user.suspend();
        users.saveAndFlush(user);

        mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "Password1")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCOUNT_SUSPENDED"));
    }

    @Test
    void wrongPasswordReturnsAGenericError() throws Exception {
        User user = createUser(Role.PARTICIPANT, true);
        mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "NotThePassword1")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void passwordResetUsesASingleUseExpiringToken() throws Exception {
        User user = createUser(Role.PARTICIPANT, true);

        mockMvc.perform(post("/api/auth/password-reset").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.getEmail() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "If an account exists for that address, a reset link has been sent."));

        ArgumentCaptor<String> url = ArgumentCaptor.forClass(String.class);
        verify(mailer).sendPasswordReset(eq(user.getEmail()), eq(user.getFullName()), url.capture());
        String token = url.getValue().substring(url.getValue().indexOf("token=") + 6);

        mockMvc.perform(post("/api/auth/password-reset/confirm").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\",\"password\":\"NewPassword1\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/password-reset/confirm").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"" + token + "\",\"password\":\"AnotherPass1\"}"))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.code").value("RESET_LINK_EXPIRED"));

        mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "NewPassword1")))
                .andExpect(status().isOk());
    }

    @Test
    void passwordResetGivesTheSameAnswerForUnknownAddresses() throws Exception {
        mockMvc.perform(post("/api/auth/password-reset").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nobody-" + UUID.randomUUID() + "@example.org\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "If an account exists for that address, a reset link has been sent."));
    }

    @Test
    void emailVerificationAcceptsTheMailedCodeOnce() throws Exception {
        String email = uniqueEmail();
        MvcResult registration = mockMvc.perform(post("/api/auth/register").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Verification Tester",
                                  "email": "%s",
                                  "country": "Tanzania",
                                  "dateOfBirth": "2001-07-21",
                                  "password": "Password1",
                                  "interests": [],
                                  "privacyAccepted": true,
                                  "communicationsConsent": false
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();

        ArgumentCaptor<String> code = ArgumentCaptor.forClass(String.class);
        verify(mailer).sendEmailVerification(eq(email), eq("Verification Tester"), code.capture());
        Cookie session = sessionCookie(registration);

        mockMvc.perform(post("/api/auth/verify").with(csrf()).cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + code.getValue() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));

        User verified = users.findByEmailIgnoreCase(email).orElseThrow();
        assertThat(verified.isEmailVerified()).isTrue();

        mockMvc.perform(post("/api/auth/verify").with(csrf()).cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + code.getValue() + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CODE"));
    }

    @Test
    void profilePatchCannotChangeRoleOrStatus() throws Exception {
        User user = createUser(Role.PARTICIPANT, true);
        Cookie session = login(user);

        mockMvc.perform(patch("/api/me").with(csrf()).cookie(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Updated Name","bio":"Youth climate organiser","role":"admin","status":"suspended"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.role").value("participant"))
                .andExpect(jsonPath("$.status").value("active"));

        User saved = users.findById(user.getId()).orElseThrow();
        assertThat(saved.getRole()).isEqualTo(Role.PARTICIPANT);
        assertThat(saved.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    private User createUser(Role role, boolean verified) {
        User user = role == Role.PARTICIPANT
                ? User.register("Test User", uniqueEmail(), null, "Uganda",
                        passwordEncoder.encode("Password1"), "Africa/Kampala", LocalDate.of(2000, 1, 1))
                : User.invited("Test User", uniqueEmail(), role, "Uganda", "Africa/Kampala");
        if (role != Role.PARTICIPANT) {
            user.changePassword(passwordEncoder.encode("Password1"));
        }
        if (verified) {
            user.markEmailVerified(Instant.now());
        }
        return users.saveAndFlush(user);
    }

    private Cookie login(User user) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.getEmail(), "Password1")))
                .andExpect(status().isOk())
                .andReturn();
        return sessionCookie(result);
    }

    private static Cookie sessionCookie(MvcResult result) {
        return Arrays.stream(result.getResponse().getCookies())
                .filter(cookie -> "YOUTHRISE_SESSION".equals(cookie.getName()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("The response did not set a session cookie"));
    }

    private static String decodedSessionId(Cookie cookie) {
        try {
            return new String(Base64.getDecoder().decode(cookie.getValue()), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return cookie.getValue();
        }
    }

    private static String loginBody(String email, String password) {
        return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
    }

    private static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.org";
    }
}
