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
import com.google.gson.Gson;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

/** Servlet that holds the chatrooms active on this WebApp */
@WebServlet("/chatroom")
public class ChatroomServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // check header and verifies if user is legit using Firebase
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            String userID = decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }

        String recipientID = request.getParameter("recipient-id"); // the user whose chat was clicked

        // go through messages and grabs the messages with chatroomID = to the chatroomID passed in
        // then sorts them by timestamp
        Query<Entity> query = Query.newEntityQueryBuilder()
            .setKind("message")
            .setFilter(PropertyFilter.eq(chatroomID))
            .setOrderBy(OrderBy.asc("timestamp")
            .build();

        PreparedQuery results = database.prepare(query);
        ArrayList<String> messagesInChatroom = new ArrayList<String>();
        for (Entity message : results.asIterable()) {
            messagesInChatroom.add(message);
        }
        
        response.setContentType("application/json");
        response.getWriter().println(convertToJsonUsingGson(messagesInChatroom));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            String userID = decodedToken.getUid();
        } catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }

        //find the right chatroom
        Query<Entity> query = Query.newEntityQueryBuilder()
            .setKind("chatroom")
            .setOrderBy(OrderBy.asc("chatroom-id")
            .build();

        String chatroomID = null;
        PreparedQuery chatrooms = database.prepare(query);
        for (Entity chatroom : chatrooms.asIterable()) {
            Map<String, Value> chatroomDetails = chatroom.getPropertiesMap();

            if (chatroom.getProperty("users-in-chatroom").contains(userID)
                && chatroom.getProperty("users-in-chatroom").contains(request.getParameter("recipient-id")) {
                    chatroomID = chatroomDetails.get("chatroom-id");
                    break;
            }
        }

        if (chatroomID == null) { //make new chatroom
            Entity newChatroom = new Entity("chatroom");
            String[] chatroomMembers = {userID, recipientID};
            newChatroom.setProperty("chatroom-id", database.allocateId(newChatroom));
            newChatroom.setProperty("users-in-chatroom", chatroomMembers);
            chatroomID = newChatroom.getProperty("chatroom-id");
        }

        Entity newMessage = new Entity("message");
        newMessage.setProperty("message-id", database.allocateId(newMessage));
        newMessage.setProperty("chatroom-id", chatroomID);
        newMessage.setProperty("text", request.getParameter("text"));
        newMessage.setProperty("sender-id", userID);
        newMessage.setProperty("recipient-id", request.getParameter("recipient-id"));
        newMessage.setProperty("timestamp", System.currentTimeMillis());

        database.put(newMessage);
    }

    private String convertToJsonUsingGson(Object list) {
        Gson gson = new Gson();
        String json = gson.toJson(list);
        return json;
    }
}