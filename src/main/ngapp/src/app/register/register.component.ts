import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  authError: any;

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.authService.eventAuthError$.subscribe( data => {
      this.authError = data;
    })
  }

  createUser(frm): void {
    this.authService.register(frm.value);
  }

}