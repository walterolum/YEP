package com.youthrise.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Raised when a certificate is requested for work that has not met the pass rule.
 */
public class CertificateNotEligibleException extends DomainException {

    public CertificateNotEligibleException(String message) {
        super(HttpStatus.CONFLICT, "CERTIFICATE_NOT_ELIGIBLE", message);
    }
}
