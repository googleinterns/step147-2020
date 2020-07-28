import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { Chatroom } from '../models/chatroom';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.css'],
})

export class ChatBarComponent implements OnInit {
  @Output() changeChat: EventEmitter<Chat> = new EventEmitter();
  @Input() users: Chat[];
  currId: string;

  constructor() {}

  ngOnInit(): void {
    const localUser = JSON.parse(localStorage.getItem('user'));
    this.currId = localUser.uid;
  }

  getLastMessage(messages: Message[]): string {
    let message: string;

    if(this.currId === messages[messages.length - 1].senderId){
        message = messages[messages.length - 1].text;
    }else{
        message = messages[messages.length - 1].translatedText;
    }

    return message;
  }

  onSelect(chat: Chat) {
    this.changeChat.emit(chat);
  }
}
