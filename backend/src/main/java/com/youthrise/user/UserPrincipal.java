package com.youthrise.user;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Minimal authenticated identity stored in the session. It deliberately carries
 * no password hash, so a serialised session cannot leak credentials.
 */
public record UserPrincipal(String id, String email, Role role, AccountStatus status)
        implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user.getId(), user.getEmail(), user.getRole(), user.getStatus());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.authority()));
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == AccountStatus.ACTIVE;
    }
}
