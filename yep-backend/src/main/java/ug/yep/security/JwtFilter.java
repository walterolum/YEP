package ug.yep.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ug.yep.entity.Enums;
import ug.yep.entity.User;
import ug.yep.repository.UserRepository;

/** Reads the bearer token, re-checks the account state, and populates the security context. */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository users;

    public JwtFilter(JwtUtil jwtUtil, UserRepository users) {
        this.jwtUtil = jwtUtil;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            try {
                CurrentUser claims = jwtUtil.parse(header.substring(7).trim());
                User user = users.findById(claims.id()).orElse(null);
                // A suspended or rejected account loses access even with a valid token.
                if (user != null && user.getStatus() == Enums.UserStatus.APPROVED) {
                    CurrentUser current = new CurrentUser(user.getId(), user.getEmail(),
                            user.getFullName(), user.getRole());
                    var authentication = new UsernamePasswordAuthenticationToken(current, null,
                            List.of(new SimpleGrantedAuthority(current.roleName())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (RuntimeException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
