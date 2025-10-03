import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AssignparticipantComponent } from '../assignparticipant/assignparticipant.component';
import { NewserverComponent } from '../../../core/components/newserver/newserver.component';
import { SessionService } from '../../../shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-assignservers',
  standalone: true,
  providers: [SessionService],
  imports: [CommonModule, ButtonComponent, IconComponent, InputComponent, HttpClientModule],
  templateUrl: './assignservers.component.html',
  styleUrl: './assignservers.component.scss'
})
export class AssignserversComponent {
  servers: any = [
    // {
    //   'name': 'Connection 1',
    //   'url': 'http://stagingetabella.com',
    //   'port': 55
    // },
    // {
    //   'name': 'Connection 2',
    //   'url': 'http://stagingetabella.com',
    //   'port': 56
    // },
    // {
    //   'name': 'Connection 3',
    //   'url': 'http://stagingetabella.com',
    //   'port': 57
    // },

  ]
  permission: string = 'N';
  constructor(private dialog: MatDialog, public sessionService: SessionService, private dialogRefs: MatDialogRef<AssignserversComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.getServers();

  }

  async getServers() {

    let data: any = await this.sessionService.serverList();
    if (data && data.length > 0) {
      this.servers = data;
      if (this.data.permission == 'E') {
        this.permission = 'E';
      }
    }
  }

  assign(x) {
    // this.dialog.closeAll();
    const dialogRef = this.dialog.open(AssignparticipantComponent,
      {
        width: '630px',
        height: 'fit-content',
        data: { server: x, session: this.data }
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRefs.close(true)
      }
    });
  }

  newservers() {

    const dialogRef = this.dialog.open(NewserverComponent,
      {
        width: '600px',
        height: 'fit-content'
      });

    dialogRef.afterClosed().subscribe(result => {

      this.getServers();
    });
  }

  async chooseServer(x) {

    let data: any = await this.sessionService.setServer(this.data.nSesid, x.nRTSid);

    if (data.length > 0) {
      this.sessionService.show(data[0]["value"])
      this.dialogRefs.close(true)

    }
  }



 async assignServer(x) {
    let mdl: any = {
      nCaseid: this.data.nCaseid,
      nSesid: this.data.nSesid,
      nRTSid: x.nRTSid,
      cNotifytype: 'O', //this.isOndate ? 'O' : 'N',
      jUserid: JSON.stringify([])
    }
    let res = await this.sessionService.assignUser(mdl);
    if (res) {
      this.dialogRefs.close(true)
    }
  }

}
