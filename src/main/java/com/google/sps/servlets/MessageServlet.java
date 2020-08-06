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
import com.pusher.rest.Pusher;
import java.io.IOException;
import java.util.ArrayList;
import java.util.UUID;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import java.util.Arrays;
import org.apache.commons.io.IOUtils;

/** Servlet that holds the messages that a user has */
@WebServlet("/messages")
public class MessageServlet extends HttpServlet {
    // HttpRequest that returns the messages that a user has either sent, or received. Messaged
    // include the original and translated messages.
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userID = request.getHeader("userId");
        if (userID == null) {
            response.sendError(500);
            return;
        }
        // Goes through messages and grabs the messages with chatroomID = to the chatroomID passed
        // in
        // then sorts them by timestamp.
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Query chatroomQuery = new Query("message").addSort("timestamp", SortDirection.ASCENDING);
        chatroomQuery.setFilter(
                new CompositeFilter(
                        CompositeFilterOperator.OR,
                        Arrays.asList(
                                new FilterPredicate("senderId", FilterOperator.EQUAL, userID),
                                new FilterPredicate("recipientId", FilterOperator.EQUAL, userID))));
        PreparedQuery messages =
                DatastoreServiceFactory.getDatastoreService().prepare(chatroomQuery);

        ArrayList<Message> messagesInChatroom = new ArrayList<Message>();

        for (Entity message: messages.asIterable()) {
            Message userMessage = new Message(message);
            messagesInChatroom.add(userMessage);
        }
        Gson gson = new Gson();
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(messagesInChatroom));
    }
    // Servlet creates a new chatroom if none is present. It also creates a new message entity and
    // stores it in the database.
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String userID = request.getHeader("userId");
        if (userID == null) {
            response.sendError(500);
            return;
        }

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        String jsonString =