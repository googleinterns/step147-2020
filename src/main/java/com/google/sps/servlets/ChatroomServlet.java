// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import java.io.IOException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import java.util.HashMap;
import java.io.BufferedReader;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import com.google.datastore.v1.PropertyFilter;
import com.google.sps.servlets.Message;

FirebaseApp.initializeApp();

/** Servlet that holds the chatrooms active on this WebApp */
@WebServlet("/chatroom")
public class ChatroomServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // check header and verifies if user is legit using Firebase
        String userID;
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            userID = decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }

        String recipientID = request.getParameter("recipientId"); // the user whose chat was clicked
        String chatroomID;

        Query chatroomQuery = new Query("chatroom");
        PreparedQuery chatrooms = database.prepare(chatroomQuery);

        for (Entity chatroom : chatrooms.asIterable()) {
            if (chatroom.getProperty("users").contains(userID) && chatroom.getProperty("users").contains(recipientID)) {
                    chatroomID = chatroom.get("chatroomId");
                    break;
            }
        }

        // go through messages and grabs the messages with chatroomID = to the chatroomID passed in
        // then sorts them by timestamp
        Query messageQuery = new Query("message").addSort("timestamp", SortDirection.DESCENDING);

        PreparedQuery results = database.prepare(query);
        ArrayList<Message> messagesInChatroom = new ArrayList<Message>();

        for (Entity message : results.asIterable()) {
            String messageId = (String) message.getProperty("messageId");
            String chatroomId = (String) message.getProperty("chatroomId");
            String text = (String) message.getProperty("text");
            String translatedText = (String) message.getProperty("translatedText");
            String senderId = (String) message.getProperty("senderId");
            String recipientId = (String) message.getProperty("recipientId");
            Long timestamp = (Long) message.getProperty("timestamp");

            Message messageInstance = new Message(messageId, chatroomId, text, translatedText, senderId, recipientId, timestamp);

            messagesInChatroom.add(messageInstance);
        }

        response.setContentType("application/json");
        response.getWriter().println(convertToJsonUsingGson(messagesInChatroom));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userID;
        
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            userID = decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }

        String recipientID = request.getParameter("recipientId");
        String chatroomID;

        Query chatroomQuery = new Query("chatroom");
        PreparedQuery chatrooms = database.prepare(query);

        for (Entity chatroom : chatrooms.asIterable()) {
            if (chatroom.getProperty("users").contains(userID) && chatroom.getProperty("users").contains(recipientID)) {
                    chatroomID = chatroom.get("chatroomId");
                    break;
            }
        }

        if (chatroomID == null) { //make new chatroom
            Entity newChatroom = new Entity("chatroom");
            String[] chatroomMembers = {userID, recipientID};
            newChatroom.setProperty("chatroomId", database.allocateId(newChatroom));
            newChatroom.setProperty("users", chatroomMembers);
            chatroomID = newChatroom.getProperty("chatroomId");
        }

        Entity newMessage = new Entity("message");
        newMessage.setProperty("messageId", database.allocateId(newMessage));
        newMessage.setProperty("chatroomId", chatroomID);
        newMessage.setProperty("text", request.getParameter("text"));
        newMessage.setProperty("senderId", userID);
        newMessage.setProperty("recipientId", recipientID);
        newMessage.setProperty("timestamp", System.currentTimeMillis());

        //translation
        Translate translate = TranslateOptions.getDefaultInstance().getService();
        Translation translation = translate.translate((String) newMessage.getProperty("text"), Translate.TranslateOption.targetLanguage(request.getParameter("translation-language")));
        String translatedText = translation.getTranslatedText();
        newMessage.setProperty("translatedText", translatedText);

        database.put(newMessage);
    }

    private String convertToJsonUsingGson(Object list) {
        Gson gson = new Gson();
        String json = gson.toJson(list);
        return json;
    }
}