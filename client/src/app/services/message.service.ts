import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MessageParams } from '../models/messageParams';
import { getPaginatedResult } from './paginationHelper';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message';


@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getMessages(messageParams: MessageParams){
    return getPaginatedResult<Message[], MessageParams>(this.baseUrl + 'messages', messageParams, this.http);
  }

  getMessagesThread(username: string){
    return this.http.get<Message[]>(`${this.baseUrl}messages/thread/${username}`);
  }

  sendMessage(username: string, content: string){
    return this.http.post<Message>(`${this.baseUrl}messages`, {recipientUsername: username, content});
  }

  deleteMessage(id: number){
    return this.http.delete(`${this.baseUrl}messages/${id}`);
  }
}
