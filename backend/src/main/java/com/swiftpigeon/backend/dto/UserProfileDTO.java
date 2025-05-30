package com.swiftpigeon.backend.dto;

import com.swiftpigeon.backend.model.Address;
import com.swiftpigeon.backend.model.UserEntity;

public record UserProfileDTO(
    String firstName,
    String lastName,
    String email,
    AddressDTO address
) {
    public UserProfileDTO(UserEntity user) {
        this(
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getAddress() != null ? new AddressDTO(user.getAddress()) : null
        );
    }
    
    public static record AddressDTO(
        String province,
        String city,
        String street,
        String postcode
    ) {
        public AddressDTO(Address address) {
            this(
                address.getProvince(),
                address.getCity(),
                address.getStreet(),
                address.getPostcode()
            );
        }
        
        public Address toEntity() {
            return new Address(null, province, city, street, postcode);
        }
    }
}
