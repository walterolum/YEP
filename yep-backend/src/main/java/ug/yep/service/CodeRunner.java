package ug.yep.service;

/**
 * Executes learner code for a coding exercise.
 *
 * <p>The default implementation never pretends a submission passed: it stores the code and
 * returns {@code REVIEW} until a sandboxed runner (the separate service described in the
 * phase 0 audit) is configured. Tests inject a fake runner.</p>
 */
public interface CodeRunner {

    Result run(String language, String code, String expectedOutput);

    record Result(String status, int score, String output) {

        public static Result review(String message) {
            return new Result("REVIEW", 0, message);
        }
    }
}
