package ug.yep.service;

import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Builds the join link for a session. LiveKit is used when {@code yep.sessions.livekit-url}
 * is configured; otherwise the Jitsi fallback keeps sessions usable without credentials.
 */
@Component
public class SessionProvider {

    private final String livekitUrl;

    public SessionProvider(@Value("${yep.sessions.livekit-url:}") String livekitUrl) {
        this.livekitUrl = livekitUrl == null ? "" : livekitUrl.trim();
    }

    public String name() {
        return livekitUrl.isBlank() ? "jitsi" : "livekit";
    }

    public String roomName(String prefix) {
        String slug = (prefix == null ? "session" : prefix).toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return (slug.isBlank() ? "yep" : slug) + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    public String joinUrl(String roomName) {
        if (!livekitUrl.isBlank()) {
            return livekitUrl + (livekitUrl.contains("?") ? "&" : "?") + "room=" + roomName;
        }
        return "https://meet.jit.si/" + roomName;
    }
}
