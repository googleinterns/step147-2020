import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
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
  chatBarLoading = false;
  chatSectionLoading = false;

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
    private dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    // Retrieve data on first load
    this.chatBarLoading = true;
    const localUser = JSON.parse(localStorage.getItem('user'));
    this.currId = localUser.uid;

    const usersPromise = this.chatService.getUsers().toPromise();
    const chatroomsPromise = this.chatService.getChatrooms().toPromise();
    const messagePromise = this.chatService.getMessages().toPromise();

    Promise.all([usersPromise, chatroomsPromise, messagePromise]).then(results => {
        this.users = results[0].filter(user => user.userId !== this.currId);
        this.filteredUsers$ = of(this.users);
        this.chatrooms = results[1];
        this.messages = results[2];

        this.filterChatroomUsers();
        this.setPusher();
        this.chatBarLoading = false;

    }).catch(err => {
        this.chatBarLoading = false;
        console.error("There was a problem connecting to the server");
    });

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
    this.filteredUsers$ = this.getFilteredUsers(user.name);
    let localChat = this.chatroomUsers.find(chat => chat.userId === user.userId);

    if(!localChat){
        localChat = {
            userId: user.userId,
            name: user.name,
            chatroomId: "",
            messages: [],
            unread: 0
        };
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
    const localUser: User = {
      userId: this.currId,
      name: '',
      email: '',
      language: selectedLanguage,
    };

    const putRequest = this.chatService.updateLanguage(localUser).toPromise();
    putRequest
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Helper function to filter chatrooms and return the users in the chatrooms.
  filterChatroomUsers() {
    let chats: Chat[];
    this.users.forEach(user => {
        const gotChatroom = this.chatrooms.find(chatroom => chatroom.users.includes(user.userId));

        if(gotChatroom){
            const newChat: Chat = {
                userId: user.userId,
                name: user.name,
                chatroomId: gotChatroom.chatroomId,
                messages: this.messages.filter(message => message.chatroomId === gotChatroom.chatroomId),
                unread: 0
            };
            chats.push(newChat);
        }
    });

    this.chatroomUsers = chats;
    this.chatroomUsers.sort((a, b) => a.messages[a.messages.length - 1].timestamp - b.messages[b.messages.length - 1].timestamp);

  }

  // Function that handles switching data and messages depending on who is selected.
  onChange(chat: Chat){
    this.currentChat = chat;
    const index = this.chatroomUsers.findIndex(chatUser => chatUser.chatroomId === chat.chatroomId);
    if(index){
        this.chatroomUsers[index].unread = 0;
    }
  }

  // Function to set pusher service subscription
  setPusher(){
    this.pusher.setPusher(this.currId);
    this.pusher.channel.bind('new-message', (data) => {
        this.messages.push(JSON.parse(data));
        const chatroom = this.chatrooms.find(chatroom => chatroom.chatroomId === data.chatroomId);

        if(!chatroom){
            const chatroomPromise = this.chatService.getChatrooms().toPromise();
            chatroomPromise.then(chatrooms => {
                this.chatrooms = chatrooms;
                this.filterChatroomUsers();
                this.addBadge(data.chatroomId);
            })
        }else{
            this.filterChatroomUsers();
            this.addBadge(chatroom.chatroomId);
        }

        if(this.currentChat.chatroomId === data.chatrooomId){
            this.currentChat = this.chatroomUsers.find(chat => chat.chatroomId === this.currentChat.chatroomId);
        }
    });
  }

  // Function to add a badge to user with new message
  addBadge(chatroomId: string){
      if(this.currentChat.chatroomId !== chatroomId){
          const index = this.chatroomUsers.findIndex(chat => chat.chatroomId === chatroomId);
          this.chatroomUsers[index].unread += 1;
      }
  }

  // Function to make a http call to send a new message to server.
  onNewMessage(newMessage: string) {
    const newPost: Post = {
      senderId: this.currId,
      recipientId: this.currentChat.userId,
      text: newMessage,
      chatroomId: this.currentChat.chatroomId,
    };
    this.chatService.addMessage(newPost);
  }

  // Function to log user out.
  logout(): void {
    this.chatService.logout();
  }
}
