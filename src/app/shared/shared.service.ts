import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  snackBarRef;
  message;
  title;

  constructor(public snackBar: MatSnackBar) {
  }
}
