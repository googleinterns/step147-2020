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
@WebServlet("/users")
public class UsersServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
        String userID = request.getHeader("userId");
        if (userID == null) {
            response.sendError(500);
        } else {
            Query query = new Query("user");
            PreparedQuery results = DatastoreServiceFactory.getDatastoreService().prepare(query);

            ArrayList<User> users = new ArrayList<User>();

            for (Entity user : results.asIterable()) {
                User userInstance = new User(user);
                if(!userInstance.userId.equals(userID)){
                    users.add(userInstance);
                }
            }

            Gson gson = new Gson();
            response.setContentType("application.json");
            response.getWriter().println(gson.toJson(users));
        }
    }
}