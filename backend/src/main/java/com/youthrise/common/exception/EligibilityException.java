package com.youthrise.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when a registration or enrolment fails the 18-35 eligibility rule.
 */
public class EligibilityException extends DomainException {

    public EligibilityException(String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, "ELIGIBILITY", message);
    }
}
