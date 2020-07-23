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
import java.util.Arrays;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilter;
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
import com.pusher.rest.Pusher;
 
/** Servlet that holds the chatrooms active on this WebApp */
@WebServlet("/messages")
public class MessageServlet extends HttpServlet {
 
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
 
        String userID = request.getParameter("userId");
        String recipientID = request.getParameter("recipientId"); // the user whose chat was clicked
        String chatroomID = request.getParameter("chatroomId");
 
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
 
        Query chatroomQuery = new Query("chatroom");
        chatroomQuery.setFilter(new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(
                new FilterPredicate("user1", FilterOperator.EQUAL, userID),
                new FilterPredicate("user2", FilterOperator.EQUAL, recipientID))));
 
        Entity chatroom = datastore.prepare(chatroomQuery).asSingleEntity();
 
        if (chatroom != null) {
            chatroomID = (String) chatroom.getProperty("chatroomId");
        }
 
        // Check to see if chatroom is empty and make new chatroom
        if (chatroomID == "null") {
            Entity newChatroom = new Entity("chatroom");
            chatroomID = UUID.randomUUID().toString();
            newChatroom.setProperty("chatroomId", chatroomID);
            newChatroom.setProperty("user1", userID);
            newChatroom.setProperty("user2", recipientID);
            datastore.put(newChatroom);
        }
 
        // go through messages and grabs the messages with chatroomID = to the chatroomID passed in
        // then sorts them by timestamp
        Query messageQuery = new Query("message").addSort("timestamp", SortDirection.ASCENDING);;
        // messageQuery.setFilter(new FilterPredicate("chatroomId", FilterOperator.EQUAL, chatroomID));
        // messageQuery.addSort("timestamp", SortDirection.ASCENDING);
        PreparedQuery results = datastore.prepare(messageQuery);
 
        ArrayList<Message> messagesInChatroom = new ArrayList<Message>();
 
        for (Entity message : results.asIterable()) {
            Message messageInstance = new Message(message);
            if(messageInstance.chatroomId.equals(chatroomID)){
                messagesInChatroom.add(messageInstance);
            }
        }
        
        Gson gson = new Gson();
    
        response.setCharacterEncoding("UTF-8");
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
            String user1 = (String) chatroom.getProperty("user1");
            String user2 = (String) chatroom.getProperty("user2");
 
            Chatroom currChatRoom = new Chatroom(chatroomId, user1, user2);
            List<String> usersList = currChatRoom.getUsers();
 
            if (usersList.contains(newPost.senderId) && usersList.contains(newPost.recipientId)) {
                    chatroomID = currChatRoom.getId();
                    break;
            }
        }
 
        // Query the user and retrieve the language of the recipient.
        Query userQuery = new Query("user");
        PreparedQuery users = datastore.prepare(userQuery);
        String lang = "";
        for (Entity user: users.asIterable()){
            String userLang = (String) user.getProperty("userId");
            if (userLang.equals(newPost.recipientId)){
                lang = (String) user.getProperty("language");
                break;
            }
        }
 
        // Translate the text.
        Translate translate = TranslateOptions.getDefaultInstance().getService();
        Translation translation = translate.translate(newPost.text, Translate.TranslateOption.targetLanguage(lang));
        String translatedText = translation.getTranslatedText();
        // String translatedText = newPost.text;
 
        Entity newMessage = new Entity("message");
        String messageUUID = UUID.randomUUID().toString();
        newMessage.setProperty("messageId", messageUUID);
        newMessage.setProperty("chatroomId", newPost.chatroomId);
        newMessage.setProperty("text", newPost.text);
        newMessage.setProperty("translatedText", translatedText);
        newMessage.setProperty("senderId", newPost.senderId);
        newMessage.setProperty("recipientId", newPost.recipientId);
        newMessage.setProperty("timestamp", System.currentTimeMillis());
        datastore.put(newMessage);
 
        //Push the message
        Pusher pusher = new Pusher("1036570", "fb37d27cdd9c1d5efb8d", "9698b690db9bed0b0ef7");
        pusher.setCluster("us2");
        pusher.setEncrypted(true);
 
        // New message instance
        Message messageInstance = new Message(newMessage);
        Gson gson = new Gson();
 
        pusher.trigger(newPost.chatroomId, "new-message", gson.toJson(messageInstance));
 
    }
 
}

