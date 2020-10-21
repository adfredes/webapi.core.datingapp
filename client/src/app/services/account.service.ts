import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  baseUrl = environment.apiUrl;
  private currenUserSource = new ReplaySubject<User>(1);
  currentuser$ = this.currenUserSource.asObservable();

  constructor(private http: HttpClient) { }

  register(model: any){
    return this.http.post(this.baseUrl + 'account/register', model)
              .pipe(
                map((user: User) => {
                  if (user){
                    this.setCurrentUser(user);
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
          }
        })
      );
  }

  setCurrentUser(user: User): void{
    localStorage.setItem('user', JSON.stringify(user));
    this.currenUserSource.next(user);
  }


  logout(): void {
    localStorage.removeItem('user');
    this.setCurrentUser(null);
  }
}
