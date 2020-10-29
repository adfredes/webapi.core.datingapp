import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  baseUrl = environment.apiUrl;
  private currenUserSource = new ReplaySubject<User>(1);
  currentuser$ = this.currenUserSource.asObservable();

  constructor(private http: HttpClient, private presenceService: PresenceService) { }

  register(model: any){
    return this.http.post(this.baseUrl + 'account/register', model)
              .pipe(
                map((user: User) => {
                  if (user){
                    this.setCurrentUser(user);
                    this.presenceService.createHubConnection(user);
                  }
                  return user;
                })
              )
  }

  login(model: any): Observable<any>{
    return this.http.post(this.baseUrl + 'account/login', model)
      .pipe(
        map( (response: User) => {
          const user = response;
          if (user){
            this.setCurrentUser(user);
            this.presenceService.createHubConnection(user);
          }
        })
      );
  }

  setCurrentUser(user: User): void{
    if (user){
      user.roles = [];
      const roles = this.getDecodedToken(user.token).role;
      Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    }
    localStorage.setItem('user', JSON.stringify(user));
    this.currenUserSource.next(user);
  }


  logout(): void {
    localStorage.removeItem('user');
    this.presenceService.stopHubConnection();
    this.setCurrentUser(null);
  }

  getDecodedToken(token){
    return JSON.parse(atob(token.split('.')[1]));
  }
}
