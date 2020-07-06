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
import com.google.datastore.v1.PropertyFilter;
import com.google.sps.servlets.User;

FirebaseApp.initializeApp();
/** Servlet that holds the users on this WebApp */
@WebServlet("/users")
public class UsersServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userID;

        try {
            String authenticationToken = request.getHeader("auth-token");  
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(authenticationToken);
            userID = decodedToken.getUid();
        }catch (FirebaseAuthException e) {
            System.out.println("Failure");
            return;
        }
        
        Query query = new Query("user");
        PreparedQuery results = DatastoreServiceFactory.getDatastoreService().prepare(query);

        ArrayList<User> users = new ArrayList<User>();

        for (Entity user : results.asIterable()) {
           String userId = (String) user.getProperty("userId");
           String name = (String) user.getProperty("name");
           String email = (String) user.getProperty("email");
           String language = (String) user.getProperty("language");

           User userInstance = new User(userId, name, email, language);

           if(userInstance.userId != userID){
               users.add(userInstance);
           }

        }

        Gson gson = new Gson();

        response.setContentType("application.json");
        response.getWriter().println(gson.toJson(users));
}