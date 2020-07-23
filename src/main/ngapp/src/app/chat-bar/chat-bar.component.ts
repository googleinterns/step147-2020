import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user';
import { Chatroom } from '../models/chatroom';

@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.css'],
})
export class ChatBarComponent implements OnInit {
  @Output() changeChat: EventEmitter<User> = new EventEmitter();

  @Input() users: User[];
  currId: string;

  constructor() {}

  ngOnInit(): void {
    const localUser = JSON.parse(localStorage.getItem('user'));
    this.currId = localUser.uid;
  }

  onSelect(user: User) {
    this.changeChat.emit(user);
  }
}
