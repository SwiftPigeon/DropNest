package com.SwiftPigeon.backend.model;


public class UserAlreadyExistException extends RuntimeException {


    public UserAlreadyExistException() {
        super("Username already exists");
    }
}
