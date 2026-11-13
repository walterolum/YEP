package com.youthrise.auth;

import com.youthrise.user.UserDtos;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.Set;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Enter your full name.")
            @Size(max = 160, message = "Use 160 characters or fewer.") String fullName,
            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address.")
            @Size(max = 320, message = "Use 320 characters or fewer.") String email,
            @Size(max = 32, message = "Use 32 characters or fewer.") String phone,
            @NotBlank(message = "Select your country.")
            @Size(max = 80, message = "Use 80 characters or fewer.") String country,
            @NotNull(message = "Enter your date of birth.")
            @Past(message = "Enter a date of birth in the past.") LocalDate dateOfBirth,
            @NotBlank(message = "Choose a password.")
            @Size(min = 8, max = 72, message = "Use between 8 and 72 characters.")
            @Pattern(regexp = ".*[A-Z].*", message = "Include at least one uppercase letter.")
            @Pattern(regexp = ".*[a-z].*", message = "Include at least one lowercase letter.")
            @Pattern(regexp = ".*[0-9].*", message = "Include at least one number.")
            String password,
            @Size(max = 20, message = "Choose up to 20 interests.") Set<@Size(max = 60) String> interests,
            @AssertTrue(message = "Accept the privacy notice to continue.") boolean privacyAccepted,
            boolean communicationsConsent) {
    }

    public record LoginRequest(
            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address.") String email,
            @NotBlank(message = "Enter your password.") String password) {
    }

    public record PasswordResetRequest(
            @NotBlank(message = "Enter your email address.")
            @Email(message = "Enter a valid email address.") String email) {
    }

    public record PasswordResetConfirmRequest(
            @NotBlank(message = "The reset link is incomplete.") String token,
            @NotBlank(message = "Choose a password.")
            @Size(min = 8, max = 72, message = "Use between 8 and 72 characters.")
            @Pattern(regexp = ".*[A-Z].*", message = "Include at least one uppercase letter.")
            @Pattern(regexp = ".*[a-z].*", message = "Include at least one lowercase letter.")
            @Pattern(regexp = ".*[0-9].*", message = "Include at least one number.")
            String password) {
    }

    public record ChangePasswordRequest(
            @NotBlank(message = "Enter your current password.") String currentPassword,
            @NotBlank(message = "Choose a new password.")
            @Size(min = 8, max = 72, message = "Use between 8 and 72 characters.")
            @Pattern(regexp = ".*[A-Z].*", message = "Include at least one uppercase letter.")
            @Pattern(regexp = ".*[a-z].*", message = "Include at least one lowercase letter.")
            @Pattern(regexp = ".*[0-9].*", message = "Include at least one number.")
            String newPassword) {
    }

    public record VerifyRequest(
            @NotBlank(message = "Enter the verification code.")
            @Size(min = 6, max = 64, message = "Enter the code from your email.") String code) {
    }

    public record AuthSessionResponse(UserDtos.UserResponse user, long issuedAt, long expiresAt, boolean demo) {
    }

    public record MessageResponse(String message) {
    }

    public record VerifiedResponse(boolean verified) {
    }

    public record CsrfResponse(String token, String headerName) {
    }
}
