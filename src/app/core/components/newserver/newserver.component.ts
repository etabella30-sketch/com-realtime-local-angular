import { Component, Inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionService } from '../../../shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-newserver',
  standalone: true,
  providers: [SessionService],
  imports: [InputComponent, ButtonComponent, HttpClientModule, ReactiveFormsModule],
  templateUrl: './newserver.component.html',
  styleUrl: './newserver.component.scss'
})
export class NewserverComponent {
  frm: FormGroup;
  formsubmit: boolean = false;
  isLoading: boolean = false;
  constructor(private formBuilder: FormBuilder, public sessionService: SessionService, private dialogRef: MatDialogRef<NewserverComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.frm = this.formBuilder.group({
      nRTSid: [0],
      cUrl: ['', [Validators.required]],
      nPort: ['', [Validators.required]],
      cName: ['', [Validators.required]],
      permission: ['N']
    });
  }


  submit() {
    this.formsubmit = true;
    if (this.frm.invalid) {
      return;
    }

    this.isLoading = true;
    const mdl = { ...this.frm.value, nUserid: (localStorage.getItem('nUserid') || '0') };
    this.sessionService.addServer(mdl).then((data) => {
      this.isLoading = false;
      this.dialogRef.close();
    }).catch((err) => {
      this.isLoading = false;
    })

  }

  close() {
    this.dialogRef.close();
  }

}
