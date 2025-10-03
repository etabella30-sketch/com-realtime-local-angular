import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SessionService } from '../../../shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-realtimesetting',
  standalone: true,
  providers: [SessionService],
  imports: [InputComponent, MatFormFieldModule, MatSelectModule, CommonModule, ButtonComponent, HttpClientModule, ReactiveFormsModule],
  templateUrl: './realtimesetting.component.html',
  styleUrl: './realtimesetting.component.scss'
})
export class RealtimesettingComponent {
  modes: any = [
    {
      type: 'T',
      name: 'LIVE DATA-TCP/IP FEED'
    }
  ]
  frm: FormGroup;
  localServer: any = {};
  protocols: any[] = [
    { name: 'Case view', value: 'C' },
    { name: 'Bridge view', value: 'B' }
  ];
  isReconnecting: boolean;
  constructor(private formBuilder: FormBuilder, public sessionService: SessionService, private dialog: MatDialog) {
    this.frm = this.formBuilder.group({
      mode: ['T', [Validators.required]],
      ip: ['', [Validators.required]],
      port: ['', [Validators.required]],
      // protocol: ['C', [Validators.required]],
      cUnicuserid: [sessionService.cUnicuserid]
    });
    this.serverDetail();
  }
  async serverDetail() {
    let data = await this.sessionService.fetchLocalServer();
    if (data) {
      this.localServer = data
      this.frm.patchValue(
        {
          mode: this.localServer.mode,
          ip: this.localServer.ip,
          port: this.localServer.port,
          cUnicuserid: this.localServer.cUnicuserid
        }
      );
    }
  }
  async submit(isReconnect?): Promise<void> {
    if (this.frm.invalid) {
      this.sessionService.show('Invalid form')
      return;
    }

    const res = await this.sessionService.saveLocalServer(this.frm.value)
    if (!isReconnect) {
      this.sessionService.show(res["value"])
      this.dialog.closeAll();
    }

  }

  async retry() {
    if (this.isReconnecting)
      return;
    this.isReconnecting = true;
    await this.submit(true);
    setTimeout(() => {
      this.isReconnecting = false;
    }, 200);
  }


}
