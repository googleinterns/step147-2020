import { Component, OnInit } from '@angular/core';
import { ChatDataService } from '../chat-data.service';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Chatroom } from '../models/chatroom';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  users: User[];
  messages: Message[];
  currId = 'e3d39673-e3eb-4002-8374-baff95ccd118';

  constructor(
    private chatService: ChatDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.users = this.chatService
      .getUsers()
      .filter((user) => user.user_id !== this.currId);
  }

  onChange(e: string) {
    const chatroomArray: Chatroom[] = this.chatService
      .getChatrooms()
      .filter((chatroom) => {
        if (
          chatroom.users.includes(e) &&
          chatroom.users.includes(this.currId)
        ) {
          return chatroom;
        }
      });
    let chat_id = chatroomArray[0].chatroom_id;

    this.messages = this.chatService
      .getMessages()
      .filter((message) => message.chatroom_id === chat_id);
  }

  onNewMessage(e: Message) {
    this.messages.push(e);
    this.chatService.addMessage(e);
  }

  logout(): void {
    this.authService.logout();
  }
}
