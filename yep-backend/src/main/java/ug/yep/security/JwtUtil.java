package ug.yep.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import ug.yep.entity.Enums;
import ug.yep.exception.ApiException;
import org.springframework.http.HttpStatus;

/**
 * Minimal, dependency-free HS256 JWT implementation.
 *
 * <p>Three Base64URL segments (header, payload, signature). The payload is compact
 * JSON and is only trusted after the HMAC signature has been verified.</p>
 */
@Component
public class JwtUtil {

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();

    private final byte[] secret;
    private final long expiryMinutes;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                   @Value("${app.jwt.ttl-hours:2}") long ttlHours) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expiryMinutes = ttlHours * 60;
    }

    public String issue(CurrentUser user) {
        String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        long expiresAt = Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES).getEpochSecond();
        String payload = encode("{\"sub\":" + user.id()
                + ",\"email\":\"" + escape(user.email())
                + "\",\"name\":\"" + escape(user.fullName())
                + "\",\"role\":\"" + user.role().name()
                + "\",\"exp\":" + expiresAt + "}");
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    public long expirySeconds() {
        return expiryMinutes * 60;
    }

    /** Verifies signature and expiry, then returns the caller. */
    public CurrentUser parse(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "The session token is malformed.");
        }
        String expected = sign(parts[0] + "." + parts[1]);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "The session token is invalid.");
        }
        String json = new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8);
        Long id = Long.valueOf(number(json, "sub"));
        long exp = Long.parseLong(number(json, "exp"));
        if (Instant.now().getEpochSecond() >= exp) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Your session has expired. Please sign in again.");
        }
        Enums.Role role = Enums.Role.valueOf(text(json, "role"));
        return new CurrentUser(id, text(json, "email"), text(json, "name"), role);
    }

    private String encode(String value) {
        return ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String signingInput) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return ENCODER.encodeToString(mac.doFinal(signingInput.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign the session token", ex);
        }
    }

    private static String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String number(String json, String key) {
        String marker = "\"" + key + "\":";
        int start = json.indexOf(marker);
        if (start < 0) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "The session token is incomplete.");
        }
        int index = start + marker.length();
        int end = index;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '-')) {
            end++;
        }
        return json.substring(index, end);
    }

    private static String text(String json, String key) {
        String marker = "\"" + key + "\":\"";
        int start = json.indexOf(marker);
        if (start < 0) {
            return "";
        }
        StringBuilder value = new StringBuilder();
        for (int i = start + marker.length(); i < json.length(); i++) {
            char ch = json.charAt(i);
            if (ch == '\\' && i + 1 < json.length()) {
                value.append(json.charAt(++i));
            } else if (ch == '"') {
                break;
            } else {
                value.append(ch);
            }
        }
        return value.toString();
    }
}
