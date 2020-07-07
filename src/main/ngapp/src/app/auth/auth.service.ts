import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';

import { AngularFireDatabase } from '@angular/fire/database';
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

  constructor(public afAuth: AngularFireAuth, public router: Router, public db: AngularFireDatabase) {
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
  register(email: string, password: string) {
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
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

 // Creates a new user (works like registration).
  async createUser(user) {
    console.log(user);
    // Does the registration of the new user.
    this.afAuth.createUserWithEmailAndPassword( user.email, user.password)
      .then( userCredential => {
        this.newUser = user;
        console.log(userCredential);
        userCredential.user.updateProfile( {
          displayName: user.firstName + ' ' + user.lastName
        });
        
        // Inserts user data in a reltime database.
        this.insertUserData(userCredential)
          .then(() => {
            console.log('User data inserted into databse');
            this.router.navigate(['/chat']);
          })
          .catch(error => {
              console.log('User data not inserted into database');
          });
      })
      .catch( error => {
        this.eventAuthError.next(error);
      });
    console.log('You are created successfully!');
  }

  // Interts user data into a firebase realtime database.
  insertUserData(userCredential: firebase.auth.UserCredential) {
    return this.db.object('/users/'+userCredential.user.uid).set({
      email: this.newUser.email,
      firstname: this.newUser.firstName,
      lastname: this.newUser.lastName,
      language: this.newUser.language
    });
  }
}
