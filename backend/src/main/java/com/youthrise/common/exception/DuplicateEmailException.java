package com.youthrise.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when an email address is already attached to an account.
 */
public class DuplicateEmailException extends DomainException {

    public DuplicateEmailException() {
        super(HttpStatus.CONFLICT, "EMAIL_IN_USE", "An account already exists for this email address.");
    }
}
