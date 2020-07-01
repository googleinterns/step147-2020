import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChatBarComponent } from './chat-bar/chat-bar.component';
import { ChatSectionComponent } from './chat-section/chat-section.component';


const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'chat-bar',
        component: ChatBarComponent
    },
    {
        path: 'chat-section',
        component: ChatSectionComponent
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
