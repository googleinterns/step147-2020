package com.google.sps.servlets;
 
public class PusherAPI {
   String pusher_id;
   String pusher_key;
   String pusher_secret;

   public PusherAPI(){
       this.pusher_id = "1036570";
       this.pusher_key = "fb37d27cdd9c1d5efb8d";
       this.pusher_secret = "9698b690db9bed0b0ef7";
   }
   public String getID(){
       return this.pusher_id;
   }
 
   public String getKey(){
       return this.pusher_key;
   }
 
   public String getSecret(){
       return this.pusher_secret;
   }
}

