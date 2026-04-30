package com.pharmacy.identity.dto;

public class AddressDTO {
    private Long id;
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private Boolean isDefault;

    public AddressDTO() {
    }

    public AddressDTO(Long id, String addressLine, String city, String state, String pincode, Boolean isDefault) {
        this.id = id;
        this.addressLine = addressLine;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.isDefault = isDefault;
    }

    public static AddressDTOBuilder builder() {
        return new AddressDTOBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public static class AddressDTOBuilder {
        private Long id;
        private String addressLine;
        private String city;
        private String state;
        private String pincode;
        private Boolean isDefault;

        public AddressDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AddressDTOBuilder addressLine(String addressLine) {
            this.addressLine = addressLine;
            return this;
        }

        public AddressDTOBuilder city(String city) {
            this.city = city;
            return this;
        }

        public AddressDTOBuilder state(String state) {
            this.state = state;
            return this;
        }

        public AddressDTOBuilder pincode(String pincode) {
            this.pincode = pincode;
            return this;
        }

        public AddressDTOBuilder isDefault(Boolean isDefault) {
            this.isDefault = isDefault;
            return this;
        }

        public AddressDTO build() {
            return new AddressDTO(id, addressLine, city, state, pincode, isDefault);
        }
    }
}