import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MessageParams } from '../models/messageParams';
import { getPaginatedResult } from './paginationHelper';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Group } from '../models/group';
import { BusyService } from './busy.service';


@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  private hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient, private busyService: BusyService) { }

  createHubConnection(user: User, otherUsername: string){
    this.busyService.busy();
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(console.log)
    .finally(() => this.busyService.idle());

    this.hubConnection.on('ReceiveMessageThread', messages => this.messageThreadSource.next(messages));

    this.hubConnection.on('NewMessage', message => {
      this.messageThread$
        .pipe(take(1))
        .subscribe(messages => this.messageThreadSource.next([...messages, message]));
    });

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.conections.some(c => c.username === otherUsername)){
        this.messageThread$
        .pipe(take(1))
        .subscribe(messages =>
          {
            messages.forEach(message => message.dateRead = message.dateRead ? message.dateRead : new Date(Date.now()));
            this.messageThreadSource.next([...messages]);
          }
        );
      }
    });
  }

  stopHubConnection() {
    if (this.hubConnection){
      this.messageThreadSource.next([]);
      this.hubConnection.stop().catch(console.log);
    }
  }

  getMessages(messageParams: MessageParams){
    return getPaginatedResult<Message[], MessageParams>(this.baseUrl + 'messages', messageParams, this.http);
  }

  getMessagesThread(username: string){
    return this.http.get<Message[]>(`${this.baseUrl}messages/thread/${username}`);
  }

  async sendMessage(username: string, content: string){
    // return this.http.post<Message>(`${this.baseUrl}messages`, {recipientUsername: username, content});
    // devuelve una promesa
    return this.hubConnection.invoke('SendMessage', {recipientUsername: username, content})
              .catch(console.log);
  }

  deleteMessage(id: number){
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
