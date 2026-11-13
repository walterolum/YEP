package ug.yep.controller;

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
import ug.yep.security.CurrentUser;
import ug.yep.service.AuthService;

/** Public registration and sign-in, plus the signed-in account's own profile. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody Requests.SignupRequest request) {
        Views.AuthView result = auth.signup(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Your registration was submitted. An administrator will review it before you can sign in.");
        body.put("user", result.user());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
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
