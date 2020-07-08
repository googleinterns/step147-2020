package com.google.sps.servlets;

public class Post {
    String senderId;
    String recipientId;
    String text;

    public Post(String newSenderId, String newRecipient, String newText) {
        this.senderId = newSenderId;
        this.recipientId = newRecipient;
        this.text = newText;
    }
}