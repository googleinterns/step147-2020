import { Injectable } from '@angular/core';
import { Message } from './models/message';
import { MESSAGES } from './mocks/mock-messages';
import { Chatroom } from './models/chatroom'
import { CHATROOMS } from './mocks/mock-chatroom'
import { User } from './models/user';
import { USERS } from './mocks/mock-users';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatDataService {
  
  currentChatRoom : string = '';
  currId: string = "e3d39673-e3eb-4002-8374-baff95ccd118";
  constructor() { }

  getUsers(): User[]{
      return USERS;
  }

  getChatrooms(): Chatroom[]{
      return CHATROOMS;
  }

  getMessages(): Message[]{
      return MESSAGES;
  };
    
  addMessage(input: Message): void {
      MESSAGES.push(input);
  };
  
  changeChat(id){
      let gotId = CHATROOMS.filter(chatroom => {
          if(chatroom.users.includes(this.currId) && chatroom.users.includes(id)){
              return chatroom;
          }
      });

      this.currentChatRoom = gotId[0].chatroom_id;
      console.log(this.currentChatRoom);
  }
}
