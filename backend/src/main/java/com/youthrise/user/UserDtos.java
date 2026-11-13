package com.youthrise.user;

import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Set;

public final class UserDtos {

    private UserDtos() {
    }

    public record UserResponse(
            String id,
            String name,
            String email,
            Role role,
            String country,
            String phone,
            String organization,
            String jobTitle,
            String bio,
            String initials,
            Instant joinedAt,
            AccountStatus status,
            int profileComplete,
            String timezone,
            List<String> interests,
            List<String> skills,
            Visibility visibility,
            boolean contactPermission,
            boolean emailVerified) {

        public static UserResponse from(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getCountry(),
                    user.getPhone(),
                    user.getOrganization(),
                    user.getJobTitle(),
                    user.getBio(),
                    user.getInitials(),
                    user.getJoinedAt(),
                    user.getStatus(),
                    user.getProfileComplete(),
                    user.getTimezone(),
                    List.copyOf(user.getInterests()),
                    List.copyOf(user.getSkills()),
                    user.getVisibility(),
                    user.isContactPermission(),
                    user.isEmailVerified());
        }
    }

    /** Only fields a user may change about themselves. Role and status are absent by design. */
    public record ProfilePatch(
            @Size(max = 160, message = "Use 160 characters or fewer.") String name,
            @Size(max = 32, message = "Use 32 characters or fewer.") String phone,
            @Size(max = 80, message = "Use 80 characters or fewer.") String country,
            @Size(max = 160, message = "Use 160 characters or fewer.") String organization,
            @Size(max = 120, message = "Use 120 characters or fewer.") String jobTitle,
            @Size(max = 2000, message = "Use 2000 characters or fewer.") String bio,
            @Size(max = 64, message = "Use 64 characters or fewer.") String timezone,
            @Size(max = 20, message = "Choose up to 20 interests.") Set<@Size(max = 60) String> interests,
            @Size(max = 30, message = "Choose up to 30 skills.") Set<@Size(max = 60) String> skills,
            Visibility visibility,
            Boolean contactPermission) {
    }
}
