package com.google.sps.servlets;
import java.util.ArrayList;
import java.util.List;

public class Chatroom {
    String chatroomId;
    List<String> users = new ArrayList<String>();

    public Chatroom(String newChatroomId, String user1, String user2){
        chatroomId = newChatroomId;
        users.add(user1);
        users.add(user2);
    }

    public List<String> getUsers(){
        return users;
    }

    public String getId(){
        return chatroomId;
    }
}