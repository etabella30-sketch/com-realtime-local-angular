import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
import { SessionService } from '../../../shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';
//import { LivefeedComponent } from '../livefeed/livefeed.component';
import { SocketService } from '../../../shared/services/socket.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
//import { Livefeed3Component } from '../livefeed3/livefeed3.component';
import { FileStorageService } from '../../../core/services/upload/file-storage/file-storage.service';
import { CASE_LIST } from '../transcript/transcript.component';
import { CheckDuplicacyService } from '../../../core/services/upload/check-duplicacy/check-duplicacy.service';
import { UploadManagementService } from '../../../core/services/upload/upload-management/upload-management.service';
import { FileSelectionService } from '../../../core/services/upload/file-selection/file-selection.service';
import { UploadService } from '../../../core/services/upload/upload.service';
import { selectedfileMDL } from '../../../core/interfaces/upload.interface';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';

import { FeedDisplayComponent } from '../feed-display/feed-display.component';
import { RealtimeService } from '../../services/realtime/realtime.service';
import { IssueService } from '../../services/issue/issue.service';
import { sessionDetailResponce } from '../../models/issue.interface';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';

@Component({
  selector: 'app-setupscreen',
  standalone: true,
  providers: [SessionService, UploadService, FileSelectionService, FileStorageService, UploadManagementService, CheckDuplicacyService],
  imports: [CommonModule, IconComponent, ButtonComponent, FormsModule, BadgeComponent,
    MatFormFieldModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, EmptyComponent, MatTooltipModule,
    HttpClientModule, NgScrollbarModule, MatMenuModule, FeedDisplayComponent],
  templateUrl: './setupscreen.component.html',
  styleUrl: './setupscreen.component.scss'
})
export class SetupscreenComponent {
  sessions: any = []
  con_logs: any = [];

  @Input() isAdmin: boolean;

  private liveServerSubscription: Subscription;
  private sessionChange: Subscription;
  private logchangeSub: Subscription;
  pageNo: number = 1;
  current_session: any = {};

  private dataSubject = new BehaviorSubject<any>(null);
  dataObservable$ = this.dataSubject.asObservable();
  dDate: Date = this.realtimeService.getCurrentDateWithTimezone(); //new Date();
  dDate2: Date = new Date();
  nUserid: string;
  onInterval: any;
  cSearch: any = '';
  generateRandomString = length => Array.from({ length }, () => (Math.random() * 36).toString(36)[0]).join('');
  previous_session: sessionDetailResponce[] = [];
  current_case: CASE_LIST = {} as CASE_LIST;
  constructor(
    private store1: SecureStorageService,
    private issueServer: IssueService,
    public realtimeService: RealtimeService,
    private dialog: MatDialog, private router: Router, public sessionService: SessionService, public socketService: SocketService,
    private cf: CommonfunctionService,
    private store: FileStorageService) {

  }

  async ngOnInit() {
    this.nUserid = await this.store1.getUserId();
    this.fetchPreviousSessions();
  }

  trackBySessionId(index: number, session: any): any {
    return session.nSesid;
  }

  viewFeed(x) {

    if (this.current_session && this.current_session.nSesid == x.nSesid) {
      // this.current_session = {};
      return;
    }
    // this.current_session = {};
    // if ((x.cStatus == 'R' && x.isConnected) || x.cStatus == 'C') {
    if (this.current_session && this.current_session.nSesid) {
      this.dataSubject.next(this.current_session);
    }
    this.current_session = x;
    this.fetchPreviousSessions();
    // } else {
    //   this.current_session = {};
    // }
  }
  async fetchPreviousSessions() {

    this.previous_session = await this.issueServer.getPreviousSessions(this.current_session.nCaseid, this.nUserid); // await this.issueServer.getPreviousSessions(282, 341)


  }
  async ngAfterViewInit() {

    let cUnicuserid = this.sessionService.getLocalStorage('cUnicuserid');

    if (!cUnicuserid) {
      cUnicuserid = this.generateRandomString(10)
      this.sessionService.setLocalStorage('cUnicuserid', cUnicuserid)
    }
    // await this.sessionService.setLocalUserId(cUnicuserid);
    // }

    // this.socketService.connect();

    this.liveServerSubscription = this.socketService.getLiveServers().subscribe(data => {

      console.log(data);
      if (data && data.msg == 1) {
        this.filterConnectedServers(data.urls)
      }
    });

    this.sessionChange = this.socketService.getSessionChange().subscribe(data => {
      this.getSessions()
    })

    this.logchangeSub = this.socketService.getLogdata().subscribe(data => {
      if (data) {
        if (this.con_logs.findIndex(a => a.nLogid == data.nLogid && data.nLogid != 0) == -1) {
          this.con_logs.unshift(data);
          this.con_logs.sort((a, b) => b.nLogid - a.nLogid)
        }
      }
    })

    this.getSessions(true)
    this.getConnectovityLogs(this.dDate);

  }
  onTabEvent(e) {

    // this.tabBox = e;
    // setTimeout(() => {
    //   this.ispdfactive = true;
    //   this.cdr.detectChanges();
    // }, 100);
    // this.cdr.detectChanges();
  }

  filterConnectedServers(list) {
    this.sessions.map(a => a.isConnected = list.includes(`http://${a.cUrl}:${a.nPort}`));
  }

  async getSessions(isFirsttile?: boolean) {
    let data: any = await this.sessionService.getSessions(this.pageNo);
    if (data && data.length > 0) {

      for (let x of data) {
        // try {

        // // x.dStartDt = x.dStartDt.replace('Z', '')
        // } catch (error) {

        // }
        let objs = this.sessions.find(a => a.nSesid == x.nSesid);
        if (objs) {
          x.isConnected = objs.isConnected;
          x.cStatus = objs.cStatus;
        }
      }

      this.sessions = data;
      if (isFirsttile) {
        this.checkForStatus();
      }
      this.socketService.sendMessage('get-live-servers', { msg: 1 });


      clearInterval(this.onInterval);
      this.checkData();
      this.onInterval = setInterval(() => {
        this.checkData();
      }, 1000)

    }
    this.socketService.sendMessage('refresh-data', { msg: 1 });
  }

  newSession(x?: any) {
    const dialogRef = this.dialog.open(NewsessionComponent,
      {
        width: '630px',
        height: 'fit-content',
        maxHeight: '98vh',
        data: x
      });
    dialogRef.afterClosed().subscribe(result => {
      this.getSessions();
    });
  }

  assignserver(x) {
    const dialogRef = this.dialog.open(AssignserversComponent,
      {
        width: '780px',
        height: 'fit-content',
        data: x
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getSessions()
      }
    });
  }

  link(x) {
    const dialogRef = this.dialog.open(SharelinkComponent,
      {
        width: '546px',
        height: 'fit-content',
        data: x
      });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  join() {


    // this.router.navigate(['realtime/livefeed', this.current_session.nSesid]);
    this.cf.goto('realtime/feed', { nSesid: this.current_session.nSesid, nCaseid: this.current_session.nCaseid })
  }
  OnData(e, tab) {

  }
  ngOnDestroy(): void {
    if (this.liveServerSubscription) {
      this.liveServerSubscription.unsubscribe();
    }
    if (this.logchangeSub) {
      this.logchangeSub.unsubscribe();
    }
    if (this.sessionChange) {
      this.sessionChange.unsubscribe();
    }
  }

  getConnectovityLogs(dDate) {
    try {

      let dt = `${dDate.getFullYear()}-${dDate.getMonth() + 1}-${dDate.getDate()}`;
      this.sessionService.getConLogs(this.pageNo, dt, this.cSearch).then((res) => {
        this.con_logs = [...this.con_logs, ...res];
        console.log(res);
      })
    } catch (error) {

    }
  }


  trackByFn(index: number, item: any): string {
    return item.nLogid; // or any unique identifier for your logs
  }

  getDateName(id) {
    try {
      return this.sessionService.types[id];
    } catch (error) {
      return ''
    }

  }

  onDateChange(e) {

    this.dDate = e.value;
    this.getConnectovityLogs(e.value);
  }

  checkForStatus() {
    setTimeout(() => {
      let objs = this.sessions.find(a => a.cStatus == 'R')
      if (objs) {
        this.viewFeed(objs);
      }
    }, 200);
  }

  checkData() {
    //console.log('Checking for status', this.sessions, new Date())
    this.sessions.map((x) => {
      try {
        // console.warn('DDD',new Date(x["dStartDt"]))
        // if (new Date() >= new Date(x["dStartDt"]) && x.cStatus != 'C' && x.cStatus != 'R') {
        if (this.realtimeService.getCurrentDateWithTimezone() >= new Date(x["dStartDt"]) && x.cStatus != 'C' && x.cStatus != 'R') {
          this.sessions.map(a => a.cStatus = (a.nSesid == x.nSesid ? a.cStatus : (a.cStatus == 'R' ? 'C' : a.cStatus)));
          x.cStatus = 'R';
          this.viewFeed(x);
          this.socketService.sendMessage('refresh-data', { msg: 1 });
        }
      } catch (error) {
      }
    })
  }

  onReachEnd() {
    this.pageNo++;
    this.getConnectovityLogs(this.dDate);
  }

  searchData() {
    this.pageNo = 1;
    this.con_logs = [];
    this.getConnectovityLogs(this.dDate);
  }

  onChenge() {
    if (!this.cSearch || this.cSearch == '')
      this.searchData();
  }

  deleteSession(x, i) {
    this.sessionService.sessionDelete(x.nSesid).then((res) => {
      this.sessions.splice(i, 1);
    })
  }

  endSession(x, i) {
    this.sessionService.sessionEnd(x.nSesid).then((res) => {
      x.cStatus = 'C'
      this.socketService.sendMessage('refresh-data', { msg: 1 });
    })
  }

  updateId(x) {
    // this.isReplace = false;
    this.current_case = x;
    this.store.nCaseid = x.nCaseid;
    this.store.nSectionid = x.nSectionid;
  }

  OnFileSelected(e) {
    /* this.isDragging = true;
     let listData: selectedfileMDL[] = await this.selection.fetchFiles(event);
 
     console.log('listData', listData);
 
     this.isDragging = false;
     // console.log('listData', JSON.stringify(listData));
     if (listData.length) {
       this.store.setSelectedFileStorage(listData)
       // this.dataRecieved.emit('DATA-RECIEVED');
 
       this.finalUpload = await this.checkfile.uploadStructure([], 'A');
 
       console.log('finalUpload', this.finalUpload);
       this.checkDup.checkDuplicacy().then(async (res) => {
         let duplicated = await this.checkDup.isDuplicated(res);
         if (duplicated.length) {
 
           this.store.setSelectedFileStorage([])
           this.tst.openSnackBar('Duplicate file found', 'E')
           // this.tst.openSnackBar('Duplicate file found', 'E')
         } else {
           this.uploadFiles();
         }
       })
     }*/
  }

  async SyncCaseUsers(x) {
    if (x.isSyscing) return;
    x.isSyscing = true;
    try {
      await this.sessionService.sysCaseUsers(x.nSesid, (x.nCaseid || 0))
    } catch (error) {
      // this.cf.alert('Error', error.error.message)
    }
    x.isSyscing = false;
  }


}
