import { Component, OnInit } from '@angular/core';
import { ChatDataService } from '../chat-data.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
 
@Component({
 selector: 'app-select-language',
 templateUrl: './select-language.component.html',
 styleUrls: ['./select-language.component.css'],
})
export class SelectLanguageComponent implements OnInit {
 constructor(public chatService: ChatDataService, private router: Router) {}
 
 updatingUser = false;
 updatingUserError: boolean;
 updatingUserErrorMessage: string;
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
 
 ngOnInit(): void {}
 
 signUp(nameInput: string, languageInput: string) {
   this.updatingUser = true;
   const localUser = JSON.parse(localStorage.getItem('user'));
   let userInstance: User = {
     userId: localUser.uid,
     name: nameInput,
     email: localUser.email,
     language: languageInput,
   };
 
   const addUserPromise = this.chatService.addUser(userInstance).toPromise();
 
   addUserPromise
     .then((res) => {
       this.updatingUser = false;
       this.router.navigate(['/chat']);
     })
     .catch((err) => {
       this.updatingUser = false;
       this.updatingUserError = true;
       this.updatingUserErrorMessage = err;
       console.error(err);
     });
 }
 
 closeAlert() {
   this.updatingUserError = false;
 }
}
 

