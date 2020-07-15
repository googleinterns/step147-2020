declare const Pusher: any;

import { Injectable } from '@angular/core';
import { Message } from './models/message';
import { Chatroom } from './models/chatroom';
import { User } from './models/user';
import { Post } from './models/post';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from './../environments/environment';
 
@Injectable({
  providedIn: 'root',
})
export class ChatDataService {
  pusher: any;
  channel: any;

  constructor(private authService: AuthService, private http: HttpClient ) {} 

  // Get the object associated with the currrent user.
  getUser(): Observable<User[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    console.log("UserId: ", localUser.uid);
    console.log("Found local user in storage: ", localUser.uid);
    return this.http.get<User[]>("/user?userId="+localUser.uid);
  }

  // Create a new user object for the user.
  addUser(user: User): void{
    this.http.post("/user", user);
  }

  // Get a list of all the users in our service.
  getUsers(): Observable<User[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    return this.http.get<User[]>("/users?userId="+localUser.uid);
  }

  // Get messages between two users.
  getMessages(recipient: string): Observable<Message[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    const url: string = "/chatroom?userId=" + localUser.uid + "&recipientId=" + recipient;
    return this.http.get<Message[]>(url);
  }

  // Get a chatroom for a recepient;
  getChatroom(recipient: string): string {
    let chat: string = "";
    var localUser = JSON.parse(localStorage.getItem("user"));
    const url: string = "/getChatroom?userId=" + localUser.uid + "&recipientId=" + recipient;
    
    const promise = this.http.get<Chatroom>(url).toPromise();
    promise.then(res => {
        console.log("Chatroom Id: ", res[0].chatroomId);
        chat = res[0].chatroomId;
        this.setPusher(chat);
        return chat;
    }).catch(err => console.error(err));

    return chat;
  }

  // Set pusher to new channel.
  setPusher(chatroom: string){
    this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        encrypted: true
    });
    this.channel = this.pusher.subscribe(chatroom);
  }
 
  // Add message in a new chatroom.
  addMessage(input: Post){
    const promise = this.http.post<Post>("/chatroom", input).toPromise();
    promise.catch(err => console.error("Error sending new message: ", err));

  }
 
  // Logout of the service.
  logout(){
    this.authService.logout();
  }
}