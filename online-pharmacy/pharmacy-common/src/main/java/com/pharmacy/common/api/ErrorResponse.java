package com.pharmacy.common.api;

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

    private boolean success;

    private int statusCode;

    private String message;

    @JsonProperty("error")
    private String error;

    @JsonProperty("errors")
    private List<String> errors;

    private Instant timestamp;

    private String traceId;

    private String path;
}
