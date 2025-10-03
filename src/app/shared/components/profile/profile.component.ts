import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';
import { HttpClientModule } from '@angular/common/http';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent, MatMenuModule, MatTooltipModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  @Input() size: string = 'sm';
  @Input() detail: any;
  @Input() icon: boolean = true;
  @Input() isdark: boolean = false;
  // private uDash: UserdashboardService,
  constructor(private router: Router, public cf: CommonfunctionService, private ss: SecureStorageService) {

  }

  async logOut() {
    // await this.logout.logout()
    this.ss.logOut();
    this.cf.goto('/auth/login');
  }

}
