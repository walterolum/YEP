package com.youthrise.user;

import com.youthrise.common.ApiException;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    @Transactional(readOnly = true)
    public User getRequired(String id) {
        return users.findById(id)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
    }

    @Transactional(readOnly = true)
    public UserDtos.UserResponse getProfile(String id) {
        return UserDtos.UserResponse.from(getRequired(id));
    }

    @Transactional
    public UserDtos.UserResponse updateProfile(String id, UserDtos.ProfilePatch patch) {
        User user = getRequired(id);
        String timezone = trimmed(patch.timezone());
        if (timezone != null) {
            try {
                ZoneId.of(timezone);
            } catch (DateTimeException ex) {
                throw ApiException.validation("timezone", "Enter a valid IANA time zone, for example Africa/Kampala.");
            }
        }
        user.updateProfile(
                patch.name(),
                patch.phone(),
                patch.country(),
                patch.organization(),
                patch.jobTitle(),
                patch.bio(),
                timezone,
                patch.interests() == null ? null : Set.copyOf(patch.interests()),
                patch.skills() == null ? null : Set.copyOf(patch.skills()),
                patch.visibility(),
                patch.contactPermission());
        return UserDtos.UserResponse.from(user);
    }

    private static String trimmed(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
