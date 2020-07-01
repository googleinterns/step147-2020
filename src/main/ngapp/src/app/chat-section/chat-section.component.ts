import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message } from '../models/message';

@Component({
  selector: 'app-chat-section',
  templateUrl: './chat-section.component.html',
  styleUrls: ['./chat-section.component.css']
})
export class ChatSectionComponent implements OnInit {

  @Output() emitMessage : EventEmitter<Message> = new EventEmitter();
  @Input() messages : Message[];
  @Input() currId : string;
  
  newMessage = '';

  constructor() { }

  ngOnInit(): void {}

  sendMessage(){

    if(this.newMessage.trim() === ''){
        return;
    }

    const sendMessage : Message = {
        chatroom_id : this.messages[0].chatroom_id,
        text: this.newMessage,
        sender_id : this.currId
    };

    this.emitMessage.emit(sendMessage);
    this.newMessage = '';
  };

}
