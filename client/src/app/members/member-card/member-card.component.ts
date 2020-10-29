import { Component, Input, OnInit } from '@angular/core';
import { Member } from '../../models/member';
import { MembersService } from '../../services/members.service';
import { ToastrService } from 'ngx-toastr';
import { PresenceService } from '../../services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() member: Member;

  constructor(private memberService: MembersService, private toastr: ToastrService, public presence: PresenceService) { }

  ngOnInit(): void {
  }

  addLike(){
    this.memberService.addLike(this.member.username)
      .subscribe(() => {
        this.toastr.success(`You have liked ${this.member.knownAs}`);
      });
  }

}
