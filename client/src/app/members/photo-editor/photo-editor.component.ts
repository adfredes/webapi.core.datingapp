import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Member } from '../../models/member';
import { environment } from 'src/environments/environment';
import { AccountService } from '../../services/account.service';
import { User } from '../../models/user';
import { take } from 'rxjs/operators';
import { JsonPipe } from '@angular/common';
import { MembersService } from '../../services/members.service';
import { Photo } from '../../models/photo';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member;
  uploader: FileUploader;
  hasBaseDropzoneOver = false;
  baseUrl = environment.apiUrl;
  user: User;

  constructor(private accountService: AccountService, private memberService: MembersService) {
    this.accountService.currentuser$.pipe(take(1))
      .subscribe(user => this.user = user);
  }

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: any){
    this.hasBaseDropzoneOver = e;
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo.id)
      .subscribe(() => {
        this.user.photoUrl = photo.url;
        this.accountService.setCurrentUser(this.user);
        this.member.photoUrl = photo.url;
        this.member.photos.forEach( p => p.isMain = p.id === photo.id ? true : false);
      });
  }

  deletePhoto(photo: Photo){
    this.memberService.deletePhoto(photo.id)
      .subscribe(() => {
        // const index: number = this.member.photos.indexOf(photo);
        // this.member.photos.splice(index, 1);
        this.member.photos = this.member.photos.filter(p => p.id !== photo.id);
      });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1020
    });

    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, response, status, header) => {
      if (response){
        const photo = JSON.parse(response);
        this.member.photos.push(photo);
      }
    };
  }

}
