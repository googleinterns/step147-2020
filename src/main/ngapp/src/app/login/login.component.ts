import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
 
@Component({
 selector: 'app-login',
 templateUrl: './login.component.html',
 styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
 loginAwait = false;
 error: any;
 errorPresent = false;
 loginSuccessful?: boolean;

 constructor(public authService: AuthService, private router: Router) {}
 
 ngOnInit(): void {}
 
 login(email: string, password: string): void {
   this.loginAwait = true;
   this.authService
     .login(email, password)
     .then((res: any) => {
       this.loginAwait = false;
       this.router.navigate(['/chat']);
     })
     .catch((error: any) => {
       this.loginAwait = false;
       this.errorPresent = true;
       this.loginSuccessful = true;
       this.error = error.message;
     });
 }
 
 onClose() {
   this.errorPresent = false;
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

 sendPasswordResetEmail(email: string) {
    if(email === "") {
      window.alert('Please enter your email address first');
    } else {
      this.authService.sendResetPasswordEmail(email);
    }
 }
}
