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

package codeu.controller;

import java.io.IOException;
import java.time.Instant;
import com.google.gson.Gson;
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
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;

public class UsersServletTest {

    private User mockUser;
    private UsersServlet mockServlet;
    private HttpServletRequest mockRequest;
    private HttpServletResponse mockResponse;

    // Maximum eventual consistency.
        private final LocalServiceTestHelper helper =
        new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig()
            .setDefaultHighRepJobPolicyUnappliedJobPercentage(100));

    @Before
    public void setUp() {
        helper.setUp();

        Entity caller = new Entity("user");
        caller.setProperty("userId", "11234567890");
        caller.setProperty("name", "caller");
        caller.setProperty("email", "caller@google.com");
        caller.setProperty("language", "english");

        Entity user1 = new Entity("user");
        user1.setProperty("userId", "21234567890");
        user1.setProperty("name", "user1");
        user1.setProperty("email", "user1@google.com");
        user1.setProperty("language", "spanish");

        Entity user2 = new Entity("user");
        user2.setProperty("userId", "31234567890");
        user2.setProperty("name", "user2");
        user2.setProperty("email", "user2@google.com");
        user2.setProperty("language", "chinese");
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    @Test
    public void testDoGet() throws IOException, ServletException {

        //add random things to database
        DatastoreService localDatabase = DatastoreServiceFactory.getDatastoreService();
        
        localDatabase.put(caller);
        localDatabase.put(user1);
        localDatabase.put(user2);

        UsersServlet usersServlet = new UsersServlet();

        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletRequest response = Mockito.mock(HttpServletResponse.class);

        Mockito.when(request.getParameter("userId").thenReturn("11234567890"));

        ArrayList<User> users = new ArrayList<User>();

        User userObject1 = new User(user1.getProperty("userId"), user1.getProperty("name"), user1.getProperty("email"), user1.getProperty("language"));
        User userObject2 = new User(user2.getProperty("userId"), user2.getProperty("name"), user2.getProperty("email"), user2.getProperty("language"));

        users.addAll(userObject1, userObject2);

        Gson gson = new Gson();

        usersServlet.doGet(request, response);

        Mockito.verify(response).getWriter().println(gson.toJson(users));
        Mockito.verify(response).setContentType("application.json")
    }
}