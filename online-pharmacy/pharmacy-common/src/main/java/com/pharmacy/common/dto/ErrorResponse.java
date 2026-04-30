package com.pharmacy.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("statusCode")
    private int statusCode;

    @JsonProperty("message")
    private String message;

    @JsonProperty("errors")
    private List<String> errors;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("traceId")
    private String traceId;

    @JsonProperty("path")
    private String path;

    public void setSuccess(boolean success) { this.success = success; }
    public void setStatusCode(int statusCode) { this.statusCode = statusCode; }
    public void setMessage(String message) { this.message = message; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setTraceId(String traceId) { this.traceId = traceId; }
    public void setPath(String path) { this.path = path; }

    public static ErrorResponse of(int statusCode, String message) {
        ErrorResponse response = new ErrorResponse();
        response.setSuccess(false);
        response.setStatusCode(statusCode);
        response.setMessage(message);
        response.setTimestamp(Instant.now());
        return response;
    }

    public static ErrorResponse of(int statusCode, String message, List<String> errors) {
        ErrorResponse response = new ErrorResponse();
        response.setSuccess(false);
        response.setStatusCode(statusCode);
        response.setMessage(message);
        response.setErrors(errors);
        response.setTimestamp(Instant.now());
        return response;
    }
}