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
import java.io.BufferedReader;
import java.io.StringReader;
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
import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import static org.junit.Assert.assertEquals;
import java.io.IOException;
import java.time.Instant;
import org.junit.After;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import java.io.Reader;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;

public class UserServletTest {

    private Entity user1;
    private Entity user2;
    private Entity user3;

    private final LocalServiceTestHelper helper =
        new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

    @Before
    public void setUp() {
        helper.setUp();
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    @Test
    public void testDoGet() throws IOException, ServletException {

        DatastoreService localDatabase = DatastoreServiceFactory.getDatastoreService();

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

        localDatabase.put(caller);
        localDatabase.put(user1);
        localDatabase.put(user2);

        UserServlet userServlet = new UserServlet();
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        PrintWriter printWriter = Mockito.mock(PrintWriter.class);

        Mockito.when(request.getParameter("userId").thenReturn((String) caller.getProperty("userId")));
        Mockito.when(response.getWriter()).thenReturn(printWriter);

        userServlet.doGet(request, response);

        ArrayList<User> users = new ArrayList<User>();

        User user = new User((String) caller.getProperty("userId"),
        (String) caller.getProperty("name"),
        (String) caller.getProperty("email"),
        (String) caller.getProperty("language"));

        users.add(user);
        Mockito.verify(response).setContentType("application/json");
        Mockito.verify(printWriter).println(gson.toJson(users));
    }

    @Test
    public void testDoPost() throws IOException, ServletException {

        DatastoreService localDatabase = DatastoreServiceFactory.getDatastoreService();

        UserServlet userServlet = new UserServlet();
        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);

        userServlet.doPost(request, response);

        Entity userAdded = new Entity("user");
        userAdded.setProperty("userId", "41234567890");
        userAdded.setProperty("name", "new user");
        userAdded.setProperty("email", "newuser@penpal.app");
        userAdded.setProperty("language", "en");

        //String input = "{'userId' : '41234567890', 'name' : 'new user', 'email' : 'newuser@penpal.app', 'language' : 'en'}";
        String input = "{'userId' : '41234567890'}";
        Reader inputString = new StringReader(input);
        BufferedReader reader = new BufferedReader(inputString);
        Mockito.when(request.getReader()).thenReturn(reader);

        assertEquals(localDatabase.prepare(new Query("user")).countEntities(withLimit(10)), 1);
    }

    // @Test
    // public void test() throws IOException, ServletException {
    //     String input = "{'userId' : '41234567890'}";
    //     Reader inputString = new StringReader(input);

    //     BufferedReader reader = new BufferedReader(inputString);

    //     User userInput = new Gson().fromJson(reader, User.class);
    //     System.out.println(userInput);
    //     System.out.println("hello");
    //     // Mockito.when(request.getReader()).thenReturn(reader);

    //     // DatastoreService localDatabase = DatastoreServiceFactory.getDatastoreService();

    //     // UserServlet userServlet = new UserServlet();
    //     // HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
    //     // HttpServletResponse response = Mockito.mock(HttpServletResponse.class);

    //     // userServlet.doPost(request, response);

    // }
}