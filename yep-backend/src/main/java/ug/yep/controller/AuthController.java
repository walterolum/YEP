package ug.yep.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.User;
import ug.yep.security.CurrentUser;
import ug.yep.service.AuthService;
import ug.yep.service.VerificationService;

/** Public registration and sign-in, plus the signed-in account's own profile. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final VerificationService verification;

    public AuthController(AuthService auth, VerificationService verification) {
        this.auth = auth;
        this.verification = verification;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody Requests.SignupRequest request,
                                                      HttpServletRequest http) {
        Views.AuthView result = auth.signup(request, clientAddress(http));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Your registration was submitted. An administrator will review it before you can sign in.");
        body.put("user", result.user());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    /** Redeems a verification code; the code was delivered to the learner's notifications. */
    @PostMapping("/verify-email")
    public Map<String, Object> verifyEmail(@Valid @RequestBody Requests.VerifyEmailRequest request) {
        Views.UserView user = verification.verify(request.token());
        return Map.of("message", "Your email address is verified.", "user", user);
    }

    /** Signed-in learners can ask for a fresh code. */
    @PostMapping("/resend-verification")
    public Map<String, Object> resendVerification(@AuthenticationPrincipal CurrentUser actor) {
        User user = auth.require(actor.id());
        if (user.getEmailVerifiedAt() != null) {
            return Map.of("message", "Your email address is already verified.");
        }
        verification.resend(user);
        return Map.of("message", "A new verification code has been sent to your notifications.");
    }

    /** First hop of X-Forwarded-For, so a proxy does not collapse every client to one key. */
    private static String clientAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/login")
    public Views.AuthView login(@Valid @RequestBody Requests.LoginRequest request) {
        return auth.login(request);
    }

    @GetMapping("/me")
    public Views.UserView me(@AuthenticationPrincipal CurrentUser actor) {
        return auth.me(actor.id());
    }

    @PutMapping("/profile")
    public Views.UserView update(@AuthenticationPrincipal CurrentUser actor,
                                 @Valid @RequestBody Requests.ProfileUpdateRequest request) {
        return auth.updateProfile(actor.id(), request);
    }

    @PostMapping("/password")
    public Map<String, Object> password(@AuthenticationPrincipal CurrentUser actor,
                                        @Valid @RequestBody Requests.PasswordChangeRequest request) {
        auth.changePassword(actor.id(), request);
        return Map.of("message", "Your password has been updated.");
    }
}
