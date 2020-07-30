import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbMenuService, NbDialogService, NbToastrService } from '@nebular/theme';
import { ChatDataService } from '../chat-data.service';
import { PusherService } from '../pusher.service';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Chat } from '../models/chat';
import { Post } from '../models/post';
import { Chatroom } from '../models/chatroom';
import { Observable, of } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  keyword = 'name';
  currId: string;
  users: User[];
  chatrooms: Chatroom[];
  messages: Message[];

  // Variables to go into the chat bar component.
  chatroomUsers: Chat[];

  // Variables to go into the chat section component.
  currentChat: Chat;

  // Variables to update spinners.
  languageUpdateLoading = false;
  languageUpdateError: boolean;
  languageUpdateErrorMessage: boolean;
  sendingMessage: boolean = false;
  sendMessageError: string;

  // Menu items.
  menuItems = [{ title: 'Settings' }, { title: 'Logout' }];

  // Autocomplete options.
  filteredUsers$: Observable<User[]>;
  @ViewChild('autoInput') input;
  @ViewChild('dialog') dialogRef: TemplateRef<any>;

  constructor(
    private chatService: ChatDataService,
    private pusher: PusherService,
    private nbMenuService: NbMenuService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService
  ) {}

  ngOnInit(): void {
    // Retrieve data on first load
    const localUser = JSON.parse(localStorage.getItem('user'));
    this.currId = localUser.uid;

    const usersPromise = this.chatService.getUsers().toPromise();
    usersPromise.then(users => {
        this.users = users.filter(user => user.userId !== this.currId);
        this.filteredUsers$ = of(this.users);
        this.pusher.setPusher("users");
        this.pusher.channel.bind('new-user', (user) => {
            console.log("New user");
            this.users.push(JSON.parse(user));
            this.filteredUsers$ = of(this.users);
        });

        const chatroomsPromise = this.chatService.getChatrooms().toPromise();
        chatroomsPromise.then(chatrooms => {
            this.chatrooms = chatrooms;
            const messagePromise = this.chatService.getMessages().toPromise();
            messagePromise.then(messages => {
                this.messages = messages;
                this.filterChatroomUsers();
                this.setPusher();
            }).catch(err => {
                console.error("Error in fetching messages: ", err);
            });
        }).catch(err => {
            console.error("Error in fetching chatrooms: ", err);
        })
    }).catch(err => {
        console.error("Error in fetching users: ", err);
    })

    // Subscribe to changes in the menu.
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'my-context-menu'),
        map(({ item: { title } }) => title)
      )
      .subscribe((title) => {
        if (title === 'Logout') {
          this.logout();
        } else if (title === 'Settings') {
          this.openDialogService(this.dialogRef);
        }
      });
  }

  // Filter to check which users have been selected.
  filter(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(filterValue)
    );
  }

  // Convert the value of filter to observable.
  getFilteredUsers(value: string): Observable<User[]> {
    return of(value).pipe(map((userInput) => this.filter(userInput)));
  }

  // Function to listen to inputs in the autocomplete bar.
  onInput(input: string) {
    this.filteredUsers$ = this.getFilteredUsers(input);
  }

  // Function triggered once a user selects a user selects a user in chat bar.
  onSelectionChange(user: User) {
    console.log(user);
    this.filteredUsers$ = this.getFilteredUsers(user.name);
    const localChatArray = this.chatroomUsers.filter(chat => chat.userId === user.userId);
    let localChat;

    if(localChatArray.length === 0){
        const newChat: Chat = {
            userId: user.userId,
            name: user.name,
            chatroomId: "",
            messages: [],
            unread: 0
        };
        localChat = newChat;
    }else{
        localChat = localChatArray[0];
    }

    this.onChange(localChat);
  }

  // Opens the dialog window when settings is clicked.
  openDialogService(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, {
      context: 'this is some additional data passed to dialog',
    });
  }

  // Function to make a http call to update the user's preferred language
  updateLanguage(selectedLanguage: string) {
    this.languageUpdateLoading = true;
    const fetchUserPromise = this.chatService.getUser().toPromise();
    fetchUserPromise.then(user => {

        const localUser: User = {
            userId: this.currId,
            name: user.name,
            email: user.email,
            language: selectedLanguage,
        };

        const putRequest = this.chatService.updateLanguage(localUser).toPromise();
        putRequest.then((res) => {
            this.languageUpdateLoading = false;
            this.languageUpdateError = false;
            console.log(res);
        })
        .catch((err) => {
            this.languageUpdateLoading = false;
            this.languageUpdateError = true;
            this.languageUpdateErrorMessage = err.message;
            console.error(err);
        });
    }).catch(err => {
        this.languageUpdateLoading = false;
        this.languageUpdateError = true;
        this.languageUpdateErrorMessage = err.message;
        console.error(err);
    });
  }

  // Close alters 
  closeAlert(){
      this.languageUpdateError = null;
  }

  // Helper function to filter chatrooms and return the users in the chatrooms.
  filterChatroomUsers() {
    let chats: Chat[] = [];
    this.users.forEach(user => {
        const gotChatroomArray = this.chatrooms.filter(chatroom => chatroom.users.includes(user.userId));

        if(gotChatroomArray.length !== 0){
            const newChat : Chat = this.createNewChat(user, gotChatroomArray[0].chatroomId);
            chats.push(newChat);
        }
    });

    this.chatroomUsers = chats;
    this.chatroomUsers.sort((a, b) =>  b.messages[b.messages.length - 1].timestamp - a.messages[a.messages.length - 1].timestamp);

  }

  // Function to create new chats for users;
  createNewChat(user: User, newChatroomId: string): Chat{
      const newChat : Chat = {
          userId: user.userId,
          name: user.name,
          chatroomId: newChatroomId,
          messages: this.messages.filter(message => message.chatroomId === newChatroomId),
          unread : 0
      }

      return newChat;
  }

  // Function that handles switching data and messages depending on who is selected.
  onChange(chat: Chat){
    this.currentChat = chat;
    const index = this.chatroomUsers.findIndex(chatUser => chatUser.chatroomId === chat.chatroomId);
    if(index !== -1){
        this.chatroomUsers[index].unread = 0;
    }
  }

  // Function to set pusher service subscription
  setPusher(){
    this.pusher.setPusher(this.currId);
    this.pusher.channel.bind('new-message', (data) => {
        const incomingData = JSON.parse(data);
        this.messages.push(incomingData);
        const chatroomPushArray = this.chatroomUsers.filter(chat => chat.chatroomId === incomingData.chatroomId);

        if(chatroomPushArray.length === 0){
            const chatroomPromise = this.chatService.getChatrooms().toPromise();
            chatroomPromise.then(chatrooms => {
                this.chatrooms = chatrooms;
                const userArray = this.users.filter(user => {
                    if(user.userId === incomingData.senderId || user.userId === incomingData.recipientId){
                        return user;
                    }
                });
                const newChat: Chat = this.createNewChat(userArray[0], incomingData.chatroomId);
                this.chatroomUsers.push(newChat);
                this.addBadge(incomingData.chatroomId);
                this.chatroomUsers.sort((a, b) =>  b.messages[b.messages.length - 1].timestamp - a.messages[a.messages.length - 1].timestamp);
            });
        }else{
            this.updateChats(incomingData);
            this.addBadge(incomingData.chatroomId);
            this.chatroomUsers.sort((a, b) =>  b.messages[b.messages.length - 1].timestamp - a.messages[a.messages.length - 1].timestamp);
        }

        if(this.currentChat){
            this.currentChat = this.chatroomUsers.find(chat => chat.chatroomId === this.currentChat.chatroomId);
        }
    });
  }

  // Update chats.
  updateChats(message: Message){
      const index = this.chatroomUsers.findIndex(chat => chat.chatroomId === message.chatroomId);
      if(index !== -1){
          this.chatroomUsers[index].messages.push(message);
      }
  }

  // Function to add a badge to user with new message
  addBadge(chatroomId: string){
      if(this.currentChat && this.currentChat.chatroomId !== chatroomId){
        const index = this.chatroomUsers.findIndex(chat => chat.chatroomId === chatroomId);
        if(index !== -1){
            this.chatroomUsers[index].unread += 1;
            this.toastrService.show("You have a new message", "New Message!");
        }
      }else if(!this.currentChat){
        const index = this.chatroomUsers.findIndex(chat => chat.chatroomId === chatroomId);
        if(index !== -1){
            this.chatroomUsers[index].unread += 1;
            this.toastrService.show("You have a new message", "New Message!");
        }
      }
  }

  // Function to make a http call to send a new message to server.
  onNewMessage(newMessage: string) {
    this.sendingMessage = true;

    const newPost: Post = {
      senderId: this.currId,
      recipientId: this.currentChat.userId,
      text: newMessage,
      chatroomId: this.currentChat.chatroomId,
    };
    const messageSend = this.chatService.addMessage(newPost).toPromise();
    messageSend.then(res => {
        this.sendingMessage = false;
        console.log(res);
    }).catch(err => {
        this.sendingMessage = false;
        this.toastrService.show(`There was an error in sending the message: ${err.message}`, "Message Not Sent!");
        console.error(err);
    })
  }

  // Function to log user out.
  logout(): void {
    this.chatService.logout();
  }
}
