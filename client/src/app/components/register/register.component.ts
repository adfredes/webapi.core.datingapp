import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCancel = new EventEmitter();
  model: any = {};

  constructor(private accountService: AccountService, private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  register() {
    this.accountService.register(this.model)
      .subscribe(resp => {
        console.log(resp);
        this.cancel();
      }, error => {
        console.log(error);
        this.toastr.error(error.error);
      });
  }

  cancel() {
    this.onCancel.emit();
  }

}
