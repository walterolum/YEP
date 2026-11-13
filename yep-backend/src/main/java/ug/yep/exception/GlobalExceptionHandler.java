package ug.yep.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/** One place that turns every failure into a predictable JSON body. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> body(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, Object>> onApi(ApiException ex) {
        return body(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> onValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", 400);
        FieldError first = ex.getBindingResult().getFieldError();
        body.put("message", first == null ? "Please check the submitted details."
                : first.getField() + ": " + first.getDefaultMessage());
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler({AccessDeniedException.class})
    ResponseEntity<Map<String, Object>> onDenied(AccessDeniedException ex) {
        return body(HttpStatus.FORBIDDEN, "You do not have permission to perform this action.");
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Map<String, Object>> onAuthentication(AuthenticationException ex) {
        return body(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<Map<String, Object>> onUpload(MaxUploadSizeExceededException ex) {
        return body(HttpStatus.BAD_REQUEST, "The file is larger than the 10 MB limit.");
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> onUnexpected(Exception ex) {
        return body(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again.");
    }
}
