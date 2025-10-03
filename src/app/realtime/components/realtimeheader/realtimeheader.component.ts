
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
//import { UserDetail } from '../../../core/interfaces/login.interface';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { HeaderService } from '../../../core/services/header/header.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CommunicationService } from '../../../shared/services/communication/communication.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RealtimeService } from '../../services/realtime/realtime.service';
import { UserDetail } from '../../../core/interfaces/login.interface';

@Component({
  selector: 'app-realtimeheader',
  standalone: true,
  imports: [CommonModule, AvatarComponent, ButtonComponent, IconComponent,MatTooltipModule],
  templateUrl: './realtimeheader.component.html',
  styleUrl: './realtimeheader.component.scss'
})
export class RealtimeheaderComponent {
  userdetail: UserDetail;
  isDemoStarted: boolean = false;
  constructor(private ss: SecureStorageService,public realtimeservice:RealtimeService, public hs: HeaderService, private router: Router, private cs: CommunicationService) {

  }
  
  Demo() {
    if (this.isDemoStarted) {
      this.cs.callFunction({ event: 'STOP-DEMO', flag: true });
      this.isDemoStarted = false;
    } else {
      this.cs.callFunction({ event: 'START-DEMO', flag: true });
      this.isDemoStarted = true;
    }
  }

  async ngOnInit() {
    this.userdetail = await this.ss.getUserInfo();
  }

  gohome() {
    this.hs.goUserHome();
  }

}