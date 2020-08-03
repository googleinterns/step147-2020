package com.google.sps.servlets;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.DatastoreService;
 
public class Message {
   public String messageId;
   public String chatroomId;
   public String text;
   public String translatedText;
   public String senderId;
   public String recipientId;
   public Long timestamp;
 
   public Message(String newMessageId, String newChatroomId, String newText, String newTranslatedText, String newSenderId, String newRecipientId, Long newTimestamp) {
       this.messageId = newMessageId;
       this.chatroomId = newChatroomId;
       this.text = newText;
       this.translatedText = newTranslatedText;
       this.senderId = newSenderId;
       this.recipientId = newRecipientId;
       this.timestamp = newTimestamp;
   }
 
   public Message(Entity entity) {
       this.messageId = (String) entity.getProperty("messageId");
       this.chatroomId = (String) entity.getProperty("chatroomId");
       this.text = (String) entity.getProperty("text");
       this.translatedText = (String) entity.getProperty("translatedText");
       this.senderId = (String) entity.getProperty("senderId");
       this.recipientId = (String) entity.getProperty("recipientId");
       this.timestamp = (Long) entity.getProperty("timestamp");
   }
 
   public setEntity(){
       Entity newMessage = new Entity("message");
       newMessage.setProperty("messageId", this.messageId);
       newMessage.setProperty("chatroomId", this.chatroomId);
       newMessage.setProperty("text", this.text);
       newMessage.setProperty("translatedText", this.translatedText);
       newMessage.setProperty("senderId", this.senderId);
       newMessage.setProperty("recipientId", this.recipientId);
       newMessage.setProperty("timestamp", this.timestamp);
 
       DatastoreServiceFactory.getDatastoreService().put(newMessage);
   }
 
}

