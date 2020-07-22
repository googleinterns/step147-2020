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
  errorPresent: boolean = false;
  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  login(email: string, password: string): void {
    this.loginAwait = true;
    this.authService.login(email, password).then((res: any) => {
        localStorage.setItem('user', JSON.stringify(res.user));
        this.loginAwait = false;
        this.router.navigate(['/chat']);
    })
    .catch((error: any) => {
        this.loginAwait = false;
        this.errorPresent = true;
        this.error = error.message;
    });
  }

  onClose(){
      this.errorPresent = false;
  }

  sendPasswordResetEmail(email: string) {
    this.authService.sendPasswordResetEmail(email);
  }

  loginWithGoogle(){
      this.authService.googleAuth().catch((error: any) => {
        this.errorPresent = true;
        this.error = error.message;
    });
  }

  loginWithFacebook(){
      this.authService.googleAuth().catch((error: any) => {
        this.errorPresent = true;
        this.error = error.message;
    });
  }

}
