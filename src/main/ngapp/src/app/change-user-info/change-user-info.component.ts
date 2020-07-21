import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User as LocalUser } from '../models/user';


@Component({
  selector: 'app-change-user-info',
  templateUrl: './change-user-info.component.html',
  styleUrls: ['./change-user-info.component.css']
})
export class ChangeUserInfoComponent implements OnInit {

  user: LocalUser;
  localUser: any;

  constructor(public authService: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {

    this.localUser = JSON.parse(localStorage.getItem("user"));
    console.log('this is the local in select-ang: ', this.localUser);
    console.log('this is the behavior subject user: ', this.user);

  }
  // PUTs the new User to database and navigates to the chat window.
  updateChangesToDb(frm): void {
    this.user = {
          userId : this.localUser.uid,
          name : frm.value.name,
          email: this.localUser.email,
          language: frm.value.language
    };
    console.log("this is the to-put user", this.user);
    
    // PUT request to database.
    const promise = this.http.put<LocalUser>("/user", this.user).toPromise();
    console.log("put successfully performed for", this.user);
    promise.then(response => {
      console.log("User post request: ", response);
      this.router.navigate(['/chat']);
    });
  }
}

