package com.swiftpigeon.backend.model;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class MissingRequiredFieldException extends RuntimeException {
    private final String fieldName;
    
    public MissingRequiredFieldException(String fieldName) {
        super("Missing required field: " + fieldName);
        this.fieldName = fieldName;
    }
    
    public String getFieldName() {
        return fieldName;
    }
}
