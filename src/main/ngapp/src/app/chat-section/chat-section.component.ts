import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message } from '../models/message';

@Component({
  selector: 'app-chat-section',
  templateUrl: './chat-section.component.html',
  styleUrls: ['./chat-section.component.css']
})

export class ChatSectionComponent implements OnInit {

  @Output() emitMessage : EventEmitter<String> = new EventEmitter();
  @Input() messages : Message[];
  
  currId: string;
  newMessage = '';

  constructor() { }

  ngOnInit(){
      const localUser = JSON.parse(localStorage.getItem("user"));
      this.currId = localUser.uid;
      console.log("Chat section uid: ", this.currId);
  }

  sendMessage(){
    if(this.newMessage.trim() === ''){
        return;
    }
    console.log(this.newMessage);
    this.emitMessage.emit(this.newMessage);
    this.newMessage = '';
  }

}
