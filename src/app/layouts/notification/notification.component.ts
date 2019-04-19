import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  constructor(public sharedService: SharedService) {
  }

  dismissSnackBar() {
    this.sharedService.snackBarRef.dismiss();
  }

  ngOnInit() {
  }

}
