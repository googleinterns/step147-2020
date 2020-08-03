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
   if (messages.length === 0) {
     return '';
   }
 
   const lastMessage = messages[messages.length - 1];
   return this.currId === lastMessage.senderId
     ? lastMessage.text
     : lastMessage.translatedText;
 }
 
 onSelect(chat: Chat) {
   this.changeChat.emit(chat);
 }
}
 

