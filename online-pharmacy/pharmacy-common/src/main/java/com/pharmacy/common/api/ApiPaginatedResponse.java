package com.pharmacy.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiPaginatedResponse<T> {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("message")
    private String message;

    @JsonProperty("data")
    private T data;

    @JsonProperty("errors")
    private List<String> errors;

    @JsonProperty("pagination")
    private PaginationInfo pagination;

    @JsonProperty("timestamp")
    private Instant timestamp;

    @JsonProperty("traceId")
    private String traceId;

    public void setSuccess(boolean success) { this.success = success; }
    public void setMessage(String message) { this.message = message; }
    public void setData(T data) { this.data = data; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setTraceId(String traceId) { this.traceId = traceId; }

    public static <T> ApiPaginatedResponse<T> of(T data, Page<?> page) {
        ApiPaginatedResponse<T> response = new ApiPaginatedResponse<>();
        response.setSuccess(true);
        response.setData(data);
        if (page != null) {
            PaginationInfo paginationInfo = new PaginationInfo();
            paginationInfo.setPage(page.getNumber());
            paginationInfo.setSize(page.getSize());
            paginationInfo.setTotalElements((int) page.getTotalElements());
            paginationInfo.setTotalPages(page.getTotalPages());
            paginationInfo.setFirst(page.isFirst());
            paginationInfo.setLast(page.isLast());
            response.setPagination(paginationInfo);
        }
        response.setTimestamp(Instant.now());
        return response;
    }

    public static <T> ApiPaginatedResponse<T> error(List<String> errors, String message) {
        ApiPaginatedResponse<T> response = new ApiPaginatedResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setErrors(errors);
        response.setTimestamp(Instant.now());
        return response;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private int page;
        private int size;
        private int totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;

        public void setPage(int page) { this.page = page; }
        public void setSize(int size) { this.size = size; }
        public void setTotalElements(int totalElements) { this.totalElements = totalElements; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public void setFirst(boolean first) { this.first = first; }
        public void setLast(boolean last) { this.last = last; }
    }
}