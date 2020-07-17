package com.google.sps.servlets;

public class Post {
    public String senderId;
    public String recipientId;
    public String text;
    public String chatroomId;

    public Post(String newSenderId, String newRecipient, String newText, String newChatroomId) {
        this.senderId = newSenderId;
        this.recipientId = newRecipient;
        this.text = newText;
        this.chatroomId = newChatroomId;
    }
}