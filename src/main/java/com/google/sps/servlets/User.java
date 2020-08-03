package com.google.sps.servlets;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.DatastoreService;
 
public class User {
   public String userId;
   public String name;
   public String email;
   public String language;
 
   public User(String userID, String name, String email, String language) {
       this.userId = userID;
       this.name = name;
       this.email = email;
       this.language = language;
   }
 
   public User(Entity entity) {
       this.userId = (String) entity.getProperty("userId");
       this.name = (String) entity.getProperty("name");
       this.email = (String) entity.getProperty("email");
       this.language = (String) entity.getProperty("language");
   }
 
   public setEntity(){
       Entity newUser = new Entity("user", this.userId);
       newUser.setProperty("userId", this.userId);
       newUser.setProperty("name", this.name);
       newUser.setProperty("email", this.email);
       newUser.setProperty("language", this.language);
      
       DatastoreServiceFactory.getDatastoreService().put(newUser);
   }
}

