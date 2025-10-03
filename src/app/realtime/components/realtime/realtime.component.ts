import { ChangeDetectorRef, Component } from '@angular/core';
import { FeedDisplayComponent } from '../feed-display/feed-display.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { sessionDataMDL, sessionDetailResponce } from '../../models/issue.interface';
import { IssueService } from '../../services/issue/issue.service';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';

import { RealtimeService } from '../../services/realtime/realtime.service';
import { CommunicationService } from '../../../shared/services/communication/communication.service';
import { Subscription } from 'rxjs';
import { HeaderService } from '../../../core/services/header/header.service';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';

import { tabmodel } from '../../models/annotation.interface';
//import { PreviewComponent } from '../../../shared/components/myfiles/preview/preview.component';
//import { PreviewComponent } from '../../../shared/components/myfiles/preview/preview.component';
//import { RealtimeheaderComponent } from '../realtimeheader/realtimeheader.component';
import { RealtimeheaderComponent } from '../realtimeheader/realtimeheader.component';
import { SocketService } from '../../../shared/services/socket.service';
import { PreviewComponent } from '../../../shared/components/myfiles/preview/preview.component';
// import { PreviewComponent } from '../../../shared/components/myfiles/preview/preview.component';

@Component({
  selector: 'app-realtime',
  standalone: true,
  imports: [FeedDisplayComponent, CommonModule,  RealtimeheaderComponent,PreviewComponent],
  templateUrl: './realtime.component.html',
  styleUrl: './realtime.component.scss'
})
export class RealtimeComponent {

  highlightlevel: number = 0;
  paramsData: any;
  current_session: sessionDataMDL = {} as sessionDataMDL;
  nUserid: string;
  isLoaded: boolean = false;
  isfullscreen: boolean = false;
  ispdfactive: boolean = false;
  previous_session: sessionDetailResponce[] = [];
  nCaseid: string;
  evsubscription: Subscription;

  viewlist: any = [
    {
      "serial": "29",
      "nBundledetailid": '00000000-0000-0000-0000-000000000000', // 'aefcf5ef-9bc2-45e3-b45b-7634b036960c',
      "nBundleid": null,
      "cName": "B6 Procedural Order no. 6.pdf",
      "cTab": null,
      "cExhibitno": null,
      "cPage": "1-22",
      "cRefpage": null,
      "cFilesize": "1961411",
      "cFiletype": "PDF",
      "dIntrestDt": null,
      "cDescription": null,
      "cIscheck": false,
      "cBundletag": "",
      "active": true
    }
  ];
  tabBox: tabmodel | null = null;

  constructor(
    private hs: HeaderService,
    private socket: SocketService,
    private route: ActivatedRoute,
    private router: Router, private issueServer: IssueService,
    private store: SecureStorageService,
    public realtimeService: RealtimeService,
    private cdr: ChangeDetectorRef,
    private cm: CommunicationService,
    public cf: CommonfunctionService,
    ) {


    var params: any = this.route.snapshot.params;
    params = JSON.parse(atob(params["id"]));

    // var params: any = this.route.snapshot.params;
    // params = parseInt(params["id"]);
  
    this.paramsData = params.nSesid;
    this.realtimeService.nSesidL = params.nSesid;
    this.nCaseid = params.nCaseid;

    this.evsubscription = this.cm.functionCalled$.subscribe(async (data) => {
      if (data == 'COMPARE-MODE-CHANGE') {

      }
    })

  }

  OnData(e, tab) {

  }

  async ngOnInit() {
   
    this.nUserid = await this.store.getUserId();
    // if (this.paramsData) {
      this.realtimeService.comparetool = false;
      this.realtimeService.compareMode = false;
    try {

      this.current_session = await this.issueServer.fetchSessionObj(this.paramsData, this.nUserid, this.nCaseid);
      if (!this.paramsData) {
        this.paramsData = this.current_session.nSesid;
        this.realtimeService.nSesidL = this.current_session.nSesid;
      }else{
        this.realtimeService.leftMode = 'L';
      }
      this.current_session.nCaseid = this.current_session.nCaseid ? this.current_session.nCaseid : this.nCaseid;
      if (this.current_session.isTrans) {
        this.realtimeService.leftMode = 'T';
      }else{
        if(this.realtimeService.leftMode!='L'){
          this.realtimeService.leftMode = 'D'
        }
      }

      this.fetchPreviousSessions();
      // }
      this.isLoaded = true;
    } catch (error) {

    }

    try {
      this.hs.caseName = this.current_session.cCasename;
      this.cdr.detectChanges();

    } catch (error) {

    }
    this.cdr.detectChanges();
  }

  async fetchPreviousSessions() {
    this.previous_session = await this.issueServer.getPreviousSessions(this.current_session.nCaseid, this.nUserid)

  }

  fromchild(ev) {
    if (ev.type == 'Full') {
      console.log('full screen', ev.data);
      this.isfullscreen = ev.data;
      console.log('full screen', this.isfullscreen);
    }
  }

  ngOnDestroy(): void {
    if (this.realtimeService.compareMode) {
      this.realtimeService.compareMode = false;
    }
    if (this.evsubscription) {
      this.evsubscription.unsubscribe();
    }
  }


  onTabEvent(e) {
    debugger;
    this.tabBox = e;
    setTimeout(() => {
      this.ispdfactive = true;
      this.cdr.detectChanges();
    }, 100);
    this.cdr.detectChanges();
  }
  activeRealtime(){
    // if(this.tabBox)
    this.ispdfactive=false
  }

  OnEvent(e) {
    if (e.event == 'CLOSE_REALTIME') {
      this.tabBox = null;
      this.cdr.detectChanges();
    }
  }

}