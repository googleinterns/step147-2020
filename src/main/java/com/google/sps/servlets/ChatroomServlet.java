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

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import com.google.sps.servlets.Message;
import com.google.sps.servlets.Post;
import com.google.sps.servlets.Chatroom;

/** Servlet that holds the chatrooms active on this WebApp */
@WebServlet("/chatroom")
public class ChatroomServlet extends HttpServlet {


    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userID = request.getParameter("userId");
        String recipientID = request.getParameter("recipientId"); // the user whose chat was clicked
        String chatroomID = "";

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Query chatroomQuery = new Query("chatroom");
        PreparedQuery chatrooms = datastore.prepare(chatroomQuery);
        for (Entity chatroom : chatrooms.asIterable()) {
            String chatroomId = (String) chatroom.getProperty("chatroomId");
            ArrayList<String> users = (ArrayList<String>) chatroom.getProperty("users");
            
            Chatroom currChatRoom = new Chatroom(chatroomId, users.get(0), users.get(1));

            if (currChatRoom.users.contains(userID) && currChatRoom.users.contains(recipientID)) {
                    chatroomID = currChatRoom.chatroomId;
                    break;
            }
        }

        // go through messages and grabs the messages with chatroomID = to the chatroomID passed in
        // then sorts them by timestamp
        Query messageQuery = new Query("message").addSort("timestamp", SortDirection.DESCENDING);
        PreparedQuery results = datastore.prepare(messageQuery);

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
            
            if (messageInstance.chatroomId.equals(chatroomID)) {
                messagesInChatroom.add(messageInstance);
            }
        }

        Gson gson = new Gson();
    
        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(messagesInChatroom));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
        String jsonString = IOUtils.toString(request.getInputStream());
        Post newPost = new Gson().fromJson(jsonString, Post.class);

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        String chatroomID = "";
        Query chatroomQuery = new Query("chatroom");
        PreparedQuery chatrooms = datastore.prepare(chatroomQuery);

        // Query and retrieve the chatroom for the users.
        for (Entity chatroom : chatrooms.asIterable()) {
            String chatroomId = (String) chatroom.getProperty("chatroomId");
            ArrayList<String> users = (ArrayList<String>) chatroom.getProperty("users");

            Chatroom currChatRoom = new Chatroom(chatroomId, users.get(0), users.get(1));

            if (currChatRoom.users.contains(newPost.senderId) && currChatRoom.users.contains(newPost.recipientId)) {
                    chatroomID = currChatRoom.chatroomId;
                    break;
            }
        }

        // Check to see if chatroom is empty and make new chatroom
        if (chatroomID == "") {
            Entity newChatroom = new Entity("chatroom");
            String[] chatroomMembers = {newPost.senderId, newPost.recipientId};
            chatroomID = UUID.randomUUID().toString();
            newChatroom.setProperty("chatroomId", chatroomID);
            newChatroom.setProperty("users", chatroomMembers);
        }

        // Query the user and retrieve the language of the recipient.
        Query userQuery = new Query("user");
        PreparedQuery users = datastore.prepare(userQuery);
        String lang = "";
        for (Entity user: users.asIterable()){
            if((String) user.getProperty("userId") == newPost.recipientId){
                lang = (String) user.getProperty("language");
                break;
            }
        }

        // Translate the text.
        Translate translate = TranslateOptions.getDefaultInstance().getService();
        Translation translation = translate.translate(newPost.text, Translate.TranslateOption.targetLanguage(lang));
        String translatedText = translation.getTranslatedText();

        Entity newMessage = new Entity("message");
        String messageUUID = UUID.randomUUID().toString();
        newMessage.setProperty("messageId", messageUUID);
        newMessage.setProperty("chatroomId", chatroomID);
        newMessage.setProperty("text", newPost.text);
        newMessage.setProperty("translatedText", translatedText);
        newMessage.setProperty("senderId", newPost.senderId);
        newMessage.setProperty("recipientId", newPost.recipientId);
        newMessage.setProperty("timestamp", System.currentTimeMillis());

        datastore.put(newMessage);
    }

}