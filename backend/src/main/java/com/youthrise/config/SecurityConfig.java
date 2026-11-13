package com.youthrise.config;

import tools.jackson.databind.ObjectMapper;
import com.youthrise.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    public SecurityConfig(AppProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Bean
    PasswordEncoder passwordEncoder(
            @org.springframework.beans.factory.annotation.Value("${app.security.bcrypt-strength:12}") int strength) {
        // Cost 12 is a deliberate production default; raise it as hardware improves.
        return new BCryptPasswordEncoder(strength);
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(properties.cors().allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "Accept", "X-XSRF-TOKEN", "X-Requested-With"));
        config.setExposedHeaders(List.of(HttpHeaders.RETRY_AFTER, "X-Correlation-Id"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    CsrfTokenRepository csrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieCustomizer(cookie -> cookie
                .path("/")
                .sameSite("Lax")
                .secure(properties.security().cookieSecure()));
        return repository;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, CsrfTokenRepository csrfRepository)
            throws Exception {
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
        csrfHandler.setCsrfRequestAttributeName(null);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(csrfHandler))
                .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation(fixation -> fixation.changeSessionId()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error", "/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/auth/session", "/api/auth/csrf", "/api/auth/login",
                                "/api/auth/register", "/api/auth/password-reset",
                                "/api/auth/password-reset/confirm", "/api/auth/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/programmes", "/api/programmes/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/certificates/verify/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/facilitator/**").hasAnyRole("FACILITATOR", "ADMIN")
                        .requestMatchers("/api/mentor/**").hasAnyRole("MENTOR", "ADMIN")
                        .requestMatchers("/api/employer/**").hasRole("EMPLOYER")
                        .requestMatchers("/api/partner/**").hasAnyRole("UNIVERSITY", "PARTNER", "ADMIN")
                        .requestMatchers("/api/reports/**").hasAnyRole("FACILITATOR", "UNIVERSITY", "PARTNER", "ADMIN")
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, ex) ->
                                writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHENTICATED",
                                        "Sign in to continue."))
                        .accessDeniedHandler((request, response, ex) ->
                                writeError(response, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN",
                                        "You do not have permission to do that.")))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                .requestCache(cache -> cache.disable());

        return http.build();
    }

    private void writeError(HttpServletResponse response, int status, String code, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), new ApiErrorResponse(code, message));
    }
}
