import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { User } from '../models/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};

  constructor( public accountService: AccountService) { }

  ngOnInit(): void {
  }

  login( ): void {
    this.accountService.login(this.model)
      .subscribe(res => {
        console.log(res);
      }, error => {
        console.log(error);
      });

  }

  logout(): void{
    this.accountService.logout();
  }

}
