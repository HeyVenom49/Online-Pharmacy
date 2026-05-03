package com.pharmacy.common.api;

import java.time.Instant;
import java.util.List;

public final class ErrorResponses {

    private ErrorResponses() {
    }

    public static ErrorResponse of(int statusCode, String message) {
        return of(statusCode, message, null);
    }

    public static ErrorResponse of(int statusCode, String message, List<String> errors) {
        return of(statusCode, message, errors, null);
    }

    public static ErrorResponse of(int statusCode, String message, List<String> errors, String errorLabel) {
        return ErrorResponse.builder()
                .success(false)
                .statusCode(statusCode)
                .message(message)
                .errors(errors)
                .error(errorLabel)
                .timestamp(Instant.now())
                .build();
    }
}
