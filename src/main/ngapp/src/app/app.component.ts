import { Component } from '@angular/core';

//additon 1
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
//end of addition 1

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-chat';
  channel: ""
  username = '';
  messages: ["Message1"]
  newMessage = '';
  channelList: [];
  chatClient: "";
  currentUser: "User";



  //addition 2
  constructor(public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }
  //end of additon 2

}
