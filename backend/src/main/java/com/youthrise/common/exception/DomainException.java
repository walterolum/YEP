package com.youthrise.common.exception;

import com.youthrise.common.ApiException;
import org.springframework.http.HttpStatus;

/**
 * Base class for failures that describe a broken domain rule rather than a
 * transport problem. Each subclass names a stable machine-readable code so the
 * frontend can react without parsing prose.
 */
public abstract class DomainException extends ApiException {

    protected DomainException(HttpStatus status, String code, String message) {
        super(status, code, message);
    }
}
