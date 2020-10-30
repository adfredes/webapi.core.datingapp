import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private onlineUserSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUserSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) { }

  createHubConnection(user: User){
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + 'presence', {
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build();

    this.hubConnection.start().catch(console.log);

    this.hubConnection.on('UserIsOnline', username => {
      // this.toastr.info(username + ' has connected')
      this.onlineUsers$.pipe(take(1)).subscribe(onlineUsers => {
        this.onlineUserSource.next([...onlineUsers, username]);
      });
    });

    this.hubConnection.on('UserIsOffline', username => {
      // this.toastr.warning(username + ' has disconnected')
      this.onlineUsers$.pipe(take(1)).subscribe(onlineUsers => {
        this.onlineUserSource.next([...onlineUsers].filter(u => u !== username));
      });
    });

    this.hubConnection.on('GetOnlineUsers', (usernames: string[]) => this.onlineUserSource.next(usernames));

    this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
      this.toastr.info((knownAs || username) + ' has sent yoy a new message!')
        .onTap
        .pipe(take(1))
        .subscribe(() => this.router.navigate(['./members', username],  {queryParams: {tab: 'Messages'}}));
    });
  }

  stopHubConnection() {
    this.hubConnection.stop().catch(console.log);
  }
}
