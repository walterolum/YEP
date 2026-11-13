package com.youthrise.user;

import com.youthrise.common.exception.EligibilityException;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneOffset;

/**
 * The 18-35 youth eligibility rule for the platform. Kept as a pure policy so
 * registration, enrolment and tests all apply exactly the same boundaries.
 */
public final class EligibilityPolicy {

    public static final int MIN_AGE = 18;
    public static final int MAX_AGE = 35;

    private EligibilityPolicy() {
    }

    /** True when the person has reached 18 and has not yet turned 36 on {@code today}. */
    public static boolean isEligible(LocalDate dateOfBirth, LocalDate today) {
        if (dateOfBirth == null || today == null || dateOfBirth.isAfter(today)) {
            return false;
        }
        int age = Period.between(dateOfBirth, today).getYears();
        return age >= MIN_AGE && age <= MAX_AGE;
    }

    /** Validates against today's date in UTC. */
    public static void requireEligible(LocalDate dateOfBirth) {
        requireEligible(dateOfBirth, LocalDate.now(ZoneOffset.UTC));
    }

    /** Validates against a supplied day so tests do not depend on the clock. */
    public static void requireEligible(LocalDate dateOfBirth, LocalDate today) {
        if (dateOfBirth == null) {
            throw new EligibilityException("Enter your date of birth.");
        }
        if (dateOfBirth.isAfter(today)) {
            throw new EligibilityException("Enter a date of birth in the past.");
        }
        if (!isEligible(dateOfBirth, today)) {
            throw new EligibilityException(
                    "YEP is open to young people aged " + MIN_AGE + " to " + MAX_AGE + ".");
        }
    }
}
