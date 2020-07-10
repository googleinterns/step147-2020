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
public class ChatroomServletTest {

    private Entity caller;
    private Entity user1;
    private Entity user2;
    private Entity message1;
    private Entity message2;
    private Entity message3;
    private Entity message4;
    private Entity chatroom1;
    private Entity chatroom2;

    private ArrayList<Entity> messages = new ArrayList<Entity>();

    private final LocalServiceTestHelper helper =
        new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());

    @Before
    public void setUp() {
        helper.setUp();

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

        chatroom1 = new Entity("chatroom");
        chatroom1.setProperty("chatroomId", "1");
        ArrayList<String> chatroom1users = new ArrayList<String>();
        chatroom1users.add((String) user1.getProperty("userId"));
        chatroom1users.add((String) user2.getProperty("userId"));
        chatroom1.setProperty("users", chatroom1users);

        chatroom2 = new Entity("chatroom");
        chatroom2.setProperty("chatroomId", "2");
        ArrayList<String> chatroom2users = new ArrayList<String>();
        chatroom2users.add((String) caller.getProperty("userId"));
        chatroom2users.add((String) user2.getProperty("userId"));
        chatroom2.setProperty("users", chatroom2users);

        message1 = new Entity("message");
        message1.setProperty("messageId", "1");
        message1.setProperty("chatroomId", "1");
        message1.setProperty("text", "Hi.");
        message1.setProperty("translatedText", "Hola.");
        message1.setProperty("senderId", (String) user1.getProperty("userId"));
        message1.setProperty("recipientId", (String) user2.getProperty("userId"));
        message1.setProperty("timestamp", System.currentTimeMillis());

        message2 = new Entity("message");
        message2.setProperty("messageId", "2");
        message2.setProperty("chatroomId", "1");
        message2.setProperty("text", "How are you?");
        message2.setProperty("translatedText", "Como estas?");
        message2.setProperty("senderId", (String) user2.getProperty("userId"));
        message2.setProperty("recipientId", (String) user1.getProperty("userId"));
        message2.setProperty("timestamp", System.currentTimeMillis());

        message3 = new Entity("message");
        message3.setProperty("messageId", "3");
        message3.setProperty("chatroomId", "1");
        message3.setProperty("text", "See you later!");
        message3.setProperty("translatedText", "Hasta luego!");
        message3.setProperty("senderId", (String) user1.getProperty("userId"));
        message3.setProperty("recipientId", (String) user2.getProperty("userId"));
        message3.setProperty("timestamp", System.currentTimeMillis());

        message4 = new Entity("message");
        message4.setProperty("messageId", "4");
        message4.setProperty("chatroomId", "2");
        message4.setProperty("text", "unrelated message");
        message4.setProperty("translatedText", "unrelated message, but in spanish");
        message4.setProperty("senderId", (String) caller.getProperty("userId"));
        message4.setProperty("recipientId", (String) user2.getProperty("userId"));
        message4.setProperty("timestamp", System.currentTimeMillis());

        messages.add(message1);
        messages.add(message2);
        messages.add(message3);
        messages.add(message4);
    }

    @After
    public void tearDown() {
        helper.tearDown();
    }

    //@Test
    public void testDoGet() throws IOException, ServletException {

        DatastoreService localDatabase = DatastoreServiceFactory.getDatastoreService();
        
        localDatabase.put(caller);
        localDatabase.put(user1);
        localDatabase.put(user2);

        localDatabase.put(chatroom1);
        localDatabase.put(chatroom2);

        for (Entity message: messages) {
            localDatabase.put(message);
        }
        
        ChatroomServlet chatroomServlet = new ChatroomServlet();

        HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
        HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
        PrintWriter printWriter = Mockito.mock(PrintWriter.class);

        Mockito.when(request.getParameter("userId")).thenReturn((String) user1.getProperty("userId"));
        Mockito.when(request.getParameter("recipientId")).thenReturn((String) user2.getProperty("userId"));
        
        Mockito.when(response.getWriter()).thenReturn(printWriter);

        Gson gson = new Gson();

        chatroomServlet.doGet(request, response);

        ArrayList<Message> messagesInChatroom = new ArrayList<Message>();
        messagesInChatroom.add(new Message((String) message1.getProperty("messageId"),
        (String) message1.getProperty("chatroomId"),
        (String) message1.getProperty("text"), 
        (String) message1.getProperty("translatedText"), 
        (String) message1.getProperty("senderId"), 
        (String) message1.getProperty("recipientId"), 
        (Long) message1.getProperty("timestamp")));

        messagesInChatroom.add(new Message((String) message2.getProperty("messageId"),
        (String) message2.getProperty("chatroomId"),
        (String) message2.getProperty("text"), 
        (String) message2.getProperty("translatedText"), 
        (String) message2.getProperty("senderId"), 
        (String) message2.getProperty("recipientId"), 
        (Long) message2.getProperty("timestamp")));
        
        messagesInChatroom.add(new Message((String) message3.getProperty("messageId"),
        (String) message3.getProperty("chatroomId"),
        (String) message3.getProperty("text"), 
        (String) message3.getProperty("translatedText"), 
        (String) message3.getProperty("senderId"), 
        (String) message3.getProperty("recipientId"), 
        (Long) message3.getProperty("timestamp")));
        

        Mockito.verify(printWriter).println(gson.toJson(messagesInChatroom));
        Mockito.verify(response).setContentType("application.json");
    }

    @Test
    public void testDoGetEnsureSuccess() throws IOException, ServletException {
        
    }
}