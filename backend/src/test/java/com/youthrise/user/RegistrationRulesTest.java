package com.youthrise.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.youthrise.common.exception.EligibilityException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

/**
 * Registration rules that must hold regardless of the web layer: only youth
 * participants may self-register, e-mail is normalised, and the 18-35 policy is
 * applied before an account exists.
 */
class RegistrationRulesTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 12);

    @Test
    void selfRegistrationAlwaysCreatesAParticipant() {
        User user = User.register("  Amara Nakato ", " Amara@Example.ORG ", null, "Uganda",
                "hash", "Africa/Kampala", LocalDate.of(2002, 5, 4));

        assertThat(user).isInstanceOf(Participant.class);
        assertThat(user.getRole()).isEqualTo(Role.PARTICIPANT);
        assertThat(user.getEmail()).isEqualTo("amara@example.org");
        assertThat(user.getFullName()).isEqualTo("Amara Nakato");
        assertThat(user.getInitials()).isEqualTo("AN");
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(user.isEligibleForLevelTwo()).isTrue();
        assertThat(user.canAdminister()).isFalse();
        assertThat(user.isEmailVerified()).isFalse();
    }

    @Test
    void eligibilityIsEnforcedAtTheEligibilityBoundary() {
        assertThat(EligibilityPolicy.isEligible(TODAY.minusYears(18), TODAY)).isTrue();
        assertThat(EligibilityPolicy.isEligible(TODAY.minusYears(35), TODAY)).isTrue();
        assertThat(EligibilityPolicy.isEligible(TODAY.minusYears(36), TODAY)).isFalse();
        assertThatThrownBy(() -> EligibilityPolicy.requireEligible(TODAY.minusYears(17), TODAY))
                .isInstanceOf(EligibilityException.class);
    }

    @Test
    void invitedAccountsCannotSignInUntilActivated() {
        User facilitator = User.invited("Daniel Okello", "daniel@example.org",
                Role.FACILITATOR, "Uganda", "Africa/Kampala");

        assertThat(facilitator.getStatus()).isEqualTo(AccountStatus.INVITED);
        assertThat(facilitator.getRole()).isEqualTo(Role.FACILITATOR);
        assertThat(facilitator.canFacilitate()).isTrue();
        assertThat(facilitator.isEligibleForLevelTwo()).isFalse();
        assertThat(facilitator.getPasswordHash()).isNull();
    }

    @Test
    void emailVerificationAndProfileCompletionAreDerivedFromState() {
        User user = User.register("Test Youth", "youth@example.org", "0700000000", "Kenya",
                "hash", "Africa/Nairobi", LocalDate.of(1999, 3, 3));
        int before = user.getProfileComplete();
        user.markEmailVerified(java.time.Instant.now());

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getProfileComplete()).isGreaterThan(before);
    }
}
