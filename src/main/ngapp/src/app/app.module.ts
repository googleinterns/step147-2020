import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
import { ConfirmEqualValidatorDirective } from './auth/confirm-equal-validator.directive';

// My web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCtf7l7RL8_6H_B-fAlo5E8xJDZf9c2J2M",
  authDomain: "team147-step2020.firebaseapp.com",
  databaseURL: "https://team147-step2020.firebaseio.com",
  projectId: "team147-step2020",
  storageBucket: "team147-step2020.appspot.com",
  messagingSenderId: "656351090386",
  appId: "1:656351090386:web:92adc8b6ca7ef1393aff0b",
  measurementId: "G-25QMK9RGPP",
};

@NgModule({
  declarations: [
    AppComponent,
    ChatBarComponent,
    ChatSectionComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent,
    ConfirmEqualValidatorDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
