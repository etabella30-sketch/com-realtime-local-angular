import { Component } from '@angular/core';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MatDialog } from '@angular/material/dialog';
import { RealtimesettingComponent } from '../realtimesetting/realtimesetting.component';
import { ServersComponent } from '../servers/servers.component';
import { AssignserversComponent } from '../../../realtime/components/assignservers/assignservers.component';
import { SessionService } from '../../../shared/services/session.service';
import { Router } from '@angular/router';
import { ProfileComponent } from '../../../shared/components/profile/profile.component';
import { SecureStorageService } from '../../services/storage/secure-storage.service';
import { SocketService } from '../../../shared/services/socket.service';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { UrlService } from '../../../services/url.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AvatarComponent, CommonModule, MatMenuModule, IconComponent, ProfileComponent,BadgeComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userdetail: object = {}
  
    // "nUserid": 3,
    // "cEmail": "jaswant@gmail.com",
    // "cFname": "Jaswant",
    // "cLname": "patel",
    // "cProfile": null,
    // "isAdmin": true
  constructor(private dialog: MatDialog, public sessionService: SessionService, private router: Router,public socket:SocketService, private ss: SecureStorageService,public url:UrlService) {

  }
  async ngOnInit() {
    this.userdetail = await this.ss.getUserInfo();
    // console.log('userdetail', this.userdetail);

  }

  isDash() {
    return location.pathname.includes('realtime/dashboard');
  }

  isLivefeed() {
    return location.pathname.includes('realtime/feed');
  }
  settings() {
    const dialogRef = this.dialog.open(RealtimesettingComponent,
      {
        width: '420px',
        height: 'fit-content'
      });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  servers() {
    const dialogRef = this.dialog.open(AssignserversComponent,
      {
        width: '810px',
        height: 'fit-content',
        data: 'N'
      });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  gotohome() {
    // this.router.navigate(['/realtime/dashboard']);

  }

  isDashBord(){
    return location.href.includes('/dashboard')
  }
}
