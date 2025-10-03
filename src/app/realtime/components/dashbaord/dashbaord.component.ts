import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { EmptyComponent } from '../../../shared/components/empty/empty.component';
import { MatDialog } from '@angular/material/dialog';
import { NewsessionComponent } from '../newsession/newsession.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssignserversComponent } from '../assignservers/assignservers.component';
import { SharelinkComponent } from '../sharelink/sharelink.component';
import { Router } from '@angular/router';
import { SetupscreenComponent } from '../setupscreen/setupscreen.component';
import { TranscriptComponent } from '../transcript/transcript.component';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
@Component({
  selector: 'app-dashbaord',
  standalone: true,
  imports: [IconComponent, SetupscreenComponent, TranscriptComponent, CommonModule],
  templateUrl: './dashbaord.component.html',
  styleUrl: './dashbaord.component.scss'
})
export class DashbaordComponent {
  tab: string = 'R';
  sessions: any = [
    {
      'name': 'Session 1',
      'status': 'L',
      'connection': 'L'
    },
    {
      'name': 'Session 2',
      'status': 'E',
      'connection': 'EL'
    },
    {
      'name': 'Session 3',
      'status': 'S',
      'connection': 'S'
    },
  ]

  userInfo: any;

  constructor(private dialog: MatDialog, private router: Router, private store: SecureStorageService) {

  }

  async ngOnInit() {
    this.userInfo = await this.store.getUserInfo();
  }

  newSession() {
    const dialogRef = this.dialog.open(NewsessionComponent,
      {
        width: '630px',
        height: 'fit-content'
      });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  assignserver() {
    const dialogRef = this.dialog.open(AssignserversComponent,
      {
        width: '780px',
        height: 'fit-content'
      });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  link() {
    const dialogRef = this.dialog.open(SharelinkComponent,
      {
        width: '546px',
        height: 'fit-content'
      });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  join() {
    this.router.navigate(['realtime/livefeed']);
  }
}
