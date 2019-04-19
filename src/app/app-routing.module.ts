import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { ListComponent } from './layouts/list/list.component';
import { AccountComponent } from './layouts/account/account.component';
import { ProfilesComponent } from './layouts/profiles/profiles.component';


const routes: Routes = [
  {
    path: '', component: HomeComponent,
  }, {
    path: 'list', component: ListComponent,
  }, {
    path: 'account', component: AccountComponent,
  }, {
    path: 'profiles', component: ProfilesComponent,
  }, {
    path: '**', redirectTo: ''
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
