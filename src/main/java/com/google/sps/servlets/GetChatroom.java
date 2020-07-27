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
@WebServlet("/getChatroom")
public class GetChatroom extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userID = request.getParameter("userId");
        String recipientID = request.getParameter("recipientId"); // the user whose chat was clicked
        
        if (userID == null || recipientID == null) {
            response.sendError(500);
        } else {
            String chatroomID = "null";

            DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

            Query chatroomQuery = new Query("chatroom");
            chatroomQuery.setFilter(new CompositeFilter(CompositeFilterOperator.AND, Arrays.asList(
                    new CompositeFilter(CompositeFilterOperator.OR, Arrays.asList(new FilterPredicate("user1", FilterOperator.EQUAL, userID), new FilterPredicate("user1", FilterOperator.EQUAL, recipientID))),
                    new CompositeFilter(CompositeFilterOperator.OR, Arrays.asList(new FilterPredicate("user2", FilterOperator.EQUAL, userID), new FilterPredicate("user2", FilterOperator.EQUAL, recipientID)))
                )));

            
            Entity chatroom = datastore.prepare(chatroomQuery).asSingleEntity();

            List<Chatroom> returnChatroom = new ArrayList<Chatroom>();

            if(chatroom == null){
                Entity newChatroom = new Entity("chatroom");
                chatroomID = UUID.randomUUID().toString();
                newChatroom.setProperty("chatroomId", chatroomID);
                newChatroom.setProperty("user1", userID);
                newChatroom.setProperty("user2", recipientID);
                datastore.put(newChatroom);
                returnChatroom.add(new Chatroom(newChatroom));
            }else {
                returnChatroom.add(new Chatroom(chatroom));
            }

            Gson gson = new Gson();
            response.setContentType("application/json");
            response.getWriter().println(gson.toJson(returnChatroom));
        }
    }
}