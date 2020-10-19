import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};

  constructor( public accountService: AccountService,
               private router: Router,
               private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  login( ): void {
    this.accountService.login(this.model)
      .subscribe(res => {
        this.model = {};
        this.router.navigate(['/members']);
      }, error => {
        this.toastr.error(error.error);
        console.log(error);
      });

  }

  logout(): void{
    this.accountService.logout();
    this.router.navigate(['/']);
  }

}
