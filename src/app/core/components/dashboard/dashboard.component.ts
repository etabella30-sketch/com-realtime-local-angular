import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { UserDetail } from '../../../core/interfaces/login.interface';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ProfileComponent } from '../../../shared/components/profile/profile.component';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Subject } from 'rxjs';
import { SocketService } from '../../../core/services/socket/socket.service';
import { NgScrollReached } from 'ngx-scrollbar/reached-event';
import { IssueService } from '../../../realtime/services/issue/issue.service';
import { environment } from '../../../../environments/environment';
import { Title } from '@angular/platform-browser';
import { CasecardComponent } from '../../../shared/components/casecard/casecard.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
  imports: [CommonModule, ButtonComponent, CasecardComponent, IconComponent, ProfileComponent, SkeletonComponent, NgScrollbarModule, NgScrollReached],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private titleS = inject(Title);
  @ViewChild('parent') parent!: ElementRef;
  userdetail: UserDetail;
  loding: boolean = true;
  isNextLoading: boolean = false;
  reached: string = 'S';
  nPageNumber: number = 1;
  isNoMoreData: boolean = false;
  nTicketCaseId: number = 0;
  onTicketChange: Subject<number> = new Subject();
  isRealtimUser: boolean = false;

  caselist: any[] = [
    {
      "nCaseid": 1139,
      "cCasename": "Roshan test",
      "cCaseno": "123456",
      "dUpdateDt": "2025-06-16T07:07:15.067Z",
      "jPermission": null
    },
    {
      "nCaseid": 1091,
      "cCasename": "eBundle Demo Case",
      "cCaseno": "ABC 123/2001",
      "dUpdateDt": "2025-06-16T06:52:11.759Z",
      "jPermission": null
    },
    {
      "nCaseid": 1159,
      "cCasename": "Primetals Technologies India Pvt Ltd v Steel Authority of India Ltd et al.",
      "cCaseno": "ICC Case 27146/HTG",
      "dUpdateDt": "2025-06-13T15:09:20.983Z",
      "jPermission": null
    },
    {
      "nCaseid": 1165,
      "cCasename": "Test case",
      "cCaseno": "080425",
      "dUpdateDt": "2025-06-13T07:34:23.672Z",
      "jPermission": null
    },
    {
      "nCaseid": 1163,
      "cCasename": "Nurol LLC OPC v National Investment Corporation (PJSC)",
      "cCaseno": "ADCCAC Case No. 35-2022",
      "dUpdateDt": "2025-06-02T06:31:30.777Z",
      "jPermission": null
    },
    {
      "nCaseid": 1131,
      "cCasename": "Specon LLC v Ssangyong Engineering & Construction Co. Ltd (Dubai Branch); and Be",
      "cCaseno": "DIAC Case No. 220063",
      "dUpdateDt": "2025-05-27T12:35:09.199Z",
      "jPermission": null
    },
    {
      "nCaseid": 1150,
      "cCasename": "maruti test case",
      "cCaseno": "9509",
      "dUpdateDt": "2025-05-23T04:39:29.755Z",
      "jPermission": null
    },
    {
      "nCaseid": 1047,
      "cCasename": "Demo v Presentation",
      "cCaseno": "ABC 123/2023",
      "dUpdateDt": "2025-04-23T05:00:13.271Z",
      "jPermission": null
    },
    {
      "nCaseid": 1043,
      "cCasename": "ALPHA DEVELOPER 07",
      "cCaseno": "420",
      "dUpdateDt": "2025-04-08T09:19:16.743Z",
      "jPermission": null
    },
    {
      "nCaseid": 1157,
      "cCasename": "Real Time Testing",
      "cCaseno": "0703251.1",
      "dUpdateDt": "2025-04-01T15:56:27.659Z",
      "jPermission": null
    }
  ];
  constructor(private socket: SocketService, private ss: SecureStorageService, @Inject(Router) private router: Router, private cf: CommonfunctionService, private cd: ChangeDetectorRef,
    private realtimeIssue: IssueService) {

  }


  async ngOnInit() {
    this.titleS.setTitle('Dashboard');
    this.socket.getNotification().subscribe(data => {

    });

    this.userdetail = await this.ss.getUserInfo();

    this.caselist = this.caselist;


    this.loding = false;
    this.cd.detectChanges();
  }










  async onReachEnd() {
    if (this.loding || this.isNoMoreData) {
      return;
    }
    this.loding = true;
    try {
      const nextPageNumber = this.nPageNumber + 1;
      const nextList = [];
      if (nextList.length) {
        this.caselist = [...this.caselist, ...nextList];
        this.nPageNumber = nextPageNumber;
      } else {
        this.isNoMoreData = true;
      }
    } catch (error) {
      console.error('Error fetching the next page of the dashboard list', error);
    } finally {
      this.loding = false;
      this.cd.detectChanges();
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin/dashboard']);
  }

  onScroll(flag) {
    this.reached = flag;
  }
  onScroll2(flag, ev) {
    const threshold = 10;
    const element = ev.target;
    const scrollTop = element.scrollLeft;
    const scrollHeight = element.scrollWidth;
    const clientHeight = element.clientWidth;

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      this.reached = 'E';  // Close to the end
    } else if (scrollTop === 0) {
      this.reached = 'S';  // At the start
    } else {
      this.reached = 'M';  // In the middle
    }
  }

  viewTicket(e, x) {

    if (e == 'VIEW-TICKET') {
      if (this.nTicketCaseId == x.nCaseid) {
        this.nTicketCaseId = 0;
        return;
      }
      let isEmit = false;
      if (this.nTicketCaseId) {
        isEmit = true;
      }
      this.nTicketCaseId = x.nCaseid;
      setTimeout(() => {
        this.parent.nativeElement.scrollTo({ top: 500, behavior: 'smooth' });
      }, 100);
      if (isEmit) {
        this.onTicketChange.next(x.nCaseid)
      }
    } else if (e == 'REAL-TIME') {
      // if (x.nSesid) {


      // if(x.nSesid){
      //   this.realtimeIssue.insertLog(x.nSesid,this.userdetail.nUserid,'J')
      // }

      this.cf.goto('realtime/feed', { nSesid: x.nSesid ? x.nSesid : 0, nCaseid: x.nCaseid })
      // }

    }
  }


  gotoRealtime() {
    this.cf.goto('realtime/feed')
  }

}