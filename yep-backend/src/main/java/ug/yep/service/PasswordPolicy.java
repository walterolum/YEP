package ug.yep.service;

import java.util.Locale;
import java.util.Set;
import ug.yep.exception.BusinessRuleException;

/**
 * One password rule for the whole platform: 8+ characters, at least three of
 * lower case, upper case, digits and symbols, and never a well-known password.
 * The client shows the same score as a meter; the server is the authority.
 */
public final class PasswordPolicy {

    private static final Set<String> COMMON = Set.of(
            "password", "password1", "password123", "12345678", "123456789",
            "qwerty123", "qwertyuiop", "iloveyou", "admin123", "letmein1", "welcome1",
            "abc12345", "football1", "monkey123", "dragon123", "sunshine1", "princess1");

    private PasswordPolicy() {
    }

    /** 0 = very weak … 4 = strong. Mirrors the meter shown in the sign-up form. */
    public static int strength(String raw) {
        if (raw == null || raw.isEmpty()) {
            return 0;
        }
        int score = 0;
        if (raw.length() >= 8) {
            score++;
        }
        if (raw.length() >= 12) {
            score++;
        }
        int classes = 0;
        boolean lower = false;
        boolean upper = false;
        boolean digit = false;
        boolean symbol = false;
        for (char c : raw.toCharArray()) {
            if (Character.isLowerCase(c)) {
                lower = true;
            } else if (Character.isUpperCase(c)) {
                upper = true;
            } else if (Character.isDigit(c)) {
                digit = true;
            } else {
                symbol = true;
            }
        }
        classes += lower ? 1 : 0;
        classes += upper ? 1 : 0;
        classes += digit ? 1 : 0;
        classes += symbol ? 1 : 0;
        if (classes >= 3) {
            score++;
        }
        if (classes >= 4) {
            score++;
        }
        if (COMMON.contains(raw.toLowerCase(Locale.ROOT))) {
            return 0;
        }
        return Math.min(4, score);
    }

    public static String label(int strength) {
        return switch (strength) {
            case 0, 1 -> "Weak";
            case 2 -> "Fair";
            case 3 -> "Good";
            default -> "Strong";
        };
    }

    public static void validate(String raw) {
        if (raw == null || raw.length() < 8) {
            throw new BusinessRuleException("Use a password with at least 8 characters.");
        }
        if (COMMON.contains(raw.toLowerCase(Locale.ROOT))) {
            throw new BusinessRuleException("That password is too common. Please choose another one.");
        }
        if (strength(raw) < 2) {
            throw new BusinessRuleException(
                    "Choose a stronger password: mix upper and lower case with a number or a symbol.");
        }
    }
}
