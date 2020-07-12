package com.google.sps.servlets;

public class User {
    String userId;
    String name;
    String email;
    String language;

    public User(String userID, String name, String email, String language) {
        this.userId = userID;
        this.name = name;
        this.email = email;
        this.language = language;
    }
}