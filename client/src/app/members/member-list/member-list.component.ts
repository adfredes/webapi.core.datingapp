import { Component, OnInit } from '@angular/core';
import { MembersService } from '../../services/members.service';
import { Member } from '../../models/member';
import { Observable } from 'rxjs';
import { Pagination } from '../../models/pagination';
import { UserParams } from '../../models/userParams';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit{

  members: Member[];
  pagination: Pagination;
  userParams: UserParams;
  user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  //members$: Observable<Member[]>;

  constructor(private membersService: MembersService) {
    this.userParams = this.membersService.getUserParams();
  }

  ngOnInit(): void {
    //this.members$ = this.membersService.getMembers();
    this.loadMembers();
  }

  loadMembers() {
    this.membersService.setUserParam(this.userParams);
    this.membersService.getMembers(this.userParams)
      .subscribe(response => {
        this.members = response.result;
        this.pagination = response.pagination;
      });
  }

  resetFilters() {
    this.userParams = this.membersService.resetUserParam();
  }

  pageChanged(event: any){
    this.userParams.pageNumber = event.page;
    this.membersService.setUserParam(this.userParams);
    this.loadMembers();
  }

}
