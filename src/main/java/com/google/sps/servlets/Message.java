package com.google.sps.servlets;


public class Message {
    String messageId;
    String chatroomId;
    String text;
    String translatedText;
    String senderId;
    String recipientId;
    Long timestamp;

    public Message(String newMessageId, String newChatroomId, String newText, String newTranslatedText, String newSenderId, String newRecipientId, Long newTimestamp) {
        this.messageId = newMessageId;
        this.chatroomId = newChatroomId;
        this.text = newText;
        this.translatedText = newTranslatedText;
        this.senderId = newSenderId;
        this.recipientId = newRecipientId;
        this.timestamp = newTimestamp;
    }
}