import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {RegisterComponent} from './register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'resetPassword', component: ResetPasswordComponent},
  { path: 'register', component: RegisterComponent},
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
 // { path: 'path/:routeParam', component: MyNewComponentComponent },

];
