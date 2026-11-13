package com.youthrise.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionCookieConfig {

    /**
     * Spring Session owns the cookie name and attributes. Setting them here keeps
     * the browser contract identical to the embedded-server configuration in
     * application.yml and avoids the default "SESSION" name.
     */
    @Bean
    DefaultCookieSerializer sessionCookieSerializer(AppProperties properties) {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("YOUTHRISE_SESSION");
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite("Lax");
        serializer.setUseSecureCookie(properties.security().cookieSecure());
        return serializer;
    }
}
