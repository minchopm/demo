import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-localstorage';
import { SharedService } from './shared.service';
import { NotificationComponent } from '../layouts/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  profiles: any = [];

  constructor(private storageService: LocalStorageService, public sharedService: SharedService) {
  }

  getProfiles() {
    return JSON.parse(this.storageService.get('profiles') || '[]');
  }

  showSnack(title = '', message = '') {
    this.sharedService.title = title;
    this.sharedService.message = message;
    this.sharedService.snackBarRef = this.sharedService.snackBar.openFromComponent(NotificationComponent, {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    } as any);
  }

  addProfiles(profiles) {
    this.storageService.set('profiles', JSON.stringify(profiles));
  }

  createUser(user: any) {
    this.profiles.push(user);
    this.addProfiles(this.profiles);
    this.showSnack('Success', `User ${user.username} has been added`);
    console.log('User Name: ' + user.username);
    console.log('Password: ' + user.password);
    console.log('Email: ' + user.email);
    console.log('Subscribe: ' + user.subscribe);
  }
}
