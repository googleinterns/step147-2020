import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
 NbMenuService,
 NbDialogService,
 NbToastrService,
} from '@nebular/theme';
import { ChatDataService } from '../chat-data.service';
import { PusherService } from '../pusher.service';
import { User } from '../models/user';
import { Message } from '../models/message';
import { Chat } from '../models/chat';
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
 mainLoading = false;
 mainLoadingError: string;
 languageUpdateLoading = false;
 languageUpdateError: boolean;
 languageUpdateErrorMessage: boolean;
 sendingMessage = false;
 sendMessageError: string;
 
 // Menu items.
 menuItems = [{ title: 'Settings' }, { title: 'Logout' }];
 options = [
   { code: 'en', language: 'English' },
   { code: 'fr', language: 'French' },
   { code: 'es', language: 'Spanish' },
   { code: 'it', language: 'Italian' },
   { code: 'sw', language: 'Swahili' },
   { code: 'zh', language: 'Chinese' },
   { code: 'ar', language: 'Arabic' },
   { code: 'de', language: 'German' },
 ];
 
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
   this.mainLoading = true;
   const localUser = JSON.parse(localStorage.getItem('user'));
 
   if (localUser === null) {
     this.logout();
   }
 
   this.currId = localUser.uid;
 
   const usersPromise = this.chatService.getUsers().toPromise();
   usersPromise
     .then((users) => {
       this.users = users.filter((user) => user.userId !== this.currId);
       this.filteredUsers$ = of(this.users);
 
       // Set pusher to listen to new users being added.
       this.pusher.setPusher('users');
       this.pusher.channel.bind('new-user', (user) => {
         console.log('New user');
         this.users.push(JSON.parse(user));
         this.filteredUsers$ = of(this.users);
       });
 
       // Fetch the chatrooms that a user is in.
       const chatroomsPromise = this.chatService.getChatrooms().toPromise();
       chatroomsPromise
         .then((chatrooms) => {
           this.chatrooms = chatrooms;
 
           // Fetch the messages that a user is in.
           const messagePromise = this.chatService.getMessages().toPromise();
           messagePromise
             .then((messages) => {
               this.mainLoading = false;
               this.messages = messages;
               this.filterChatroomUsers();
               this.setPusher();
             })
             .catch((err) => {
               this.mainLoading = false;
               this.mainLoadingError =
                 'Failed to load Application. Please try again later';
               console.error('Error in fetching messages: ', err);
             });
         })
         .catch((err) => {
           this.mainLoading = false;
           this.mainLoadingError =
             'Failed to load Application. Please try again later';
           console.error('Error in fetching chatrooms: ', err);
         });
     })
     .catch((err) => {
       this.mainLoading = false;
       this.mainLoadingError =
         'Failed to load Application. Please try again later';
       console.error('Error in fetching users: ', err);
     });
 
   // Subscribe to changes in the menu.
   this.nbMenuService
     .onItemClick()
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
 // Handle display function.
 handleFunction(user) {
    return user? user.name: '';
 }
 
 // Function triggered once a user selects a user selects a user in chat bar.
 onSelectionChange(user: User) {
   this.onInput(user.name);
   const localChatArray = this.chatroomUsers.filter(
     (chat) => chat.userId === user.userId
   );
   let localChat = localChatArray.length !== 0 ? localChatArray[0] : null;
 
   if (localChat === null) {
     const newChat: Chat = {
       userId: user.userId,
       name: user.name,
       chatroomId: '',
       messages: [],
       unread: 0,
     };
     localChat = newChat;
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
   fetchUserPromise
     .then((user) => {
       const localUser: User = {
         userId: this.currId,
         name: user.name,
         email: user.email,
         language: selectedLanguage,
       };
 
       const putRequest = this.chatService
         .updateLanguage(localUser)
         .toPromise();
 
       putRequest
         .then((res) => {
           this.languageUpdateLoading = false;
           this.languageUpdateError = false;
         })
         .catch((err) => {
           this.languageUpdateLoading = false;
           this.languageUpdateError = true;
           this.languageUpdateErrorMessage = err.message;
           console.error(err);
         });
     })
     .catch((err) => {
       this.languageUpdateLoading = false;
       this.languageUpdateError = true;
       this.languageUpdateErrorMessage = err.message;
       console.error(err);
     });
 }
 
 // Close alters
 closeAlert() {
   this.languageUpdateError = null;
 }
 
 // Helper function to filter chatrooms and return the users in the chatrooms.
 filterChatroomUsers() {
   const chats: Chat[] = [];
 
   this.users.forEach((user) => {
     const gotChatroomArray = this.chatrooms.filter((chatroom) =>
       chatroom.users.includes(user.userId)
     );
 
     if (gotChatroomArray.length !== 0) {
       const newChat: Chat = this.createNewChat(
         user,
         gotChatroomArray[0].chatroomId
       );
       chats.push(newChat);
     }
   });
 
   this.chatroomUsers = chats;
   this.chatroomUsers.sort(
     (a, b) =>
       b.messages[b.messages.length - 1].timestamp -
       a.messages[a.messages.length - 1].timestamp
   );
 }
 
 // Function to create new chats for users;
 createNewChat(user: User, newChatroomId: string): Chat {
   let index = -1;
   if (this.chatroomUsers) {
     index = this.chatroomUsers.findIndex(
       (chat) => chat.chatroomId === newChatroomId
     );
   }
 
   const newChat: Chat = {
     userId: user.userId,
     name: user.name,
     chatroomId: newChatroomId,
     messages: this.messages.filter(
       (message) => message.chatroomId === newChatroomId
     ),
     unread: index === -1 ? 0 : this.chatroomUsers[index].unread,
   };
 
   return newChat;
 }
 
 // Function that handles switching data and messages depending on who is selected.
 onChange(chat: Chat) {
   this.currentChat = chat;
   const index = this.chatroomUsers.findIndex(
     (chatUser) => chatUser.chatroomId === chat.chatroomId
   );
   if (index !== -1) {
     this.chatroomUsers[index].unread = 0;
   }
 }
 
 // Function to set pusher service subscription
 setPusher() {
   this.pusher.setPusher(this.currId);
   this.pusher.channel.bind('new-message', (data) => {
     const incomingData = JSON.parse(data);
     this.messages.push(incomingData);
     const chatroomPushArray = this.chatroomUsers.filter(
       (chat) => chat.chatroomId === incomingData.chatroomId
     );
 
     // If there is no chatroom with the chatroomId, we create a new chatroom.
     if (chatroomPushArray.length === 0) {
       const chatroomPromise = this.chatService.getChatrooms().toPromise();
 
       chatroomPromise.then((chatrooms) => {
         this.chatrooms = chatrooms;
         this.filterChatroomUsers();
       });
 
       if(this.currentChat) {
         let currentChatArray = this.chatroomUsers.filter(chat => chat.userId === this.currentChat.userId);
         this.currentChat = currentChatArray[0];
       }

       this.addBadge(incomingData.chatroomId);

     } else {
       this.filterChatroomUsers();
       this.addBadge(incomingData);
       this.currentChat = this.chatroomUsers.find(chat => chat.chatroomId === this.currentChat.chatroomId);
     }
 
     // Show toaster if new message
     if (incomingData.senderId !== this.currId) {
       this.toastrService.show('You have a new message', 'New Message!');
     }
   });
 }
 
 // Function to add a badge to user with new message
 addBadge(chatroomId: string) {
   const index = this.chatroomUsers.findIndex(
     (chat) => chat.chatroomId === chatroomId
   );
 
   if (index === -1) {
     return;
   }
 
   if (!this.currentChat || this.currentChat.chatroomId !== chatroomId) {
     this.chatroomUsers[index].unread += 1;
   }
 }
 
 // Function to make a http call to send a new message to server.
 onNewMessage(newMessage: string) {
   this.sendingMessage = true;
 
   const newPost: Message = {
     messageId: '',
     senderId: this.currId,
     recipientId: this.currentChat.userId,
     text: newMessage,
     chatroomId: this.currentChat.chatroomId,
     translatedText: '',
     timestamp: 0,
   };
 
   const messageSend = this.chatService.addMessage(newPost).toPromise();
   messageSend
     .then((res) => {
       this.sendingMessage = false;
     })
     .catch((err) => {
       this.sendingMessage = false;
       this.toastrService.show(
         `There was an error in sending the message: ${err.message}`,
         'Message Not Sent!'
       );
       console.error(err);
     });
 }
 
 // Function to log user out.
 logout(): void {
   this.chatService.logout();
 }
}
 

