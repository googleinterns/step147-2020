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
    console.log("In chat bar, users: ", this.users);
    console.log("In chat bar, userId: ", this.currId);
  }

  onSelect(id: string){
      console.log("Emit id: ", id);
      this.changeChat.emit(id);
  }

}
