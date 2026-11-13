package com.youthrise.auth;

import com.youthrise.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthSessionResponse> register(
            @Valid @RequestBody AuthDtos.RegisterRequest body,
            HttpServletRequest request, HttpServletResponse response) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(body, request, response));
    }

    @PostMapping("/login")
    public AuthDtos.AuthSessionResponse login(@Valid @RequestBody AuthDtos.LoginRequest body,
                                              HttpServletRequest request, HttpServletResponse response) {
        return authService.login(body, request, response);
    }

    @GetMapping("/session")
    public ResponseEntity<AuthDtos.AuthSessionResponse> session(HttpServletRequest request) {
        AuthDtos.AuthSessionResponse session = authService.currentSession(request);
        return session == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(session);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset")
    public AuthDtos.MessageResponse requestPasswordReset(@Valid @RequestBody AuthDtos.PasswordResetRequest body,
                                                         HttpServletRequest request) {
        return authService.requestPasswordReset(body, request);
    }

    @PostMapping("/password-reset/confirm")
    public AuthDtos.MessageResponse resetPassword(@Valid @RequestBody AuthDtos.PasswordResetConfirmRequest body,
                                                  HttpServletRequest request) {
        return authService.resetPassword(body, request);
    }

    /** Password change for the signed-in account (profile management). */
    @PostMapping("/password-change")
    public AuthDtos.MessageResponse changePassword(@Valid @RequestBody AuthDtos.ChangePasswordRequest body,
                                                   @AuthenticationPrincipal UserPrincipal principal,
                                                   HttpServletRequest request) {
        return authService.changePassword(body, principal, request);
    }

    @PostMapping("/verify")
    public AuthDtos.VerifiedResponse verify(@Valid @RequestBody AuthDtos.VerifyRequest body,
                                            @AuthenticationPrincipal UserPrincipal principal,
                                            HttpServletRequest request) {
        return authService.verifyEmail(body, principal, request);
    }

    @GetMapping("/csrf")
    public AuthDtos.CsrfResponse csrf(CsrfToken token) {
        return new AuthDtos.CsrfResponse(token.getToken(), token.getHeaderName());
    }
}
