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
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;
import com.pusher.rest.Pusher;

import org.apache.commons.io.IOUtils;

import java.io.IOException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that holds the users on this WebApp */
@WebServlet("/user")
public class UserServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userID = request.getHeader("userId");
        if (userID == null) {
            response.sendError(500);
            return;
        }

        Query query = new Query("user");
        query.setFilter(new Query.FilterPredicate("userId", Query.FilterOperator.EQUAL, userID));

        Entity userEntity = database.prepare(query).asSingleEntity();
        User user = new User(userEntity);

        Gson gson = new Gson();
        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(user));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String userID = request.getHeader("userId");
        if (userID == null) {
            response.sendError(500);
            return;
        }

        String jsonString = IOUtils.toString((request.getInputStream()));
        User userInput = new Gson().fromJson(jsonString, User.class);
        userInput.setEntity();

        // Set pusher to update users.
        PusherAPI pusherStore = new PusherAPI();
        Pusher pusher =
                new Pusher(pusherStore.getID(), pusherStore.getKey(), pusherStore.getSecret());
        pusher.setCluster("us2");
        pusher.setEncrypted(true);

        Gson gson = new Gson();
        pusher.trigger("users", "new-user", gson.toJson(userInput));
    }

    @Override
    public void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userID = request.getHeader("userId");
        if (userID == null) {
            response.sendError(500);
            return;
        }

        String jsonString = IOUtils.toString((request.getInputStream()));
        User userInput = new Gson().fromJson(jsonString, User.class);
        userInput.setEntity();
    }
}
