import { Component, OnInit } from '@angular/core';
import { Message } from '../models/message';
import { Pagination } from '../models/pagination';
import { MessageService } from '../services/message.service';
import { MessageParams } from '../models/messageParams';
import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  pagination: Pagination;
  messageParams = new MessageParams();
  loading = false;

  constructor(private messageService: MessageService, private confirmService: ConfirmService) { }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(){
    this.loading = true;
    this.messageService.getMessages(this.messageParams)
      .subscribe(res => {
        this.messages = res.result;
        this.pagination = res.pagination;
        this.loading = false;
      });
  }

  deleteButtonHandle(event, id: number){
    event.stopPropagation();
    this.confirmService.confirm('Confirm delete message', 'This cannot be undone')
      .subscribe(confirm => {
        if (confirm) {
          this.deleteMessage(id);
        }
      });
  }

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id)
      .subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
      });
  }

  pageChanged(event: any){
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

}
