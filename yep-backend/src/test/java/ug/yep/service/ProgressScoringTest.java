package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

/** The one overall score: 40% lessons + 40% assessments + 20% attendance by default. */
class ProgressScoringTest {

    @Test
    void percentCountsCompletedLessonsAndNeverDividesByZero() {
        assertEquals(0, ProgressScoring.percent(0, 0));
        assertEquals(0, ProgressScoring.percent(0, 15));
        assertEquals(80, ProgressScoring.percent(12, 15));
    }

    @Test
    void percentClampsOutOfRangeInputs() {
        assertEquals(100, ProgressScoring.percent(20, 15));
        assertEquals(0, ProgressScoring.percent(-3, 15));
    }

    @Test
    void defaultWeightsAreFortyFortyTwenty() {
        assertEquals(78, ProgressScoring.overall(80, 90, 50, 40, 40, 20));
        assertEquals(92, ProgressScoring.overall(80, 100, 100, 40, 40, 20));
    }

    @Test
    void exactlyEightyIsReachedButSeventyNineIsNot() {
        assertEquals(80, ProgressScoring.overall(80, 80, 80, 40, 40, 20));
        assertEquals(79, ProgressScoring.overall(80, 80, 75, 40, 40, 20));
    }

    @Test
    void lessonsAloneCannotUnlock() {
        // 100% lessons with no assessments or attendance is 40, not 100.
        assertEquals(40, ProgressScoring.overall(100, 0, 0, 40, 40, 20));
    }

    @Test
    void weightsAreNormalisedAndZeroWeightsFallBackToLessons() {
        assertEquals(50, ProgressScoring.overall(50, 50, 50, 10, 10, 10));
        // With every weight at zero the lesson percentage is used rather than a divide-by-zero.
        assertEquals(73, ProgressScoring.overall(73, 0, 0, 0, 0, 0));
    }

    @Test
    void negativeWeightsAreIgnoredAndResultIsClamped() {
        assertEquals(100, ProgressScoring.overall(100, 100, 100, 40, -10, 20));
        assertEquals(0, ProgressScoring.overall(0, 0, 0, 40, 40, 20));
    }
}
