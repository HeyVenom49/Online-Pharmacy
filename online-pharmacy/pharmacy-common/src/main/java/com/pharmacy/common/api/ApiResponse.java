package com.pharmacy.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("message")
    private String message;

    @JsonProperty("data")
    private T data;

    @JsonProperty("errors")
    private List<String> errors;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("traceId")
    private String traceId;

    public void setSuccess(boolean success) { this.success = success; }
    public void setMessage(String message) { this.message = message; }
    public void setData(T data) { this.data = data; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setTraceId(String traceId) { this.traceId = traceId; }

    public static <T> ApiResponse<T> of(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        response.setTimestamp(Instant.now());
        return response;
    }

    public static <T> ApiResponse<T> of(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setTimestamp(Instant.now());
        return response;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setTimestamp(Instant.now());
        return response;
    }

    public static <T> ApiResponse<T> error(List<String> errors, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setErrors(errors);
        response.setMessage(message);
        response.setTimestamp(Instant.now());
        return response;
    }
}