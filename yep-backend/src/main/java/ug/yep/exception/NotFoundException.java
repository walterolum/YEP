package ug.yep.exception;

import org.springframework.http.HttpStatus;

/** A missing entity (404). */
public class NotFoundException extends ApiException {

    public NotFoundException(String what) {
        super(HttpStatus.NOT_FOUND, what + " was not found.");
    }
}
