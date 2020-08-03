import { Injectable } from '@angular/core';
import { Message } from './models/message';
import { Chatroom } from './models/chatroom';
import { User } from './models/user';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
 
@Injectable({
 providedIn: 'root',
})
export class ChatDataService {
 constructor(private authService: AuthService, private http: HttpClient) {}
 
 getHeader(): HttpHeaders {
   return new HttpHeaders({
     'Content-Type': 'application/json',
     'X-token': localStorage.idToken,
   });
 }
 
 // Get the object associated with the current user.
 getUser(): Observable<User> {
   const localUser = JSON.parse(localStorage.getItem('user'));
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
 
   return this.http.get<User>('/user?userId=' + localUser.uid, httpOptions);
 }
 
 // Create a new user object for the user.
 addUser(user: User): Observable<any> {
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
 
   return this.http.post<User>('/user', user, httpOptions);
 }
 
 updateLanguage(user: User): Observable<any> {
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
 
   return this.http.put<User>('/user', user, httpOptions);
 }
 
 // Get a list of all the users in our service.
 getUsers(): Observable<User[]> {
   const localUser = JSON.parse(localStorage.getItem('user'));
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
   // Adding httpOptions to the url.
   return this.http.get<User[]>('/users?userId=' + localUser.uid, httpOptions);
 }
 
 // Get messages between two users.
 getMessages(): Observable<Message[]> {
   const localUser = JSON.parse(localStorage.getItem('user'));
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
 
   const url: string = '/messages?userId=' + localUser.uid;
   return this.http.get<Message[]>(url, httpOptions);
 }
 
 // Get all chatrooms.
 getChatrooms(): Observable<Chatroom[]> {
   const localUser = JSON.parse(localStorage.getItem('user'));
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
 
   const url: string = '/chatrooms?userId=' + localUser.uid;
   return this.http.get<Chatroom[]>(url, httpOptions);
 }
 
 // Add message in a new chatroom.
 addMessage(input: Message): Observable<any> {
   const httpHeaders = this.getHeader();
   const httpOptions = {
     headers: httpHeaders,
   };
 
   return this.http.post<Message>('/messages', input, httpOptions);
 }
 
 // Logout of the service.
 logout() {
   this.authService.logout();
 }
}
 

