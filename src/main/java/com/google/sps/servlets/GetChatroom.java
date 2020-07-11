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
@WebServlet("/getChatroom")
public class GetChatroom extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userID = request.getParameter("userId");
        String recipientID = request.getParameter("recipientId"); // the user whose chat was clicked
        String chatroomID = "null";

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Query chatroomQuery = new Query("chatroom");
        PreparedQuery chatrooms = datastore.prepare(chatroomQuery);

        ArrayList<Chatroom> chatroomsList = new ArrayList<Chatroom>();

        for (Entity chatroom : chatrooms.asIterable()) {
            String chatroomId = (String) chatroom.getProperty("chatroomId");
            String user1 = (String) chatroom.getProperty("user1");
            String user2 = (String) chatroom.getProperty("user2");

            Chatroom currChatRoom = new Chatroom(chatroomId, user1, user2);
            List<String> usersList = currChatRoom.getUsers();

            if ((usersList.contains(userID)) && (usersList.contains(recipientID))) {
                    chatroomsList.add(currChatRoom);
                    break;
            }
        }

        Gson gson = new Gson();
    
        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(chatroomsList));
    }
}