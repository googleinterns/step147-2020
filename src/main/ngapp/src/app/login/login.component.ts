import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';


import * as firebase from 'firebase/app';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginAwait = false;
  error: any;
  errorPresent: boolean = false;
  constructor(public authService: AuthService, private router: Router, public http: HttpClient) {}

  ngOnInit(): void {}

  login(email: string, password: string): void {
    this.loginAwait = true;
    this.authService
      .login(email, password)
      .then((res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));

        // Callin firebase.auth() to get idToken that will be sent to the filter in the backend
        // for authentication using FirebaseApp SDK.
        // The idToken is stored in localStorage.
        firebase.auth().currentUser.getIdToken()
            .then((idToken) => {
            localStorage.setItem('idToken', idToken);
            console.log('idToken in login', localStorage.idToken);
        });


        this.loginAwait = false;
        this.router.navigate(['/chat']);
    }).then (() => {

        //CALL TO VERIFYIDTOKEN IS HERE.
        this.verifyIdToken();
    }) 
    .catch((error: any) => {
        this.loginAwait = false;
        this.errorPresent = true;
        this.error = error.message;
      });
  }

  onClose() {
    this.errorPresent = false;
  }

  sendPasswordResetEmail(email: string) {
    this.authService.sendPasswordResetEmail(email);
  }

  routerSplit(res: any) {
    if (res.additionalUserInfo.isNewUser) {
      this.router.navigate(['/select-language']);
    } else {
      this.router.navigate(['/chat']);
    }
  }

  loginWithGoogle() {
    this.authService
      .googleAuth()
      .then((res) => {
        this.routerSplit(res);
      })
      .catch((error: any) => {
        this.errorPresent = true;
        this.error = error.message;
      });
  }

  loginWithFacebook() {
    this.authService
      .facebookAuth()
      .then((res) => {
        this.routerSplit(res);
      })
      .catch((error: any) => {
        this.errorPresent = true;
        this.error = error.message;
      });
  }

  // Sends idToken to Firebase in the backend.
  verifyIdToken() {
    // Get idToken from firebase.
    firebase.auth().currentUser.getIdToken()
    .then((idToken) => {
        console.log("this is the login currentuser idToken", idToken);
        var token = JSON.stringify(idToken);

        // Add the idToken as a custom header.
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'X-token': idToken
            }),
        };
        console.log('httpOptions: ', httpOptions);
       
        // Send token to your backend via HTTPS.
        const tokenRes = this.http.get("/idTokenVerification", httpOptions).toPromise()
        .then((result) => {
            console.log('this is result from backend', JSON.stringify(result));
        });
    })
    .catch( (error) => {
        console.log("this is an error from idToken: ",error.message);
    })
    
  }

}
