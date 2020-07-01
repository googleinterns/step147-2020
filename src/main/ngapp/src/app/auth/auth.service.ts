import { Injectable } from '@angular/core';

import { Router } from  "@angular/router";
import * as firebase from 'firebase/app';
import { auth } from  'firebase/app';
import { AngularFireAuth } from  "@angular/fire/auth";
import { User } from  'firebase';
import { Observable } from 'rxjs';

// import * as auth0 from 'auth0-js';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user:User;
  constructor(public afAuth: AngularFireAuth, public router: Router) {
    this.afAuth.authState.subscribe(user => {
    if (user){
        this.user = user;
        localStorage.setItem('user', JSON.stringify(this.user));
    } else {
        localStorage.setItem('user', null);
    }
    });

  }

//   Login function.
//   async login(email: string, password: string) {
//     var result = await this.afAuth.signInWithEmailAndPassword(email, password)
//     this.router.navigate(['admin/verify-email']);
//   }

  login(email: string, password: string) {
     this.afAuth
     .signInWithEmailAndPassword(email, password)
     .then(res => {
        console.log('You are Successfully logged in!', res);
        this.router.navigate(['register']);
     })
     .catch(error => {
        console.log('Something is wrong:', error.message);
     });
   }

   //   login(email: string, password: string) {
//     this.angularFireAuth
//       .signInWithEmailAndPassword(email, password)
//       .then(res => {
//         console.log('You are Successfully logged in!');
//         this.router.navigate(['admin/verify-email']);
//       })
//       .catch(err => {
//         console.log('Something is wrong:',err.message);
//       });
//   }

  // Registration function.
  async register(email: string, password: string) {
    var result = await this.afAuth.createUserWithEmailAndPassword(email, password)
    this.sendEmailVerification();
    console.log('You are Successfully registered!', result);

  }

  // Function for sending email verification.
  async sendEmailVerification() {
    return this.afAuth.currentUser.then((user) => {
      return user.sendEmailVerification();
      console.log('Password-reset email sent');
    }).then(() => {
      this.router.navigate(['register']);
    })
  }

  // Function for sending password reset email.
  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.sendPasswordResetEmail(passwordResetEmail);
  }

  // Logging out function.
  async logout(){
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    console.log('successfully logged out');
    this.router.navigate(['login']);
  }

  // Function to check if a user is logged in.
  get isLoggedIn(): boolean {
    const  user  =  JSON.parse(localStorage.getItem('user'));
    console.log('checking if user is logged in');
    return  user  !==  null;
  }

  // Login with Google.
  async  loginWithGoogle(){
    await  this.afAuth.signInWithPopup(new auth.GoogleAuthProvider())
    this.router.navigate(['admin/register']);
  }

  /*
 const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserData(credential.user);

  */

}













// import { Injectable } from '@angular/core';
// import { AngularFireAuth } from "@angular/fire/auth";
// import { Observable } from 'rxjs';
// import { User } from  'firebase';
// import { Router } from  "@angular/router";

// @Injectable({
//   providedIn: 'root'
// })

// export class AuthService {
//   userData: Observable<firebase.User>;

//   constructor(private angularFireAuth: AngularFireAuth, public router: Router) {
//     this.userData = angularFireAuth.authState;
//   }

//   /* Sign up */
//   register(email: string, password: string) {
//     this.angularFireAuth
//       .createUserWithEmailAndPassword(email, password)
//       .then(res => {
//         console.log('You are Successfully signed up!', res);
//       })
//       .catch(error => {
//         console.log('Something is wrong:', error.message);
//       });    
//   }

//   /* Sign in */
//   login(email: string, password: string) {
//     this.angularFireAuth
//       .signInWithEmailAndPassword(email, password)
//       .then(res => {
//         console.log('You are Successfully logged in!');
//         this.router.navigate(['admin/verify-email']);
//       })
//       .catch(err => {
//         console.log('Something is wrong:',err.message);
//       });
//   }

//   /* Sign out */
//   logout() {
//     this.angularFireAuth
//       .signOut();
//   }  

// }