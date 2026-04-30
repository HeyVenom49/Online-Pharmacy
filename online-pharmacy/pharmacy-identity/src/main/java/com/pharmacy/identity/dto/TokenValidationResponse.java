package com.pharmacy.identity.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Result of validating a JWT with the identity service")
public class TokenValidationResponse {

    @Schema(description = "Whether the token is currently valid", example = "true")
    private boolean valid;

    public TokenValidationResponse() {
    }

    public TokenValidationResponse(boolean valid) {
        this.valid = valid;
    }

    public static TokenValidationResponseBuilder builder() {
        return new TokenValidationResponseBuilder();
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public static class TokenValidationResponseBuilder {
        private boolean valid;

        public TokenValidationResponseBuilder valid(boolean valid) {
            this.valid = valid;
            return this;
        }

        public TokenValidationResponse build() {
            return new TokenValidationResponse(valid);
        }
    }
}