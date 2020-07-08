package com.google.sps.servlets;
import java.util.ArrayList;

public class Chatroom {
    String chatroomId;
    ArrayList<String> users;

    public Chatroom(String newChatroomId, String user1, String user2){
        chatroomId = newChatroomId;
        users.add(user1);
        users.add(user2);
    }
}