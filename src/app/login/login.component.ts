import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../services/authentication/authentication.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authService:AuthenticationService) {

  }

  ngOnInit() {

  }

  login(username:string, password:string):void{
    console.log(username + ' ' + password);
    this.authService.login(username, password)
      .then(data => {

      })
  }

}
