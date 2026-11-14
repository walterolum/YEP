package ug.yep.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Safe default runner. It never executes untrusted code on the application host; submissions
 * are stored and marked for review. Point {@code yep.code-runner.enabled} at a real sandboxed
 * runner when one is deployed.
 */
@Component
public class ReviewOnlyCodeRunner implements CodeRunner {

    private final boolean sandboxEnabled;

    public ReviewOnlyCodeRunner(@Value("${yep.code-runner.enabled:false}") boolean sandboxEnabled) {
        this.sandboxEnabled = sandboxEnabled;
    }

    @Override
    public Result run(String language, String code, String expectedOutput) {
        if (sandboxEnabled) {
            return Result.review("A sandbox is configured but no runner adapter was registered; "
                    + "your submission was saved for review.");
        }
        return Result.review("Saved. Automatic grading is not enabled on this environment; "
                + "a facilitator will review your submission.");
    }
}
