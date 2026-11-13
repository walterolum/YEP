package com.youthrise.common;

import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        ApiErrorResponse body = new ApiErrorResponse(ex.getCode(), ex.getMessage(),
                ex.getFieldErrors().isEmpty() ? null : ex.getFieldErrors());
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(ex.getStatus());
        if (ex.getRetryAfterSeconds() != null) {
            builder.header(HttpHeaders.RETRY_AFTER, String.valueOf(ex.getRetryAfterSeconds()));
        }
        return builder.body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.unprocessableEntity()
                .body(new ApiErrorResponse("VALIDATION", "Please correct the highlighted fields.", fields));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                fields.putIfAbsent(violation.getPropertyPath().toString(), violation.getMessage()));
        return ResponseEntity.unprocessableEntity()
                .body(new ApiErrorResponse("VALIDATION", "Please correct the highlighted fields.", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiErrorResponse("MALFORMED_REQUEST", "The request body could not be read."));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiErrorResponse> handleUploadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.unprocessableEntity()
                .body(new ApiErrorResponse("FILE_TOO_LARGE", "The file is larger than the 10 MB limit."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiErrorResponse> handleMissingResource(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse("NOT_FOUND", "The requested resource was not found."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiErrorResponse("FORBIDDEN", "You do not have permission to do that."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiErrorResponse> handleIntegrity(DataIntegrityViolationException ex) {
        log.warn("Database constraint violation", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiErrorResponse("CONFLICT", "That change conflicts with the current data."));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unhandled API failure [{}]", correlationId, ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header("X-Correlation-Id", correlationId)
                .body(new ApiErrorResponse("INTERNAL_ERROR",
                        "Something went wrong. Please try again and quote reference " + correlationId + "."));
    }
}
