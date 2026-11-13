package com.youthrise.exchange;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/sessions")
    public List<ExchangeDtos.SessionResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return sessionService.list(principal);
    }

    @GetMapping("/me/session-registrations")
    public List<String> myRegistrations(@AuthenticationPrincipal UserPrincipal principal) {
        return sessionService.myRegistrations(principal.id());
    }

    @PostMapping("/sessions/{id}/registrations")
    public ResponseEntity<Void> register(@PathVariable String id,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        sessionService.register(id, principal);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sessions/{id}/registrations")
    public ResponseEntity<Void> cancel(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        sessionService.cancel(id, principal);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sessions")
    public ResponseEntity<ExchangeDtos.SessionResponse> create(
            @Valid @RequestBody ExchangeDtos.CreateSessionRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.create(body, principal));
    }
}
