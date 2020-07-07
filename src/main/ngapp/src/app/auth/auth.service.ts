import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { ThrowStmt } from '@angular/compiler';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private eventAuthError = new BehaviorSubject<string>("");
  eventAuthError$ = this.eventAuthError.asObservable();
  newUser: any;

  user: User;

  constructor(public afAuth: AngularFireAuth, public router: Router) {
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
        this.router.navigate(['/chat']);
      })
      .catch((error: any) => {
        console.log('Something is wrong:', error.message);
      });
  }

  // Registration function.
  register(user) {
    this.afAuth
      .createUserWithEmailAndPassword(user.email, user.password)
      .then((res) => {
        this.sendEmailVerification();
        console.log('You are Successfully registered!', res);
      })
      .catch((error: any) => console.log('Something is wrong:', error.message ));
  }

  // Function for sending email verification.
  sendEmailVerification() {
    return this.afAuth.currentUser
      .then((user) => {
        return user.sendEmailVerification();
        console.log('Password-reset email sent');
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
        console.log('successfully logged out');
      })
      .catch((err) => console.error(err));
  }

  // Function to check if a user is logged in.
  isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('checking if user is logged in');
    return user !== null;
  }
}
