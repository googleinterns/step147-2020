import { Injectable } from '@angular/core';
import { Message } from './models/message';
import { Chatroom } from './models/chatroom';
import { User } from './models/user';
import { Post } from './models/post';
import { Observable } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from './../environments/environment';
import * as firebase from 'firebase/app';


@Injectable({
  providedIn: 'root',
})
export class ChatDataService {
  // Creating custom header that will be added to all http requests.
  httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-token': localStorage.idToken
    }),
  };

  constructor(private authService: AuthService, private http: HttpClient) {}

  // Get the object associated with the currrent user.
  getUser(): Observable<User[]> {
    const localUser = JSON.parse(localStorage.getItem('user'));

    // Adding httpOptions to the url.
    return this.http.get<User[]>('/user?userId=' + localUser.uid, this.httpOptions);
  }

  // Create a new user object for the user.
  addUser(user: User): Observable<any> {
    return this.http.post<User>('/user', user, this.httpOptions);
  }

  updateLanguage(user: User): Observable<any> {
    return this.http.put<User>('/user', user, this.httpOptions);
  }

  // Get a list of all the users in our service.
  getUsers(): Observable<User[]> {
    const localUser = JSON.parse(localStorage.getItem('user'));

    // Adding httpOptions to the url.
    return this.http.get<User[]>('/users?userId=' + localUser.uid, this.httpOptions);
  }

  // Get messages between two users.
  getMessages(): Observable<Message[]> {
    const localUser = JSON.parse(localStorage.getItem('user'));
    const url: string = '/messages?userId=' + localUser.uid;
    return this.http.get<Message[]>(url);
  }

  // Get a chatroom for a recepient.
  getChatroom(recipient: string): Observable<Chatroom[]> {
    const localUser = JSON.parse(localStorage.getItem('user'));

    // Adding httpOptions to the url.
    const url: string =
      '/getChatroom?userId=' + localUser.uid + '&recipientId=' + recipient;
    return this.http.get<Chatroom[]>(url, this.httpOptions);
  }

  // Get all chatrooms.
  getChatrooms(): Observable<Chatroom[]> {
    const localUser = JSON.parse(localStorage.getItem('user'));

    // Adding httpOptions to the url.
    const url: string = '/chatrooms?userId=' + localUser.uid;
    return this.http.get<Chatroom[]>(url, this.httpOptions);
  }

  // Add message in a new chatroom.
  addMessage(input: Post) {

    const promise = this.http.post<Post>('/messages', input, this.httpOptions).toPromise();
    promise.catch((err) => console.error('Error sending new message: ', err));
  }

  // Logout of the service.
  logout() {
    this.authService.logout();
  }
}
