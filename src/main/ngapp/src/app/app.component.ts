import { Component } from '@angular/core';

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

}
