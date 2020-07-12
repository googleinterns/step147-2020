import { Injectable } from '@angular/core';
import { Message } from './models/message';
import { Chatroom } from './models/chatroom';
import { User } from './models/user';
import { Post } from './models/post';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
 
@Injectable({
  providedIn: 'root',
})
export class ChatDataService {
 
  constructor(private authService: AuthService, private http: HttpClient ) {
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
 
  addMessage(input: Post): void {
    this.http.post("/chatroom", JSON.stringify(input));
  }
 
  logout(){
    this.authService.logout();
  }
}