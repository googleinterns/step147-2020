import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
import { ChatDataService } from '../chat-data.service';
import { PusherService } from '../pusher.service';
import { User } from '../models/user';
import { Message } from '../models/message';
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

  // Currently selected user and chatroom.
  selectedUser: User;
  selectedChatroom: Chatroom;

  // Variables to go into the chat bar component.
  chatroomUsers: User[];

  // Variables to go into the chat section component.
  messages: Message[];

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
    usersPromise.then((users) => {
      this.users = users.filter((user) => user.userId !== this.currId);
      this.filteredUsers$ = of(this.users);

      const chatroomsPromise = this.chatService.getChatrooms().toPromise();
      chatroomsPromise.then((chatrooms) => {
        this.chatrooms = chatrooms;
        this.filterChatroomUsers();
        this.chatBarLoading = false;
      });
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

  // Function triggered once a user selects a user selects a user in chat bar.
  onSelectionChange(user: User) {
    this.filteredUsers$ = this.getFilteredUsers(user.name);
    this.onChange(user);
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

  // Helper function to determine whether a user is in any of the chatrooms.
  chatroomContains(id: string) {
    let returned = false;
    this.chatrooms.forEach((chatroom) => {
      if (chatroom.users.includes(id)) {
        returned = true;
      }
    });
    return returned;
  }

  // Helper function to filter chatrooms and return the users in the chatrooms.
  filterChatroomUsers() {
    let localUsers: User[] = [];
    this.users.forEach((user) => {
      let returned = false;
      returned = this.chatroomContains(user.userId);
      if (returned) {
        localUsers.push(user);
      }
    });

    this.chatroomUsers = localUsers;
  }

  // Helper function to load messages from the server and update pusher subscription.
  fetchMessages(chatroomId: string) {
    const messagePromise = this.chatService.getMessages(chatroomId).toPromise();
    return messagePromise.then((messages) => {
      this.messages = messages;
      this.pusher.setPusher(chatroomId);
      this.pusher.channel.bind('new-message', (data) => {
        this.messages.push(JSON.parse(data));
        return messages;
      });
    });
  }

  // Function that handles switching data and messages depending on who is selected.
  onChange(user: User) {
    this.pusher.unsubscribePusher();
    this.selectedUser = user;
    // this.currentRecipient = user.userId;

    let chatroomArray = this.chatrooms.filter((chatroom) =>
      chatroom.users.includes(user.userId)
    );

    if (chatroomArray.length === 0) {
      const chatroomPromise = this.chatService
        .getChatroom(user.userId)
        .toPromise();
      chatroomPromise.then((res) => {
        this.selectedChatroom = res[0];
        const chatroomId = res[0].chatroomId;
        this.chatrooms.push(res[0]);
        this.filterChatroomUsers();
        const messagePromise = this.fetchMessages(chatroomId);
        messagePromise
          .then((messages) => {
            console.log(messages);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } else {
      this.selectedChatroom = chatroomArray[0];
      const chatroomId = chatroomArray[0].chatroomId;
      const messagePromise = this.fetchMessages(chatroomId);
      messagePromise
        .then((messages) => {
          console.log(messages);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  // Function to make a http call to send a new message to server.
  onNewMessage(newMessage: string) {
    const newPost: Post = {
      senderId: this.currId,
      recipientId: this.selectedUser.userId,
      text: newMessage,
      chatroomId: this.selectedChatroom.chatroomId,
    };
    this.chatService.addMessage(newPost);
  }

  // Function to log user out.
  logout(): void {
    this.chatService.logout();
  }
}
