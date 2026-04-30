package com.pharmacy.common.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PageResponseErrorResponseTest {

    @Test
    void pageResponseBuilder() {
        PageResponse<String> p = PageResponse.<String>builder()
                .content(List.of("a"))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .first(true)
                .last(true)
                .build();
        assertEquals(1, p.getContent().size());
        assertEquals(0, p.getPage());
        assertEquals(10, p.getSize());
        assertEquals(1, p.getTotalElements());
        assertTrue(p.isFirst());
        assertTrue(p.isLast());
    }

    @Test
    void pageResponseSetters() {
        PageResponse<Integer> p = new PageResponse<>();
        p.setContent(List.of(1));
        p.setPage(2);
        p.setSize(5);
        p.setTotalElements(100);
        p.setTotalPages(20);
        p.setFirst(false);
        p.setLast(false);
        assertEquals(2, p.getPage());
    }

    @Test
    void errorResponseBuilder() {
        ErrorResponse e = ErrorResponse.builder()
                .statusCode(400)
                .message("msg")
                .path("/p")
                .errors(List.of("error1"))
                .build();
        assertEquals(400, e.getStatusCode());
        assertEquals(1, e.getErrors().size());
    }

    @Test
    void errorResponseOf() {
        ErrorResponse e = ErrorResponse.of(400, "error msg", List.of("detail1", "detail2"));
        assertEquals(400, e.getStatusCode());
        assertEquals("error msg", e.getMessage());
        assertEquals(2, e.getErrors().size());
    }
}
