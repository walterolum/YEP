package ug.yep.service;

/**
 * One definition of the overall score, shared by the dashboard, the course player and
 * the Level Two gate.
 *
 * <pre>
 * overall = lessons% x wLessons + assessments% x wAssessments + attendance% x wAttendance
 * </pre>
 *
 * <p>The weights come from {@code settings} (40/40/20 by default) and are normalised, so an
 * administrator can re-weight the score without a deployment and a bad sum cannot push the
 * result above 100.</p>
 */
public final class ProgressScoring {

    private ProgressScoring() {
    }

    /** Percentage of lessons completed; an empty course counts as 0, never as 100. */
    public static int percent(long completed, long total) {
        if (total <= 0) {
            return 0;
        }
        long clamped = Math.max(0, Math.min(completed, total));
        return (int) Math.round(clamped * 100.0 / total);
    }

    public static int percentClamped(int value) {
        return Math.max(0, Math.min(100, value));
    }

    /**
     * Weighted overall score. A zero or negative weight is treated as 0; when every weight is
     * zero the score falls back to the lesson percentage so the learner is never stuck at 0.
     */
    public static int overall(int lessonsPercent, int assessmentPercent, int attendancePercent,
                              int lessonsWeight, int assessmentWeight, int attendanceWeight) {
        int lw = Math.max(0, lessonsWeight);
        int aw = Math.max(0, assessmentWeight);
        int tw = Math.max(0, attendanceWeight);
        int sum = lw + aw + tw;
        if (sum == 0) {
            return percentClamped(lessonsPercent);
        }
        double score = (percentClamped(lessonsPercent) * lw
                + percentClamped(assessmentPercent) * aw
                + percentClamped(attendancePercent) * tw) / (double) sum;
        return percentClamped((int) Math.round(score));
    }
}
