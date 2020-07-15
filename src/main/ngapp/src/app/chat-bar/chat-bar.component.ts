import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user';


@Component({
  selector: 'app-chat-bar',
  templateUrl: './chat-bar.component.html',
  styleUrls: ['./chat-bar.component.css']
})
export class ChatBarComponent implements OnInit {
  
  @Output() changeChat: EventEmitter<any> = new EventEmitter();

  @Input() users: User[];
  currId: string;

  constructor() { }

  ngOnInit(): void {
    const localUser = JSON.parse(localStorage.getItem("user"));
    this.currId = localUser.uid;
  }

  onSelect(id: string){
      this.changeChat.emit(id);
  }

}
