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

import javax.servlet.ServletInputStream;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import com.google.sps.servlets.User;

/** Servlet that holds the users on this WebApp */
@WebServlet("/user")

public class UserServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userID = request.getParameter("userId");
        Query query = new Query("user");
        PreparedQuery results = DatastoreServiceFactory.getDatastoreService().prepare(query);

        ArrayList<User> users = new ArrayList<User>();

        for (Entity user : results.asIterable()) {
            String currUserId = (String) user.getProperty("userId");
            if (currUserId.equals(userID)){
                String userId = (String) user.getProperty("userId");
                String name = (String) user.getProperty("name");
                String email = (String) user.getProperty("email");
                String language = (String) user.getProperty("language");

                User userInstance = new User(userId, name, email, language);
                users.add(userInstance);
            }
        }

        Gson gson = new Gson();

        response.setContentType("application/json");
        response.getWriter().println(gson.toJson(users));
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String jsonString = IOUtils.toString((request.getInputStream()));
        User userInput = new Gson().fromJson(jsonString, User.class);
        
        Entity newUser = new Entity("user");
        newUser.setProperty("userId", userInput.userId);
        newUser.setProperty("name", userInput.name);
        newUser.setProperty("email", userInput.email);
        newUser.setProperty("language", userInput.language);

        //System.out.println(IOUtils.toString(request.getInputStream()));
        database.put(newUser);
    }
}