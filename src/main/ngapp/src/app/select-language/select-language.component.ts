import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User as LocalUser } from '../models/user';


@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
  styleUrls: ['./select-language.component.css']
})
export class SelectLanguageComponent implements OnInit {

  user: LocalUser;

  constructor(public authService: AuthService, private router: Router, private http: HttpClient) { }

  ngOnInit(): void {

    // Receives data from BehaviorSubject observable that shares data from authService.
    this.authService.$userSource.subscribe(user => this.user = user);

  }
  // POSTs the new User to database and navigates to the chat window.
  addToDb(frm): void {
    this.user.name = frm.value.name;
    this.user.language = frm.value.language;
    console.log(this.user);
    
    // POST to database.
    const promise = this.http.post<LocalUser>("/user", this.user).toPromise();
    promise.then(response => {
      console.log("User post request: ", response);
      this.router.navigate(['/chat']);
    });
  }
}
