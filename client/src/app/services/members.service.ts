import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../models/member';
import { PaginatedResult } from '../models/pagination';
import { User } from '../models/user';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';
import { LikesParams } from '../models/likesParams';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  private baseUrl = environment.apiUrl;

  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentuser$.pipe(take(1)).subscribe( user => {
      this.user = user;
      this.userParams = new UserParams(user);
    });
  }

  getUserParams(){
    return this.userParams;
  }

  setUserParam(params: UserParams){
    this.userParams = params;
  }

  resetUserParam(){
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    const response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response){
      return of(response);
    }
    // let params = this.getPaginationHeaders(userParams);
    // params = params.append('minAge', userParams.minAge.toString());
    // params = params.append('maxAge', userParams.maxAge.toString());
    // params = params.append('gender', userParams.gender);
    // const params = this.getHttpParams<UserParams>(userParams);
    return this.getPaginatedResult<Member[], UserParams>(this.baseUrl + 'users', userParams)
                .pipe(
                  tap(resp => this.memberCache.set(Object.values(userParams).join('-'), resp))
                )
    ;
  }

  private getPaginationHeaders({pageNumber, pageSize}){
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

  getMember(username: string) {
    // const member = this.members.find(x => x.username === username);
    // if (member !== undefined){ return of(member); }
    const member = [...this.memberCache.values()]
    .reduce((arr, elem) => arr.concat(elem.result), [])
    .find((m: Member) => m.username === username);

    if (member){
      return of(member);
    }

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member)
    .pipe(
      tap(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number){
    return this.http.put(`${this.baseUrl}users/set-main-photo/${photoId}`, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(`${this.baseUrl}users/delete-photo/${photoId}`);
  }

  addLike(username: string){
    return this.http.post(`${this.baseUrl}likes/${username}`, {});
  }

  getLikes(likesParams: LikesParams){

    return this.getPaginatedResult<Partial<Member[]>, LikesParams>(this.baseUrl + 'likes', likesParams)
                // .pipe(
                //   tap(resp => this.memberCache.set(Object.values(likesParams).join('-'), resp))
                // )
    ;

    // return this.http.get<Partial<Member[]>>(`${this.baseUrl}likes?predicate=${predicate}`, {});
  }


  private getHttpParams<R>(tParams: R): HttpParams{
    let params = new HttpParams();
    for (const prop of Object.keys(tParams)) {
      params = params.append(prop, tParams[prop].toString());
    }
    return params;
  }

  private getPaginatedResult<T, R>(url, rParam) {
    const params = this.getHttpParams<R>(rParam);
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T> ();
    return this.http.get<T>(url, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          paginatedResult.pagination = response.headers.get('Pagination') ? JSON.parse(response.headers.get('Pagination')) : null;
          return paginatedResult;
        })
      );
  }

}
