import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

import { ChatBarComponent } from './chat-bar/chat-bar.component';
import { ChatSectionComponent } from './chat-section/chat-section.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';

// My web app's Firebase configuration.
const firebaseConfig = {
  apiKey: 'AIzaSyCxrbT7YJCsSp8dpHmydh-OijPYCekJiQY',
  authDomain: 'kiprotich-step2020.firebaseapp.com',
  databaseURL: 'https://kiprotich-step2020.firebaseio.com',
  projectId: 'kiprotich-step2020',
  storageBucket: 'kiprotich-step2020.appspot.com',
  messagingSenderId: '1033713437962',
  appId: '1:1033713437962:web:278a1147e8716a5cc9fef3',
  measurementId: 'G-DHZ7GR3HHN',
};

@NgModule({
  declarations: [
    AppComponent,
    ChatBarComponent,
    ChatSectionComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    RouterModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
