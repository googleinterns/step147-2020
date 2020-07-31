import { Injectable, EventEmitter } from '@angular/core';
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
  user: User;

  private eventAuthError = new BehaviorSubject<string>('');
  eventAuthError$ = this.eventAuthError.asObservable();
  userSample: LocalUser;
  private userDataSource = new BehaviorSubject<LocalUser>(this.userSample);
  $userSource = this.userDataSource.asObservable();
  newUser: any;
  userInstance2: LocalUser;

  // Subscribe to changes in a person's authentication state. If that authentication state changes,
  // reflect that change in local storage.
  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.setItem('user', null);
      }
    });
  }

  // Login function.
  login(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password).then(res =>{
        localStorage.setItem('user', JSON.stringify(res.user));
        firebase.auth().currentUser.getIdToken().then((idToken) => {
            localStorage.setItem('idToken', idToken);
        });
        return res;
    });
  }

  // Registration function.
  register(user: any): Promise<any> {
    return this.afAuth
      .createUserWithEmailAndPassword(user.email, user.password)
      .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.user));

        firebase.auth().currentUser.getIdToken().then((idToken) => {
            localStorage.setItem('idToken', idToken);
        });

        return res;
      });
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
        localStorage.removeItem('idToken');
        this.router.navigate(['/']);
      })
      .catch((err: any) => console.error('Error with logging out user: ', err));
  }

  // Function to check if a user is logged in.
  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return user !== null;
  }

  // Login with Facebook.
  facebookAuth() {
    return this.authLogin(new auth.FacebookAuthProvider());
  }

  // Login with Google.
  googleAuth() {
    return this.authLogin(new auth.GoogleAuthProvider());
  }

  // AuthLogin for other various auth providers eg Facebook, Google.
  authLogin(provider) {
    provider.setCustomParameters({
      display: 'popup',
    });
    return this.afAuth.signInWithPopup(provider).then((result) => {
      localStorage.setItem('user', JSON.stringify(result.user));

      firebase.auth().currentUser.getIdToken().then((idToken) => {
        localStorage.setItem('idToken', idToken);
      });
      
      return result;
    });
  }
}
