import { Component, OnInit, Input  } from '@angular/core';
import { ChatDataService } from './chat-data.service';
import { User } from './models/user';
import { Message } from './models/message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    users: User[];
    messages: Message[];
    currId = "e3d39673-e3eb-4002-8374-baff95ccd118";

    constructor(private chatService: ChatDataService ){}

    ngOnInit(): void{
        this.users = this.chatService.getUsers().filter(user => user.user_id !== this.currId);
    }

    onChange(e: string){

        let chatroom_array = this.chatService.getChatrooms().filter(chatroom => {
               if(chatroom.users.includes(e) && chatroom.users.includes(this.currId)){
                   return chatroom;
               }
           });
        let chat_id = chatroom_array[0].chatroom_id;

        this.messages = this.chatService.getMessages().filter(message => message.chatroom_id === chat_id);
    }

    onNewMessage(e: Message){
        this.messages.push(e);
        this.chatService.addMessage(e);
    }
}
