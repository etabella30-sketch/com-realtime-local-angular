import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeedDisplayService } from '../../services/feed-display.service';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { hylightMD, sessionDetailResponce } from '../../models/issue.interface';
import { RealtimeService } from '../../services/realtime/realtime.service';
import { ColorpickerComponent } from '../../../shared/components/colorpicker2/colorpicker/colorpicker.component';
import { CommunicationService } from '../../../shared/services/communication/communication.service';
import { IssueService } from '../../services/issue/issue.service';
import { SessionService } from '../../../shared/services/session.service';
import { Subject } from 'rxjs';
import { AnnotationService } from '../../services/annotation/annotation.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IssuemodelComponent } from '../issues/issuemodel/issuemodel.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, SearchBarComponent, BadgeComponent, MatCheckboxModule, FormsModule, MatMenuModule, ColorpickerComponent, MatSelectModule, MatTooltipModule, NgScrollbarModule, IssuemodelComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() sessionDetails: any;
  @Input() itemSize: number = 0;
  @Input() feedData: any = [];
  @Input() current_session: any = {};
  @Input() previous_session: sessionDetailResponce[] = [];
  @Input() nSesid: string = null;
  @Input() tab: any;

  issueList: any = [];
  currentIssueColor: any;
  // nSelectedsessionId: number = 0;
  zoomLevel = 1;
  showtoolbar: boolean = false;
  intSesid: number = 0;
  handtool: boolean = false;
  comparetool: boolean = false;
  selectedcompare: any = 'L';
  fullscreen: boolean = false;
  @Input() nCaseid: any;
  @Input() nUserid: any;

  @Output() toolabarclick = new EventEmitter<any>();
  @Input() mode: any = 'L';
  currentzoom: any = 1;
  @Input() onViewerEvent: Subject<any>;
  cClr: any = 'ffe600';
  highlightmode: hylightMD = false;
  opencolor: boolean = false;
  selectedFont: any = { name: 'Open Sans', text: 'Default' };
  fonts: any = [
    { name: 'Open Sans', text: 'Default' },
    { name: 'arial', text: 'Arial' },
    { name: 'verdana', text: 'Verdana' },
    { name: 'times', text: 'Times new roman' },
    { name: 'georgia', text: 'Georgia' }
  ];

  compare: any = [
    { name: 'Live Feed', value: 'L' },
    { name: 'Live to Transcript', value: 'LT' },
    { name: 'Live to Draft', value: 'LD' },
    { name: 'Transcript to Transcript', value: 'TT' },
    { name: 'Draft to Draft', value: 'DD' },
    { name: 'Draft to Transcript', value: 'DT' }
  ];

  compareL: any = [
    { name: 'Livefeed', value: 'L' },
    { name: 'Transcript', value: 'T' },
    { name: 'Draft', value: 'D' },
  ];

  compareR: any = [
    { name: 'Transcript', value: 'T' },
    { name: 'Draft', value: 'D' },
  ];

  // selectedCompareL: any;
  // selectedCompareR: any;

  // compareL: any = [
  //   { name: 'Live', value: 'L' },
  //   { name: 'Transcript', value: 'T' },
  //   { name: 'Draft', value: 'D' },
  // ];

  // compareR: any = [
  //   { name: 'Live', value: 'L' },
  //   { name: 'Transcript', value: 'T' },
  //   { name: 'Draft', value: 'D' },
  // ];
  highlightCheckbox: boolean = true;
  annotationCheckbox: boolean = false;
  evsubscription: any;


  zoom: any = [
    { name: 0.50, text: '50' },
    { name: 0.75, text: '75' },
    { name: 1, text: '100' },
    { name: 1.25, text: '125' },
    { name: 1.5, text: '150' },
    { name: 1.75, text: '175' },
    { name: 2, text: '200' },
    { name: 2.25, text: '225' },
    { name: 2.5, text: '250' },
    { name: 2.75, text: '275' },
    { name: 3, text: '300' }
  ]


  async ngOnChanges(changes: SimpleChanges) {
    if (changes['current_session'] && this.current_session) {
      if (this.current_session?.nCaseid) {
        this.initIssues()
      }

      // if (!this.sessionsList?.length) {
      //   this.sessionsList = await this.sessionService.getSessions(1);
      // }
    }
    this.checkData();
    //   if (this.current_session && this.current_session.cStatus && this.current_session.cStatus != 'C') {
    //     
    //     const newObject = { name: 'Live Feed', value: 'L' };
    //     const exists = this.compareL.some(item => item.value === newObject.value);

    //     if (!exists) {
    //       this.compareL.unshift(newObject);
    //     }
    //   }
    // }
  }


  public pausedState: boolean = false;
  isStopingdemostream: boolean = false;
  sessionsList: any = [];
  constructor(private cdr: ChangeDetectorRef, private issueService: IssueService, public fds: FeedDisplayService, private annotService: AnnotationService,
    private router: Router, private route: ActivatedRoute, public realtimeService: RealtimeService, private cs: CommunicationService, public sessionService: SessionService) {
    this.checkData();
    try {
      this.pausedState = this.fds.pausedState;
      var params: any = this.route.snapshot.params;
      params = JSON.parse(atob(params["id"]));
      this.intSesid = params.nSesid;
    } catch (error) {

    }
    //  alert(1)
  }

  GoonPage(pg) {
    let pageind: any = parseInt(pg.target.value) - 1;//+ 1;
    // this.scrollToPage.emit(pageind);
    this.toolabarclick.emit({ "type": 'ToPage', "data": pageind });
  }

  onToggleTimestamp() {
    this.toolabarclick.emit({ "type": 'Timestamp', "data": '' });
  }

  onOpenLiveFeedDialog() {
    this.toolabarclick.emit({ "type": 'LiveDialog', "data": '' });
  }

  onPerformAnnotation() {
    this.toolabarclick.emit({ "type": 'Annotation', "data": '' });
  }

  onPerformExport() {
    this.toolabarclick.emit({ "type": 'Export', "data": '' });
  }

  async ngOnInit() {
    try {
      if (this.onViewerEvent) {
        this.onViewerEvent.subscribe((e) => {
          this.checkData();
        });
      }
    } catch (error) {

    }

    this.checkData();
    this.realtimeService.selectedCompare$.subscribe(value => {
      // if (value !== null) {
      //   this.realtimeService.selectedCompare$ = value;
      // }
    });
    this.initSubscribe();
    this.current_session;
    // console.info('INFO OF SESSION',,data)
  }

  async checkData() {
    console.info('INFO OF SESSION', this.current_session, this.sessionsList)
    this.sessionsList = await this.sessionService.getSessions(1);
    this.sessionsList.map((x) => {
      try {
        if (new Date() >= new Date(x["dStartDt"]) && x.cStatus != 'C' && x.cStatus != 'R') {
          this.sessionsList.map(a => a.cStatus = (a.nSesid == x.nSesid ? a.cStatus : (a.cStatus == 'R' ? 'C' : a.cStatus)));
          // x.cStatus = 'R';
          console.info('SESSION LIVED', x, this.current_session)
          if (x.nSesid == this.current_session.nSesid) {
            console.info('SESSION LIVED', x)
            this.current_session.cStatus = 'R';
            console.log(this.current_session)
            this.cdr.detectChanges();

          }
        }
      } catch (error) {

      }
    })
    this.cdr.detectChanges();
  }

  changeTranscript(x) {
    this.realtimeService.nSesidL = x.nSesid;
    this.cdr.detectChanges();
  }

  resumePause() {
    this.fds.resumePause();
    // this.pausedState = false;
    // this.feedData = [...this.pausedData];
    // this.pausedData = [];
    this.cdr.detectChanges();
  }

  pauseEvent() {
    this.fds.pauseEvent();
    // this.pausedState = true;
    // this.pausedData = [...this.feedData];
    this.cdr.detectChanges();
  }

  menucose() {
    this.toolabarclick.emit({ "type": 'ColorChange', "data": this.cClr });
    this.cdr.detectChanges();
  }

  zoomIn() {
    this.currentzoom = Math.min(this.currentzoom + 0.25, 3);
    this.toolabarclick.emit({ "type": 'Zoom', "data": this.currentzoom });
  }

  zoomOut() {
    this.currentzoom = Math.max(this.currentzoom - 0.25, 0.5); // Limit min zoom level to 0.1
    this.toolabarclick.emit({ "type": 'Zoom', "data": this.currentzoom });
  }

  zoomlevel(ev) {
    this.toolabarclick.emit({ "type": 'Zoom', "data": ev.value });
  }

  selectfont(x) {
    this.selectedFont = x;

    this.toolabarclick.emit({ "type": 'FontChange', "data": this.selectedFont });
  }
  openissue() {
    this.realtimeService.issueOpened = true;
    this.toolabarclick.emit({ "type": 'Issue', "data": true });
  }

  /*modechange(flag) {
    this.highlightmode = flag;
    this.toolabarclick.emit({ "type": 'ModeChange', "data": this.highlightmode });
  }*/

  activehand() {
    this.handtool = !this.handtool;
    this.toolabarclick.emit({ "type": 'hand', "data": this.handtool });
  }

  goback() {
    this.router.navigate(['user/dashboard']);
  }




  onSelection(nSesdata, side, inSideCompare?) {





    if (side == 1) {
      let NewnSesdata = nSesdata;
      NewnSesdata.mode = this.realtimeService.selectedcompareL;
      this.realtimeService.updateNSesidL(NewnSesdata);
      this.cdr.detectChanges();
      if (this.realtimeService.compareMode) {
        this.realtimeService.setCompare({ 'L': NewnSesdata, 'R': this.realtimeService.nSesdataR, 'change': 'L' });
      }

      try {
        if (inSideCompare) {
          this.toolabarclick.emit({
            "type": 'RelatimeChange',
            "data":
            {
              session: NewnSesdata,
              type: side
            },
          });
        }
      } catch (error) {

      }
    }
    if (side == 2) {

      let NewnSesdata = nSesdata;
      NewnSesdata.mode = this.realtimeService.selectedcompareR;
      this.realtimeService.updateNSesidR(NewnSesdata);
      this.cdr.detectChanges();
      if (this.realtimeService.compareMode) {
        this.realtimeService.setCompare({ 'L': this.realtimeService.nSesdataL, 'R': NewnSesdata, 'change': 'R' });
      }

      try {

        if (inSideCompare) {
          this.toolabarclick.emit({
            "type": 'RelatimeChange',
            "data":
            {
              session: NewnSesdata,
              type: side
            },
          });
        }
      } catch (error) {

      }

    }
    this.checkAllSelected();
  }


  onSelectionIndividual(event, side, inSideCompare?) {





    if (side == 1) {

      try {
        if (inSideCompare) {
          this.toolabarclick.emit({
            "type": 'RelatimeChange',
            "data":
            {
              session: event.value,
              type: side
            },
          });
        }
      } catch (error) {

      }
    }
    if (side == 2) {


      try {

        if (inSideCompare) {
          this.toolabarclick.emit({
            "type": 'RelatimeChange',
            "data":
            {
              session: event.value,
              type: side
            },
          });
        }
      } catch (error) {

      }



    }
    // this.checkAllSelected();
  }

  // onSelectionL(nSesid) {

  //   this.toolabarclick.emit({ "type": 'RelatimeChange', 
  //     "data": 
  //     {
  //       session : this.previous_session.find(x => x.nSesid == nSesid),
  //       type: flag
  //     },
  //    });
  // }

  onDataClick(x) {

    // this.realtimeService.selectedcompare = x.value;
    // this.toolabarclick.emit({ "type": 'COMPARE', "data": x.value });
    if (x.value == 'L') {
      this.realtimeService.compareMode = false;
      this.realtimeService.leftMode = 'L';
      this.realtimeService.rightMode = 'T';
      this.realtimeService.tab = 1;
    } else {
      this.realtimeService.tab = 2;
      this.realtimeService.compareMode = true;
    }
    if (x.value == 'LT') {
      this.realtimeService.leftMode = 'L';
      this.realtimeService.rightMode = 'T';
    } else if (x.value == 'LD') {
      this.realtimeService.leftMode = 'L';
      this.realtimeService.rightMode = 'D';
    } else if (x.value == 'TT') {
      this.realtimeService.leftMode = 'T';
      this.realtimeService.rightMode = 'T';
    } else if (x.value == 'DD') {
      this.realtimeService.leftMode = 'D';
      this.realtimeService.rightMode = 'D';
    } else if (x.value == 'DT') {
      this.realtimeService.leftMode = 'D';
      this.realtimeService.rightMode = 'T';
    }
  }


  startcomapre() {
    debugger;
    if (!this.checkAllSelected()) return;
    this.realtimeService.tab = 2;

    this.realtimeService.leftMode = this.realtimeService.selectedleftMode;
    this.realtimeService.rightMode = this.realtimeService.selectedrightMode;

    this.realtimeService.nSesidL = this.realtimeService.nSelectedSesidL;
    this.realtimeService.nSesidR = this.realtimeService.nSelectedSesidR;
    this.realtimeService.comparetool = false;
    this.realtimeService.compareMode = true;
    setTimeout(() => {
      this.fds.resumePause();
    }, 1000);
    // if (this.realtimeService.leftMode == 'L') {
    //   this.realtimeService.nSesidL = this.checkLiveOrLastSession();
    // }

    this.cdr.detectChanges();
    return;
    if (this.realtimeService.selectedcompareL == 'L') {
      let NewnSesdata = this.realtimeService.nSesdataL;
      NewnSesdata.mode = this.realtimeService.selectedcompareL;
      this.realtimeService.updateNSesidL(NewnSesdata);
      this.realtimeService.setCompare({ 'L': this.realtimeService.nSesdataL, 'R': this.realtimeService.nSesdataR, 'change': 'R' });
    } else {
      let NewnSesdataL = { ...this.realtimeService.nSesdataL };
      let NewnSesdataR = { ...this.realtimeService.nSesdataR };
      NewnSesdataL.mode = this.realtimeService.selectedcompareL;
      NewnSesdataR.mode = this.realtimeService.selectedcompareR;
      this.realtimeService.setCompare({ 'L': NewnSesdataL, 'R': NewnSesdataR, 'change': 'A' });
      this.cdr.detectChanges();
    }
    this.realtimeService.comparetool = false;
    this.cdr.detectChanges();
  }

  async opencompare() {
    debugger;
    if (this.current_session && this.current_session.cStatus && this.current_session.cStatus != 'C') {
      this.realtimeService.updateNSesidL('');
    } else {
      let curuntses = this.previous_session.find(x => x.nSesid == this.current_session.nSesid);
      this.realtimeService.updateNSesidL(curuntses);
      this.realtimeService.nSelectedSesidL = this.current_session.nSesid;
      // this.realtimeService.selectedcompareL = this.compareL[1].value;
      this.cdr.detectChanges();
    }
    this.realtimeService.comparetool = !this.realtimeService.comparetool;

    this.realtimeService.nSelectedSesidL = await this.checkLiveSession();
    if (this.realtimeService.nSelectedSesidL == 0) {
      this.realtimeService.nSelectedSesidL = this.current_session.nSesid;
      this.realtimeService.selectedleftMode = 'D';
    }
    this.cdr.detectChanges();
  }


  fllscreen() {
    this.realtimeService.fullscreen = !this.realtimeService.fullscreen;
    this.realtimeService.showtoolbar = false;
    this.toolabarclick.emit({ "type": 'FUll', "data": true });
  }

  menuopen() {
    this.opencolor = true;
  }


  clearSelection() {
    try {
      const sel = window.getSelection?.();
      if (sel) {
        // modern browsers
        sel.removeAllRanges();
      } else if ((document as any).selection) {
        // IE ≤ 11
        (document as any).selection.empty();
      }
    } catch (error) {

    }
  }
  highlightermode(ev, flag, isChangeemit?) {

    this.clearSelection()
    if (flag == 'H') {
      this.annotationCheckbox = false;
      this.highlightmode = ev.checked ? 'H' : false;
    } else {
      this.highlightCheckbox = false;
      this.highlightmode = ev.checked ? 'I' : false;

      const lastIsid = this.annotService.getAnnotLastIssue();
      // if (!lastIsid?.nIid) {
      //   this.toolabarclick.emit({ "type": 'Hissue', "data": this.highlightmode });
      // }

    }



    this.cdr.detectChanges();
    if (!isChangeemit)
      this.toolabarclick.emit({ "type": 'ModeChange', "data": this.highlightmode });

  }

  slctHissue(chk, flag) {

    if (flag == 'I')
      this.annotationCheckbox = true;
    else
      this.highlightCheckbox = true;

    this.highlightermode({ checked: (flag == 'I' ? this.annotationCheckbox : this.highlightCheckbox) }, flag); //this.highlightmode = !this.highlightmode;
    this.cdr.detectChanges();
    // this.toolabarclick.emit({ "type": 'ModeChange', "data": true });
    // this.toolabarclick.emit({ "type": 'Hissue', "data": this.highlightmode });
  }


  async comparechange(ev, side) {

    // this.realtimeService.leftMode = side == 'L' ? ev.value : this.realtimeService.leftMode;
    // this.realtimeService.rightMode = side == 'R' ? ev.value : this.realtimeService.rightMode;

    // this.cm.callFunction({ event: 'COMPARE-MODE-CHANGE'});
    return;
    if (side == 'L') {
      this.realtimeService.updateCompareL(ev.value);
    } else {
      this.realtimeService.updateCompareR(ev.value);
    }
    this.checkAllSelected();
  }

  async clscmpre() {

    this.realtimeService.compareMode = false;
    this.realtimeService.tab = 1
    this.current_session = await this.issueService.fetchSessionObj(0, this.nUserid, this.nCaseid);
    if (this.current_session.isTrans) {
      this.realtimeService.leftMode = 'T';
    } else {

      this.realtimeService.leftMode = 'D';
    }

    // this.realtimeService.nSesidL = await this.checkLiveOrLastSession();
    // 
    // this.toolabarclick.emit({ "type": 'CLOSE-COMP', "data": true });
  }


  async checkLiveSession(): Promise<any> {

    let currentSesid: any = null; try {
      const data = await this.issueService.getLiveSessionByCaseid(this.nCaseid, this.nUserid)
      if (data.length) {
        currentSesid = data[0]["nSesid"]
      }
    } catch (error) {
      currentSesid = null;
    }
    return currentSesid
  }

  async checkLiveOrLastSession() {

    let currentSesid: any = null;
    currentSesid = await this.checkLiveSession();

    if (!currentSesid) {
      // const sortList = this.previous_session.sort((b, a) => a.nSesid - b.nSesid)
      // if (sortList.length) {
      //   currentSesid = this.intSesid;
      // }
      ;
    }
    return currentSesid; // this.realtimeService.nSesidL;
  }

  checkAllSelected(): boolean {

    return (this.realtimeService.selectedleftMode && this.realtimeService.selectedrightMode && this.realtimeService.nSelectedSesidL && this.realtimeService.nSelectedSesidR) ? true : false;

    const isLeftCompareSelected = this.realtimeService.selectedleftMode !== undefined && this.realtimeService.selectedleftMode !== null;
    const isRightCompareSelected = this.realtimeService.selectedrightMode !== undefined && this.realtimeService.selectedrightMode !== null;
    let isLeftDataSelected = false;
    if (this.realtimeService.selectedleftMode === 'L') {
      isLeftDataSelected = true;
    } else if (this.realtimeService.selectedleftMode && this.realtimeService.selectedleftMode !== 'L') {
      isLeftDataSelected = this.realtimeService.nSesdataL !== undefined && this.realtimeService.nSesdataL !== null;
    }
    const isRightDataSelected = this.realtimeService.nSesdataR !== undefined && this.realtimeService.nSesdataR !== null;
    return isLeftCompareSelected && isRightCompareSelected && isLeftDataSelected && isRightDataSelected;
  }


  openPathInNewTab() {

    const path = '/realtime/feed/';
    let params: any;
    if (this.tab == 1) {
      params = { "nSesid": this.realtimeService.nSesidL, "nCaseid": this.current_session.nCaseid };
    }
    if (this.tab == 2) {
      params = { "nSesid": this.realtimeService.nSesidR, "nCaseid": this.current_session.nCaseid, m: 'T' };
    }
    this.openInNewTab(path, params);
  }

  onSelectionOld(nSesid) {


    this.toolabarclick.emit({
      "type": 'RelatimeChange',
      "data":
      {
        session: this.previous_session.find(x => x.nSesid == nSesid),
        type: this.tab
      },
    });
    // this.toolabarclick.emit({ "type": 'RelatimeChange', "data": this.previous_session.find(x => x.nSesid == nSesid) });
  }

  openInNewTab(path: string, params: any): void {
    // Construct the base URL
    let url = `${window.location.origin}${path}`;

    // Convert the params object to a JSON string
    const paramsJson = JSON.stringify(params);

    // Encode the JSON string using btoa
    const encodedParams = btoa(paramsJson);

    // Append the encoded params to the URL as a query parameter
    url += `${encodedParams}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }


  // StartDemo() {
  //   if (this.fds.demoStream) {
  //     return;
  //   }
  //   this.fds.demoStream = true;
  //   this.current_session.cStatus = 'R';
  //   this.realtimeService.leftMode = 'L';
  //   this.realtimeService.nSesidL = this.current_session.nDemoid;
  //   this.fds.initilizeDemoMode();
  //   this.cdr.detectChanges();
  //   setTimeout(() => {
  //     this.fds.streamDemoData(this.realtimeService.nSesidL, this.nUserid, this.nCaseid);
  //   }, 500);
  // }

  // async stopDemo() {
  //  
  //   if (this.isStopingdemostream) return;
  //   this.isStopingdemostream = true;
  //   try {
  //     this.fds.deIntilizeDemoMode();
  //     this.fds.StopstreamDemoData();
  //     this.current_session = await this.issueService.fetchSessionObj(0, this.nUserid, this.nCaseid);
  //     this.realtimeService.nSesidL = this.current_session.nSesid;
  //     // this.current_session.nCaseid = this.current_session.nCaseid ? this.current_session.nCaseid : this.nCaseid;
  //     if (this.current_session.isTrans) {
  //       this.realtimeService.leftMode = 'T';
  //     } else {
  //       this.realtimeService.leftMode = 'D';
  //     }
  //   } catch (error) {

  //   }
  //   this.fds.demoStream = false;
  //   this.isStopingdemostream = false;
  //   this.cdr.detectChanges();
  // }

  initSubscribe() {

    // this.evsubscription = this.cs.functionCalled$.subscribe(async (data) => {
    //   if (data && data.event == 'START-DEMO') {
    //     // alert(1)
    //     this.StartDemo();
    //   }
    //   if (data && data.event == 'STOP-DEMO') {
    //     // alert(2)
    //     this.stopDemo();
    //   }
    // });
  }

  enforceMaxLength(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 3) {
      input.value = input.value.slice(0, 3);
    }
  }


  OnIssueClose() {
    this.initIssues();
  }

  async initIssues() {
    this.issueList = [];
    this.issueList = await this.issueService.fetchIssueList({ nCaseid: this.current_session.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid, nIDid: 0 });

  }
  getSelectedIssues() {
    try {

      this.currentIssueColor = null;
      let data = []
      if (this.annotationCheckbox)
        data = this.annotService.getAnnotsIssueIds();
      else if (this.highlightCheckbox) {
        data = this.annotService.getHighLightIssueIds();
      }
      if (data?.length > 1) {
        return '--- Multiple issues selected ---';
      } else if (data?.length == 1) {
        const selectedIssue = this.issueList.find(a => a.nIid == data[0]["nIid"]);
        this.currentIssueColor = selectedIssue?.cColor;
        return selectedIssue?.cIName || 'Select Issues'
      }
    } catch (error) {
      console.error(error);
    }

    return 'Select Issues';
  }

  dialogEvent(e, menu) {
    // if (e.event == 'ADD-ISSUE') {

    //     menu.closeMenu();
    // }
    if (e.event == 'ADVANCE') {
      menu.closeMenu();
      if (this.annotationCheckbox) {
        this.toolabarclick.emit({ "type": 'Hissue', "data": this.highlightmode });
        this.cdr.detectChanges();
      }
      else {
        this.toolabarclick.emit({ "type": 'Hissue', "data": this.highlightmode });
      }
    }
  }
}