import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class AuthenticationService {

  constructor(private http: Http) { }
  private header = new Headers({'Content-Type': 'application/json'});

  login(username: string, password: string):Promise<any>{
    return this.http.post('http://localhost:8080/login', JSON.stringify({email:username, password}), {headers: this.header})
      .toPromise()
      .then(res => {
        localStorage.setItem('token', res.json().data.token);
      })

  }

  register(email: string, password: string):Promise<any>{

    return this.http.post('http://localhost:8080/register', JSON.stringify({email, password}), {headers: this.header})
      .toPromise()
      .then(res => res.json().data);
  }

  resetPassword(email: string):Promise<any>{
    return this.http.post('http://localhost:8080/api/resetpassword', JSON.stringify({email}), {headers:this.header})
      .toPromise()
      .then(res => res.json().data);
  }
}
