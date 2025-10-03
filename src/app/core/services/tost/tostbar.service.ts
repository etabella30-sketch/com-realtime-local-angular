import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class TostbarService {

  constructor(private snackBar: MatSnackBar) {


  }

  //  openSnackBar(message: string, action: string) {
  //   this.snackBar.open(message, action, {
  //     duration: 2000, // Duration in milliseconds
  //   });
  // }


  openSnackBar(message: string, type?: string, duration?: number) {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { message: message, type: type ? type : '' },
      duration: duration ? duration : 2000,
    });
  }

  error(message) {
    this.openSnackBar(message, 'E');
  }


  success(message) {
    this.openSnackBar(message);
  }
}
