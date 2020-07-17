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

  constructor(private authService: AuthService, private http: HttpClient ) {} 

  // Get the object associated with the currrent user. 
  getUser(): Observable<User[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
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
  getMessages(id: string): Observable<Message[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    const url: string = "/messages?chatroomId=" + id;
    return this.http.get<Message[]>(url);
  }

  // Get a chatroom for a recepient;
  getChatroom(recipient: string): Observable<Chatroom[]> {
    var localUser = JSON.parse(localStorage.getItem("user"));
    const url: string = "/getChatroom?userId=" + localUser.uid + "&recipientId=" + recipient;
    return this.http.get<Chatroom[]>(url);
  }

  // Get all chatrooms.
  getChatrooms(): Observable<Chatroom[]> {
      var localUser = JSON.parse(localStorage.getItem("user"));
      const url: string = "/chatrooms?userId=" + localUser.uid;
        return this.http.get<Chatroom[]>(url);
  }
 
  // Add message in a new chatroom.
  addMessage(input: Post){
    const promise = this.http.post<Post>("/messages", input).toPromise();
    promise.catch(err => console.error("Error sending new message: ", err));

  }
 
  // Logout of the service.
  logout(){
    this.authService.logout();
  }
}