import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';
import { SelectLanguageComponent } from './select-language/select-language.component';
import { ChangeUserInfoComponent } from './change-user-info/change-user-info.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    pathMatch: 'full'
  },
  {
    path: 'chat',
    component: MainComponent,
    pathMatch: 'full'
  },
  {
    path: 'select-language',
    component: SelectLanguageComponent,
    pathMatch: 'full'
  },
  {
    path: 'change-user-info',
    component: ChangeUserInfoComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
