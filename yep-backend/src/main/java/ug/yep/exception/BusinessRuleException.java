package ug.yep.exception;

import org.springframework.http.HttpStatus;

/** A request that is understood but breaks a domain rule (400). */
public class BusinessRuleException extends ApiException {

    public BusinessRuleException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
