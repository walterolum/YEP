package com.youthrise.assessment;

/**
 * Contract for work that is marked against a published maximum. Implementations
 * decide how a score is stored; the pass rule lives here once so assessments and
 * project submissions cannot drift apart.
 */
public interface Assessable {

    /** Highest mark that can be awarded. */
    int maxScore();

    /** Awarded mark, or null while the work is ungraded. */
    Integer awardedScore();

    /** True once a marker has recorded a decision. */
    boolean isGraded();

    /** Awarded mark as a percentage of the maximum, 0 when ungraded. */
    default double percentage() {
        if (awardedScore() == null || maxScore() <= 0) {
            return 0;
        }
        return awardedScore() * 100.0 / maxScore();
    }

    /** Pass rule shared by every assessable artefact. */
    default boolean isPassed() {
        return isGraded() && percentage() >= 50;
    }
}
