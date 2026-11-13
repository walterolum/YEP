package com.youthrise.common;

import java.util.Map;
import org.springframework.http.HttpStatus;

/**
 * A failure that is safe to return to the client. Internal details are never
 * carried in the message; log them separately at the point of failure.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final Map<String, String> fieldErrors;
    private final Long retryAfterSeconds;

    protected ApiException(HttpStatus status, String code, String message) {
        this(status, code, message, null, null);
    }

    private ApiException(HttpStatus status, String code, String message,
                         Map<String, String> fieldErrors, Long retryAfterSeconds) {
        super(message);
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors == null ? Map.of() : Map.copyOf(fieldErrors);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public static ApiException badRequest(String code, String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, code, message, null, null);
    }

    public static ApiException unauthorized(String code, String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, code, message, null, null);
    }

    public static ApiException forbidden(String code, String message) {
        return new ApiException(HttpStatus.FORBIDDEN, code, message, null, null);
    }

    public static ApiException notFound(String code, String message) {
        return new ApiException(HttpStatus.NOT_FOUND, code, message, null, null);
    }

    public static ApiException conflict(String code, String message) {
        return new ApiException(HttpStatus.CONFLICT, code, message, null, null);
    }

    public static ApiException gone(String code, String message) {
        return new ApiException(HttpStatus.GONE, code, message, null, null);
    }

    public static ApiException validation(Map<String, String> fieldErrors) {
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION",
                "Please correct the highlighted fields.", fieldErrors, null);
    }

    public static ApiException validation(String field, String message) {
        return validation(Map.of(field, message));
    }

    public static ApiException unprocessable(String code, String message) {
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, code, message, null, null);
    }

    public static ApiException rateLimited(long retryAfterSeconds) {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED",
                "Too many attempts. Please wait and try again.", null, retryAfterSeconds);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }

    public Long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
