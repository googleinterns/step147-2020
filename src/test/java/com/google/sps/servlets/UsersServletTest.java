// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import java.io.IOException;
import java.time.Instant;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.List;
import java.io.PrintWriter;
import java.util.UUID;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.junit.Assert;
import org.junit.Before;
import org.junit.After;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mockito;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
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

@RunWith(JUnit4.class)
public class UsersServletTest {

    private Entity caller;
    private Entity user1;
    private Entity user2;

    private final LocalServiceTestHelper helper =
        new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

    @Before
    public void setUp() {
        helper.setUp();
        setUpTests();
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    /**
    * Tests how the servlet returns all of the users in the datastore.
    * Request should return all of the users in the datastore excluding
    * the user who is currently logged in.
    */
    @Test
    public void testDoGet() throws IOException, ServletException {

        // Add users to the database.
        DatastoreService localDatabase = DatastoreServiceFactory.getDatastoreService();
        
        localDatabase.put(caller);
        localDatabase.put(user1);
        localDatabase.put(user2);

        UsersServlet usersServlet = new UsersServlet();

        // Mock objects for the execution of the test.
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        PrintWriter printWriter = Mockito.mock(PrintWriter.class);

        Mockito.when(request.getHeader("userId")).thenReturn("11234567890");
        Mockito.when(response.getWriter()).thenReturn(printWriter);

        // Users which should be returned.
        ArrayList<User> users = new ArrayList<User>();
        User userObject1 = new User(user1);
        User userObject2 = new User(user2);
        users.add(userObject1);
        users.add(userObject2);

        Gson gson = new Gson();

        usersServlet.doGet(request, response);

        // Ensure that the request writes the correct users as a response
        // to return to frontend.
        Mockito.verify(printWriter).println(gson.toJson(users));
        Mockito.verify(response).setContentType("application.json");
    }

    public void setUpTests() {

        // "Caller" is the user who is currently logged in, so 
        // it should not be included in the list of users.
        caller = new Entity("user");
        caller.setProperty("userId", "11234567890");
        caller.setProperty("name", "caller");
        caller.setProperty("email", "caller@google.com");
        caller.setProperty("language", "english");

        user1 = new Entity("user");
        user1.setProperty("userId", "21234567890");
        user1.setProperty("name", "user1");
        user1.setProperty("email", "user1@google.com");
        user1.setProperty("language", "spanish");

        user2 = new Entity("user");
        user2.setProperty("userId", "31234567890");
        user2.setProperty("name", "user2");
        user2.setProperty("email", "user2@google.com");
        user2.setProperty("language", "chinese");
    }
}