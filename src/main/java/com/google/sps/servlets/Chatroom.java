package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

import java.util.ArrayList;
import java.util.List;

public class Chatroom {
    public String chatroomId;
    public List<String> users = new ArrayList<String>();

    public Chatroom(String newChatroomId, String user1, String user2) {
        chatroomId = newChatroomId;
        users.add(user1);
        users.add(user2);
    }

    public Chatroom(Entity entity) {
        chatroomId = (String) entity.getProperty("chatroomId");
        users.add((String) entity.getProperty("user1"));
        users.add((String) entity.getProperty("user2"));
    }

    public void setEntity() {
        Entity newChatroom = new Entity("chatroom");
        newChatroom.setProperty("chatroomId", this.chatroomId);
        newChatroom.setProperty("user1", this.users.get(0));
        newChatroom.setProperty("user2", this.users.get(1));

        DatastoreServiceFactory.getDatastoreService().put(newChatroom);
    }
}
