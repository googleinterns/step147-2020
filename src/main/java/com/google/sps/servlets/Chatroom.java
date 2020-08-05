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

import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import java.util.ArrayList;
import java.util.List;

public class Chatroom {
    public String chatroomId;
    public List<String> users = new ArrayList<String>();

    public Chatroom(String newChatroomId, String user1, String user2) {
        chatroomId = newChatroomId;
        users.add(user1);
        users.add(user2);
    }

    public Chatroom(Entity entity) {
        chatroomId = (String) entity.getProperty("chatroomId");
        users.add((String) entity.getProperty("user1"));
        users.add((String) entity.getProperty("user2"));
    }

    public void setEntity() {
        Entity newChatroom = new Entity("chatroom");
        newChatroom.setProperty("chatroomId", this.chatroomId);
        newChatroom.setProperty("user1", this.users.get(0));
        newChatroom.setProperty("user2", this.users.get(1));

        DatastoreServiceFactory.getDatastoreService().put(newChatroom);
    }
}
