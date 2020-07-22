declare const Pusher: any;
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PusherService {
  pusher: any;
  channel: any;
  currentChannel: string = '';

  constructor(private http: HttpClient) {
    this.pusher = new Pusher(environment.pusher.key, {
      cluster: environment.pusher.cluster,
      encrypted: true,
    });
  }

  setPusher(channel: string): void {
    this.currentChannel = channel;
    this.channel = this.pusher.subscribe(channel);
  }

  unsubscribePusher() {
    this.pusher.unsubscribe(this.currentChannel);
  }
}
