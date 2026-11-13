package com.youthrise.common;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Small fixed-window limiter for authentication and public lookup endpoints.
 * It is intentionally in-process: a multi-instance deployment must replace it
 * with a shared store (for example Redis) so limits apply across nodes.
 */
@Component
public class RateLimiter {

    private record Window(long startedAt, int count, long expiresAt) {
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public void check(String key, int limit, Duration window) {
        long now = System.currentTimeMillis();
        Window current = windows.compute(key, (ignored, previous) -> {
            if (previous == null || now >= previous.expiresAt()) {
                return new Window(now, 1, now + window.toMillis());
            }
            return new Window(previous.startedAt(), previous.count() + 1, previous.expiresAt());
        });
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(entry -> entry.getValue().expiresAt() < now);
        }
        if (current.count() > limit) {
            long retryAfter = Math.max(1, (current.expiresAt() - now + 999) / 1000);
            throw ApiException.rateLimited(retryAfter);
        }
    }

    public void reset(String key) {
        windows.remove(key);
    }
}
