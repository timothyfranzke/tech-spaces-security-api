import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../services/authentication/authentication.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public doPasswordsMatch = false;
  constructor(private authService:AuthenticationService) { }

  ngOnInit() {
  }

  passwordCompare(password: string, confirmPassword: string):void{
     this.doPasswordsMatch = password === confirmPassword;
  }

  register(email: string, password: string, confirmPassword: string):void{
      if(password === confirmPassword)
      {
        this.authService.register(email, password)
          .then(res => console.log(res))
      }
  }
}
