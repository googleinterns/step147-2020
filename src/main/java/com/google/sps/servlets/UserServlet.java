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
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterators;
import com.google.datastore.v1.TransactionOptions;
import com.google.datastore.v1.TransactionOptions.ReadOnly;
import com.google.cloud.datastore.Cursor;
import com.google.cloud.datastore.Datastore;
import com.google.cloud.datastore.DatastoreException;
import com.google.cloud.datastore.EntityQuery;
import com.google.cloud.datastore.FullEntity;
import com.google.cloud.datastore.IncompleteKey;
//import com.google.cloud.datastore.Key;
//import com.google.cloud.datastore.KeyFactory;
import com.google.cloud.datastore.ListValue;
import com.google.cloud.datastore.PathElement;
import com.google.cloud.datastore.ProjectionEntity;
import com.google.cloud.datastore.QueryResults;
import com.google.cloud.datastore.ReadOption;
import com.google.cloud.datastore.StringValue;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.OrderBy;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
import com.google.cloud.datastore.Transaction;
import com.google.cloud.datastore.testing.LocalDatastoreHelper;
import com.google.cloud.datastore.StructuredQuery;
import com.google.cloud.datastore.StructuredQuery.CompositeFilter;
import com.google.cloud.datastore.StructuredQuery.OrderBy;
import com.google.cloud.datastore.StructuredQuery.PropertyFilter;
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
import com.google.datastore.v1.Query.Builder;
import com.google.sps.servlets.User;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.EntityNotFoundException;

/** Servlet that holds the users on this WebApp */
@WebServlet("/user")

public class UserServlet extends HttpServlet {

    private DatastoreService database = DatastoreServiceFactory.getDatastoreService();

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String userID = request.getHeader("userId");

        if (userID == null) {
            response.sendError(500);
        } else {
            Query query = new Query("user");
            query.setFilter(new Query.FilterPredicate("userId", Query.FilterOperator.EQUAL, userID));

            Entity userEntity = database.prepare(query).asSingleEntity();
            
            User user = new User(userEntity);
            PreparedQuery results = DatastoreServiceFactory.getDatastoreService().prepare(query);


            Gson gson = new Gson();

            response.setContentType("application/json");
            response.getWriter().println(gson.toJson(user));
        }
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String jsonString = IOUtils.toString((request.getInputStream()));
        User userInput = new Gson().fromJson(jsonString, User.class);

        String userID = userInput.userId;
        
        // Entity with a userID as identifier.
        Entity newUser = new Entity("user", userID);
        newUser.setProperty("userId", userInput.userId);
        newUser.setProperty("name", userInput.name);
        newUser.setProperty("email", userInput.email);
        newUser.setProperty("language", userInput.language);
        database.put(newUser);
    }

    @Override
    public void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException, EntityNotFoundException {
         String jsonString = IOUtils.toString((request.getInputStream()));
         User userInput = new Gson().fromJson(jsonString, User.class);
         String userID = userInput.userId;

        // Update user using userId as entity identifier.
        Entity userToUpdate = new Entity("user", userID);
        userToUpdate.setProperty("userId", userInput.userId);
        userToUpdate.setProperty("name", userInput.name);
        userToUpdate.setProperty("email", userInput.email);
        userToUpdate.setProperty("language", userInput.language);

        database.put(userToUpdate);
    }

}