import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
//import * as auth0 from 'auth0-js';

import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  authError: any;


  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.eventAuthError$.subscribe( data => {
      this.authError = data;
    })
  }

  createUser(frm) {
    this.authService.createUser(frm.value);
  }

}