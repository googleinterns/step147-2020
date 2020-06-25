import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatBarComponent } from './chat-bar/chat-bar.component';
import { ChatSectionComponent } from './chat-section/chat-section.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatBarComponent,
    ChatSectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
