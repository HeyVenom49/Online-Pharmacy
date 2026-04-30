package com.pharmacy.identity.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressRequest {

    @NotBlank(message = "Address is required")
    private String addressLine;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private Boolean isDefault;

    public AddressRequest() {}

    public AddressRequest(String addressLine, String city, String state, String pincode, Boolean isDefault) {
        this.addressLine = addressLine;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.isDefault = isDefault;
    }

    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public static AddressRequestBuilder builder() { return new AddressRequestBuilder(); }

    public static class AddressRequestBuilder {
        private String addressLine;
        private String city;
        private String state;
        private String pincode;
        private Boolean isDefault;

        public AddressRequestBuilder addressLine(String addressLine) { this.addressLine = addressLine; return this; }
        public AddressRequestBuilder city(String city) { this.city = city; return this; }
        public AddressRequestBuilder state(String state) { this.state = state; return this; }
        public AddressRequestBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public AddressRequestBuilder isDefault(Boolean isDefault) { this.isDefault = isDefault; return this; }
        public AddressRequest build() { return new AddressRequest(addressLine, city, state, pincode, isDefault); }
    }
}