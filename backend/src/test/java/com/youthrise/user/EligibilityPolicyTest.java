package com.youthrise.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.youthrise.common.exception.EligibilityException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class EligibilityPolicyTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 12);

    @Test
    void acceptsSomeoneWhoTurnsEighteenToday() {
        LocalDate dob = TODAY.minusYears(18);
        assertThat(EligibilityPolicy.isEligible(dob, TODAY)).isTrue();
    }

    @Test
    void rejectsSomeoneOneDayShortOfEighteen() {
        LocalDate dob = TODAY.minusYears(18).plusDays(1);
        assertThat(EligibilityPolicy.isEligible(dob, TODAY)).isFalse();
        assertThatThrownBy(() -> EligibilityPolicy.requireEligible(dob, TODAY))
                .isInstanceOf(EligibilityException.class)
                .hasMessageContaining("18");
    }

    @Test
    void acceptsSomeoneWhoTurnsThirtySixTomorrow() {
        LocalDate dob = TODAY.minusYears(35);
        assertThat(EligibilityPolicy.isEligible(dob, TODAY)).isTrue();
    }

    @Test
    void rejectsSomeoneWhoIsThirtySix() {
        LocalDate dob = TODAY.minusYears(36);
        assertThat(EligibilityPolicy.isEligible(dob, TODAY)).isFalse();
    }

    @Test
    void rejectsMissingOrFutureDates() {
        assertThat(EligibilityPolicy.isEligible(null, TODAY)).isFalse();
        assertThatThrownBy(() -> EligibilityPolicy.requireEligible(null, TODAY))
                .isInstanceOf(EligibilityException.class);
        assertThatThrownBy(() -> EligibilityPolicy.requireEligible(TODAY.plusDays(1), TODAY))
                .isInstanceOf(EligibilityException.class)
                .hasMessageContaining("past");
    }
}
