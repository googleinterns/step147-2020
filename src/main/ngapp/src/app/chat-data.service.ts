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

  requestChannel: string = "";

  constructor(private authService: AuthService, private http: HttpClient ) {
    this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        encrypted: true
    });
  }

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

  getUsers(): Observable<User[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    return this.http.get<User[]>("/users?userId="+localUser.uid);
  }

  getMessages(recipient: string): Observable<Message[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    let url: string = "/chatroom?userId=" + localUser.uid + "&recipientId=" + recipient;
    return this.http.get<Message[]>(url);
  }

  getChatroom(recipient: string): string {
    let chat: string = "";
    var localUser = JSON.parse(localStorage.getItem("user"));
    let url: string = "/getChatroom?userId=" + localUser.uid + "&recipientId=" + recipient;
    
    const promise = this.http.get<Chatroom>(url).toPromise();
    promise.then(res => {
        console.log("Chatroom Id: ", res[0].chatroomId);
        this.requestChannel = res[0].chatroomId;
        chat = this.requestChannel;
        this.channel = this.pusher.subscribe(this.requestChannel);
    }).catch(err => console.error(err));

    return chat;
  }
 
  addMessage(input: Post){
    console.log("about to send post", input);
    const promise = this.http.post<Post>("/chatroom", input).toPromise();
    promise.then(res => console.log("Res: ", res)).catch(err => console.error(err));
  }
 
  logout(){
    this.authService.logout();
  }
}