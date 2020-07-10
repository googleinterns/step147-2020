import { Component, OnInit } from '@angular/core';
import { ChatDataService } from '../chat-data.service';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Post } from '../models/post';
import { Chatroom } from '../models/chatroom';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  users: User[];
  currentRecipient: string;
  messages: Message[];
  currId: string;

  constructor(private chatService: ChatDataService) {}

  ngOnInit(): void {
    const localUser = JSON.parse(localStorage.getItem("user"));
    this.currId = localUser.uid;

    const promise = this.chatService.getUsers().toPromise();
    promise.then(users => {
        this.users = users;
        console.log("Users", this.users);
    });

  }

  onChange(recipientId: string) {
    this.currentRecipient = recipientId;
    this.chatService
      .getMessages(recipientId)
      .subscribe((messages: Message[]) => this.messages = messages);
  }

  onNewMessage(newMessage: string) {
    let newPost : Post = {
        senderId: this.currId,
        recipientId: this.currentRecipient,
        text: newMessage
    }
    this.chatService.addMessage(newPost);
  }

  logout(): void {
    this.chatService.logout();
  }
}
