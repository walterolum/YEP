package ug.yep.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import ug.yep.exception.ApiException;

/**
 * Stops sign-up flooding: the default is 5 registrations per hour per client address.
 * Limits are in memory, which is enough for one application instance; a shared store
 * is the Phase 7 hardening step.
 */
@Component
public class RegistrationRateLimiter {

    private static final int MAX_PER_HOUR = 5;
    private static final Duration WINDOW = Duration.ofHours(1);

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public void check(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        Deque<Instant> recent = attempts.get(key);
        if (recent == null) {
            return;
        }
        synchronized (recent) {
            prune(recent);
            if (recent.size() >= MAX_PER_HOUR) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many registrations from this device. Please try again later.");
            }
        }
    }

    public void record(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        Deque<Instant> recent = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (recent) {
            prune(recent);
            recent.addLast(Instant.now());
        }
    }

    private void prune(Deque<Instant> recent) {
        Instant cutoff = Instant.now().minus(WINDOW);
        while (!recent.isEmpty() && recent.peekFirst().isBefore(cutoff)) {
            recent.removeFirst();
        }
    }
}
