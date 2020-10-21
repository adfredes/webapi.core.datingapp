import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Member } from '../../models/member';
import { User } from '../../models/user';
import { AccountService } from '../../services/account.service';
import { MembersService } from '../../services/members.service';
import { take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {

  @ViewChild('editForm') editForm: NgForm;
  member: Member;
  user: User;

  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any){
    if (this.editForm.dirty){
      $event.returnValue = true;
    }
  }

  constructor(private accountService: AccountService,
              private membersService: MembersService,
              private toastr: ToastrService) {
    this.accountService.currentuser$.pipe(take(1))
      .subscribe(user => {
        this.user = user;
      });
   }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    this.membersService.getMember(this.user.username)
    .subscribe( member => this.member = member);
  }

  updateMember(){
    console.log(this.member);
    this.membersService.updateMember(this.member)
      .subscribe(() => {
        this.toastr.success('Profile updated succesfully');
        this.editForm.reset(this.member);
      });
  }

}
