import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { MatDialog } from '@angular/material/dialog';
import { NewserverComponent } from '../newserver/newserver.component';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, InputComponent],
  templateUrl: './servers.component.html',
  styleUrl: './servers.component.scss'
})
export class ServersComponent {
  servers: any = [
    {
      'name': 'Connection 1',
      'url': 'http://stagingetabella.com',
      'port': 55
    },
    {
      'name': 'Connection 2',
      'url': 'http://stagingetabella.com',
      'port': 56
    },
    {
      'name': 'Connection 3',
      'url': 'http://stagingetabella.com',
      'port': 57
    },

  ]


  constructor(private dialog: MatDialog) {

  }



  newservers() {
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(NewserverComponent,
      {
        width: '600px',
        height: 'fit-content'
      });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
