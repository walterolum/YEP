package com.youthrise.config;

import java.nio.file.Path;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Security security,
        Mail mail,
        String publicAppUrl,
        String policyVersion,
        Uploads uploads) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Security(boolean cookieSecure) {
    }

    public record Mail(String mode, String from) {
    }

    public record Uploads(Path directory) {
    }
}
