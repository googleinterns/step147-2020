import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

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
import { SelectLanguageComponent } from './select-language/select-language.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import {
  NbThemeModule,
  NbLayoutModule,
  NbCardModule,
  NbSearchModule,
  NbUserModule,
  NbListModule,
  NbChatModule,
  NbSpinnerModule,
} from '@nebular/theme';

// My web app's Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCtf7l7RL8_6H_B-fAlo5E8xJDZf9c2J2M",
  authDomain: "team147-step2020.firebaseapp.com",
  databaseURL: "https://team147-step2020.firebaseio.com",
  projectId: "team147-step2020",
  storageBucket: "team147-step2020.appspot.com",
  messagingSenderId: "656351090386",
  appId: "1:656351090386:web:92adc8b6ca7ef1393aff0b",
  measurementId: "G-25QMK9RGPP"
};

@NgModule({
  declarations: [
    AppComponent,
    ChatBarComponent,
    ChatSectionComponent,
    LoginComponent,
    RegisterComponent,
    MainComponent,
    ConfirmEqualValidatorDirective,
    SelectLanguageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    RouterModule,
    HttpClientModule,
    AutocompleteLibModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbCardModule,
    NbSearchModule,
    NbUserModule,
    NbListModule,
    NbChatModule,
    NbSpinnerModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
