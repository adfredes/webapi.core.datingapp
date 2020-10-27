import { Component, OnInit } from '@angular/core';
import { Member } from '../models/member';
import { MembersService } from '../services/members.service';
import { LikesParams } from '../models/likesParams';
import { Pagination } from '../models/pagination';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  members: Partial<Member[]>;
  pagination: Pagination;
  likesParams: LikesParams;

  constructor(private memberService: MembersService) {
    this.likesParams = new LikesParams();
  }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes() {
    this.memberService.getLikes(this.likesParams)
      .subscribe(response => {
        this.members = response.result;
        this.pagination = response.pagination;
      });
  }

  pageChanged(event: any){
    this.likesParams.pageNumber = event.page;
    this.loadLikes();
  }

}
