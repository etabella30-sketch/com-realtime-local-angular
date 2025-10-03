import { Component, Inject, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarActions, MatSnackBarRef } from '@angular/material/snack-bar';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [MatSnackBarActions, MatSnackBarAction, IconComponent,CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {

  }

  snackBarRef = inject(MatSnackBarRef);
}
