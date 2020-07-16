import { Component, OnInit } from '@angular/core';
import { ChatDataService } from '../chat-data.service';
import { PusherService } from '../pusher.service';
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
  chatroom: string;

  constructor(private chatService: ChatDataService, private pusher: PusherService) {}

  ngOnInit(): void {
    const localUser = JSON.parse(localStorage.getItem("user"));
    this.currId = localUser.uid;

    const promise = this.chatService.getUsers().toPromise();
    promise.then(users => {
        this.users = users;
    });

  }

  onChange(recipientId: string) {
    this.currentRecipient = recipientId;
    const promise = this.chatService.getMessages(recipientId).toPromise();

    promise.then(messages => {
        this.messages = messages;
        const newPromise = this.chatService.getChatroom(recipientId).toPromise();
        newPromise.then(res => {
            const chatroomId = res[0].chatroomId;
            this.pusher.setPusher(chatroomId);
            this.pusher.channel.bind('new-message', data => {
                this.messages.push(JSON.parse(data));
            });
        });
    });
    
  }

  onNewMessage(newMessage: string) {
    const newPost : Post = {
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
