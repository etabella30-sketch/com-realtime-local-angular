import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-dialogue',
  standalone: true,
  imports: [CommonModule, ButtonComponent, MatCheckboxModule],
  templateUrl: './dialogue.component.html',
  styleUrl: './dialogue.component.scss'
})
export class DialogueComponent {


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<DialogueComponent>) {
    console.log(data);
  }

  close(res) {
    this.dialogRef.close({ res: res });
  }
}
