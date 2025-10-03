import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { ButtonComponent } from '../button/button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { IconComponent } from '../icon/icon.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';
import { MatMenuModule } from '@angular/material/menu';
import { HeaderService } from '../../../core/services/header/header.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'casecard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AvatarComponent, ButtonComponent, MatTooltipModule, ScrollingModule, IconComponent, NgScrollbarModule, MatMenuModule, RouterLink],
  templateUrl: './casecard.component.html',
  styleUrl: './casecard.component.scss'
})

export class CasecardComponent {
  @Output() caseChange: EventEmitter<string> = new EventEmitter();
  @Input() ticketOpen: boolean = false;
  @Input() detail: any;
  @Input() isAdmin: boolean = false;
  @Input() ticketCount: number = 0;
  @Input() nSesid: number = 0;
  @Input() isArchive: boolean;

  nMyroleid: number = 0;
  isCaseAdmin: boolean;
  isCanePresent: boolean;
  nUserid: number;
  isCanRealtime: boolean = false;
  isCanView: boolean = false;
  constructor( private ss: SecureStorageService,
    private cm: CommonfunctionService, private cd: ChangeDetectorRef, private hs: HeaderService, private route: Router) {

  }

  async ngAfterViewInit() {
   
    this.cd.detectChanges();
  }

  editCase() {
    this.caseChange.emit('EDIT');
  }

  realTime() {
    this.caseChange.emit('REAL-TIME');
  }


  goToBundleManage() {
    this.cm.goto('managefiles/bundlemanagement', { id: this.detail.nCaseid })
  }


  goToRealtimeLog() {
    this.cm.goto('realtimelog', { id: this.detail.nCaseid })
  }

  viewTicket() {
    this.caseChange.emit('VIEW-TICKET');
  }

  upedte_archiveCase() {
    if (this.isArchive) {
      this.caseChange.emit('ARCHIVE-FALSE');
    } else {
      this.caseChange.emit('ARCHIVE-TRUE');
    }
  }
  goToAdmin() {
    this.cm.goto('/casebuilder/casecreation', { id: this.detail.nCaseid })
  }

  async goToCase() {
    this.cm.goto('/myfiles/filesaction', { id: this.detail.nCaseid })
  }

 

}
