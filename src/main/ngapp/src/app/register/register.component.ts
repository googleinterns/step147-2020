import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ChatDataService } from '../chat-data.service';
import { Router } from '@angular/router';
import { User } from '../models/user';
 
@Component({
 selector: 'app-register',
 templateUrl: './register.component.html',
 styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
 registerAwait = false;
 error: any;
 errorPresent: boolean = false;
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
 
 constructor(
   private authService: AuthService,
   private chatService: ChatDataService,
   private router: Router
 ) {}
 
 ngOnInit() {}
 
 createUser(frm): void {
   this.registerAwait = true;
   this.authService
     .register(frm)
     .then((res) => {
       const userInstance: User = {
         userId: res.user.uid,
         name: frm.firstName + ' ' + frm.lastName,
         email: frm.email,
         language: frm.language,
       };
 
       const postPromise = this.chatService.addUser(userInstance).toPromise();
       postPromise
         .then((res) => {
           this.registerAwait = false;
           this.router.navigate(['/chat']);
         })
         .catch((err) => {
           console.log('Error with posting user');
           this.registerAwait = false;
           this.errorPresent = true;
           this.error = err.message;
         });
     })
     .catch((err) => {
       console.log('Error with creating user');
       this.registerAwait = false;
       this.errorPresent = true;
       this.error = err.message;
     });
 }
 
 onClose() {
   this.errorPresent = false;
 }
}
