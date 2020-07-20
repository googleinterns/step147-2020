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
  }

  sendMessage(event){

    if(this.newMessage.trim() === ''){
        return;
    }
 
    this.emitMessage.emit(event.message);
    this.newMessage = '';
  }

}
