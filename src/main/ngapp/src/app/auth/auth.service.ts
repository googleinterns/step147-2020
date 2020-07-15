import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { ThrowStmt } from '@angular/compiler';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User as LocalUser } from '../models/user';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private eventAuthError = new BehaviorSubject<string>("");
  eventAuthError$ = this.eventAuthError.asObservable();
  newUser: any;
  user: User;

  // Subscribe to changes in a person's authentication state. If that authentication state changes, 
  // reflect that change in local storage.
  constructor(public afAuth: AngularFireAuth, private router: Router, private http: HttpClient) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  // Login function.
  login(email: string, password: string): void {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/chat']);
      })
      .catch((err: any) => {
        console.error('Something is wrong:', err.message);
      });
  }

  // Registration function.
  register(user: any) {
    this.afAuth
    .createUserWithEmailAndPassword(user.email, user.password)
    .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        
        const userInstance : LocalUser = {
                userId : res.user.uid,
                name : user.firstName + " " + user.lastName,
                email: user.email,
                language: user.language
        };

        const promise = this.http.post<LocalUser>("/user", userInstance).toPromise();
        promise.then(response => {
            this.router.navigate(['/chat']);
        });
        
    })
    .catch((err: any) => console.error('Error with registering user:', err.message));
  }

  // Function for sending email verification.
  sendEmailVerification() {
    return this.afAuth.currentUser
      .then((user) => {
        return user.sendEmailVerification();
      })
      .then(() => {
        this.router.navigate(['/chat']);
      });
  }

  // Function for sending password reset email.
  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  // Logging out function.
  logout() {
    this.afAuth
      .signOut()
      .then((res) => {
        localStorage.removeItem('user');
        this.router.navigate(['/']);
      })
      .catch((err: any) => console.error("Error with logging out user: ",err));
  }

  // Function to check if a user is logged in.
  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }
}
