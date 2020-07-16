declare const Pusher: any;
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
    pusher: any;
    channel: any;
    constructor(private http: HttpClient) {}

    setPusher(channel : string): void {
        this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        encrypted: true
        });
        this.channel = this.pusher.subscribe(channel);

    }
}
