package ug.yep.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import ug.yep.exception.ApiException;

/** Small in-memory guard against credential stuffing: 5 failures per 15 minutes per key. */
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    public void check(String key) {
        Deque<Instant> recent = attempts.get(key);
        if (recent == null) {
            return;
        }
        synchronized (recent) {
            prune(recent);
            if (recent.size() >= MAX_ATTEMPTS) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                        "Too many failed sign-in attempts. Please try again in a few minutes.");
            }
        }
    }

    public void fail(String key) {
        Deque<Instant> recent = attempts.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (recent) {
            prune(recent);
            recent.addLast(Instant.now());
        }
    }

    public void clear(String key) {
        attempts.remove(key);
    }

    private void prune(Deque<Instant> recent) {
        Instant cutoff = Instant.now().minus(WINDOW);
        while (!recent.isEmpty() && recent.peekFirst().isBefore(cutoff)) {
            recent.removeFirst();
        }
    }
}
