package com.youthrise.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when a mark falls outside the range published with the assessment.
 */
public class ScoringException extends DomainException {

    public ScoringException(int maxScore) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, "SCORE_OUT_OF_RANGE",
                "Enter a score between 0 and " + maxScore + ".");
    }
}
