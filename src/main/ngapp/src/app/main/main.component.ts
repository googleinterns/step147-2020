import { Component, OnInit } from '@angular/core';
import { ChatDataService } from '../chat-data.service';
import { PusherService } from '../pusher.service';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Post } from '../models/post';
import { Chatroom } from '../models/chatroom';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  keyword = "name";
  users: User[];
  chatroomUsers: User[];
  currentRecipient: string;
  messages: Message[];
  chatrooms: Chatroom[];
  currId: string;
  currChatroomId: string;

  constructor(private chatService: ChatDataService, private pusher: PusherService) {}

  ngOnInit(): void {
    const localUser = JSON.parse(localStorage.getItem("user"));
    this.currId = localUser.uid;

    const usersPromise = this.chatService.getUsers().toPromise();
    usersPromise.then(users => {
        this.users = users.filter(user => user.userId !== this.currId);
        const chatroomsPromise = this.chatService.getChatrooms().toPromise();
        chatroomsPromise.then(chatrooms => {
            this.chatrooms = chatrooms;
            this.filterChatroomUsers();
        })
    });

    

  }

  chatroomContains(id: string){
      let returned = false;
      this.chatrooms.forEach(chatroom => {
          console.log(chatroom);
          console.log("Passed in id:", id);
          if(chatroom.users.includes(id)){
              returned = true;
          }
      });

      return returned;
  }

  filterChatroomUsers(){
    let localUsers : User[] = [];
    this.users.forEach(user => {
        let returned = false;
        returned = this.chatroomContains(user.userId);
        if(returned){
            localUsers.push(user);
        }
    });

    console.log(localUsers);
    this.chatroomUsers = localUsers;
  }

  

  onChange(recipientId: string) {
    
    this.currentRecipient = recipientId;

    const chatroomPromise = this.chatService.getChatroom(recipientId).toPromise();

    chatroomPromise.then(res => {

        const chatroomId = res[0].chatroomId;
        this.currChatroomId = chatroomId;

        const messagePromise = this.chatService.getMessages(chatroomId).toPromise();
        messagePromise.then(messages => {
            this.messages = messages;
            this.pusher.setPusher(chatroomId);
        });
        this.pusher.channel.bind('new-message', data => {
            this.messages.push(JSON.parse(data));
        });
        
    })
    
  }

  onNewMessage(newMessage: string) {
    const newPost : Post = {
        senderId: this.currId,
        recipientId: this.currentRecipient,
        text: newMessage,
        chatroomId: this.currChatroomId
    }
    this.chatService.addMessage(newPost);
  }

  selectUser(user){
    console.log("Selected user: ", user.userId);
    const chatroomsPromise = this.chatService.getChatrooms().toPromise();
    chatroomsPromise.then(chatrooms => {
        this.chatrooms = chatrooms;
    });

    this.onChange(user.userId);
    this.filterChatroomUsers();
    console.log("Chatroom users, ", this.chatroomUsers);
  }

  logout(): void {
    this.chatService.logout();
  }
}
