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

  private eventAuthError = new BehaviorSubject<string>("");
  eventAuthError$ = this.eventAuthError.asObservable();
  userSample: LocalUser;
  private userDataSource = new BehaviorSubject<LocalUser>(this.userSample);
  $userSource = this.userDataSource.asObservable();
  newUser: any;
  userInstance2: LocalUser;

  constructor(public afAuth: AngularFireAuth, private router: Router, private http: HttpClient) {
    // this.afAuth.authState.subscribe((user) => {
    //   if (user) {
    //     this.user = user;
    //     localStorage.setItem('user', JSON.stringify(this.user));
    //   } else {
    //     localStorage.setItem('user', null);
    //   }
    // });
  }

  // Login function.
  login(email: string, password: string): void {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((res: any) => {
        console.log("Logging in", res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/chat']);
      })
      .catch((error: any) => {
        console.log('Something is wrong:', error.message);
        window.alert(error.message);
      });
  }

  // Registration function.
  register(user) {
    var uid : string;
    this.afAuth
      .createUserWithEmailAndPassword(user.email, user.password)
      .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        console.log('You are Successfully registered!', res.user);
        const userInstance : LocalUser = {
                userId : res.user.uid,
                name : user.firstName + " " + user.lastName,
                email: user.email,
                language: user.language
        };
        const promise = this.http.post<LocalUser>("/user", userInstance).toPromise();
        promise.then(response => {
            console.log("User post request: ", response);
            this.router.navigate(['/chat']);
        });
        
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
        this.router.navigate(['/']);
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

  // Login with Facebook.
  twitterAuth() {
    return this.authLogin(new auth.TwitterAuthProvider());
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
        'display': 'popup'
    });
    return this.afAuth.signInWithPopup(provider)
    .then((result) => {
      
      // Set user data if it is the first time the user is loggin in.
      if(result.additionalUserInfo.isNewUser) {
        this.userInstance2 = {
          userId : result.user.uid,
          name : "",
          email: result.user.email,
          language: ""
        };
        this.userDataSource.next(this.userInstance2);
        console.log('userDataSource',this.$userSource);
        this.router.navigate(['/select-language'])
      }
      // If not first time logging in, route to chat page.
      else {
        this.router.navigate(['/chat']);
      }

    }).catch((error) => {
      window.alert(error)
    })
  }
}