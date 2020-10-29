import { Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from '../../models/member';
import { MembersService } from '../../services/members.service';
import { Message } from 'src/app/models/message';
import { MessageService } from '../../services/message.service';
import { PresenceService } from '../../services/presence.service';
import { AccountService } from '../../services/account.service';
import { take } from 'rxjs/operators';
import { User } from '../../models/user';


@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent;
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  activeTab: TabDirective;
  user: User;

  constructor(public presence: PresenceService,
              public messageService: MessageService,
              private route: ActivatedRoute,
              private accountService: AccountService,
              private router: Router) {
    this.accountService.currentuser$
        .pipe(take(1))
        .subscribe(user => this.user = user);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.member = data.member;
    });

    this.route.queryParams.subscribe(params => {
     params.tab ? this.selectTab(params.tab) : this.selectTab(0);
    });

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];

    this.galleryImages = this.getImages();
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      });
    }
    return imageUrls;
  }


  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages'){
      this.messageService.createHubConnection(this.user, this.member.username);
    }else{
      this.messageService.stopHubConnection();
    }
  }

  selectTab(tabHeading: string | number) {
    if (typeof tabHeading === 'string'){
      const tab = this.memberTabs.tabs.find(t => t.heading === tabHeading);
      tab.active = true;
    }
    else{
      this.memberTabs.tabs[0].active = true;
    }
  }

}
