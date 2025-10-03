import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, OnInit, SimpleChanges, QueryList, ElementRef, ViewChildren, HostListener, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable, Subject, Subscription, delay, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DataGenerationService } from '../../services/data-generation/data-generation.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { FeedPageComponent } from '../feed-page/feed-page.component';
import { Annotation, tabmodel } from '../../models/annotation.interface';
import { FeedDisplayService } from '../../services/feed-display.service';
import { AnnotationDialogService } from '../../services/annotation-dialog.service';
import { LiveFeedDialogComponent } from '../live-feed-dialog/live-feed-dialog.component';
import { IssuemodelComponent } from '../issues/issuemodel/issuemodel.component';
import { AnnotationService } from '../../services/annotation/annotation.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CreateissueComponent } from '../issues/createissue/createissue.component';
import { IssueService } from '../../services/issue/issue.service';
import { SessionIssueMDL, hylightMD, sessionDataMDL, sessionDetailResponce } from '../../models/issue.interface';
import { CommunicationService } from '../../../shared/services/communication/communication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { SearchService } from '../../services/search.service';

import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { RealtimeService } from '../../services/realtime/realtime.service';
import { CdkDrag, CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';
import { ExportComponent } from '../export/export.component';
import { SessionService } from '../../../shared/services/session.service';
import { PerformAnnotComponent } from './annot';
@Component({
  selector: 'app-feed-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ScrollingModule, ToolbarComponent, FeedPageComponent, IconComponent, CdkDrag],
  providers: [FeedDisplayService, SearchService],
  templateUrl: './feed-display.component.html',
  styleUrl: './feed-display.component.scss'
})
export class FeedDisplayComponent extends PerformAnnotComponent implements OnInit, AfterViewInit {
  @ViewChild('myActiveInput') myActiveInput!: ElementRef<HTMLInputElement>;
  private lastWheelTime = 0;
  private wheelThrottleTime = 50; // milliseconds
  // @HostListener('wheel', ['$event'])
  // onMouseWheel(event: WheelEvent) {
  //   // Throttle wheel events
  //   const now = Date.now();
  //   if (now - this.lastWheelTime < this.wheelThrottleTime) {
  //     return;
  //   }
  //   this.lastWheelTime = now;

  //   // Detect upward scroll
  //   if (event.deltaY < 0) {
  //     this.handleUpwardScroll();
  //   }
  // }

  mouseX = 0;
  mouseY = 0;


  @HostListener('window:mousemove', ['$event'])
  OnEventMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }


  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      

      try {
        const element = document.activeElement;
        if (element.hasAttribute('spacebardisable'))
          return;
      } catch (error) {

      }
      // Prevent default spacebar action

      const pages = this.fds.getActiveFeedData();

      if (pages?.length) {
        const pageNo = pages.length;
        const lineNo = pages[pages.length - 1]["data"].length;
        if (pageNo && lineNo) {
          // event.preventDefault();
          // const obj = { page: pageNo, line: lineNo }
          this.spaceBarOptions = { page: pageNo, line: lineNo }
        }
      }

      // const element = document.elementFromPoint(this.mouseX, this.mouseY)?.closest('[lno]');
      // const pageNo = Number(element?.getAttribute('pno') || 0);
      // const lineNo = Number(element?.getAttribute('lno') || 0);
      // console.log('Element under mouse at spacebar press:', pageNo, lineNo); 
      // // this.sendEvents.next({ type: 'SPACEBAR', pageNo, lineNo });
      // // this.spaceBarPageno = pageNo;
      // // this.spaceBarLineno = lineNo;



      // if (pageNo && lineNo)
      //   event.preventDefault();
      // const obj = { page: pageNo, line: lineNo }
      // this.spaceBarOptions = { page: pageNo, line: lineNo }
    }




  }



  // spaceBarPageno:number = 0;
  // spaceBarLineno:number = 0;

  spaceBarOptions = { page: 0, line: 0 };
  private handleUpwardScroll() {
    if (!this.fds.demoStream && !this.isSetupscreen) {
      // this.fds.pauseEvent();
    }
  }
  originalHeight: number;
  originalWidth: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOriginalScreensize();
  }
  previousOffset: number = 0;
  private scrollSpeedFactor = 1;
  private isDragging = false;
  private lastClientY: number;
  @Input() nCaseid;
  @Input() isSetupscreen: boolean = false;
  maxWidth: number = 956;
  highlightmode: hylightMD = false;
  changingValue: Subject<any> = new Subject();
  handtool: boolean = false;
  private comparesubscription: Subscription;

  sendEvents: Subject<any> = new Subject();

  setOriginalScreensize() {
    // Set the height to 80% of the screen height or any other fraction you consider appropriate
    this.originalHeight = window.innerHeight - 147;
    this.originalWidth = window.innerWidth;
  }
  // @ViewChildren(FeedPageComponent, { read: ElementRef }) itemElementRefs: QueryList<ElementRef>;
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  feedData$: Observable<any[]> = new BehaviorSubject<any[]>([]);
  lastlines: Number = 0;
  selectedFont: any = { name: 'Open Sans', text: 'Default' };
  zoomLevel: any = 1;
  highlightColor: any = '#ffe600';
  sessionDetails$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  itemSize: any = 835;
  showTimestamp: boolean = false;
  isfullscreen: boolean = false;
  @Input() istab: boolean = false;
  @Input() ispdfactive: boolean = false;
  lineHeight: Number = 24;
  private destroy$ = new Subject<void>();
  private dialogRef: MatDialogRef<IssuemodelComponent> | null = null;
  private dialogRefExport: MatDialogRef<ExportComponent> | null = null;

  // issueData: SessionIssueMDL = { nCaseid: 22, nSessionid: 57, nUserid: 3 };
  private evsubscription: Subscription;
  nEditid: string;
  nOldEditPage: number = 0;
  current_session: sessionDataMDL = {} as sessionDataMDL;
  // @Input() current_session: sessionDataMDL = {} as sessionDataMDL;
  @Input() paramsData: any;
  @Input() tab: any;
  // paramsData: any;
  nUserid: string;
  currentPage: number = 1;
  searchSub: Subscription;
  isPageChanging: boolean = false;
  dialogcreationRef: any;
  @Input() previous_session: sessionDetailResponce[] = [];
  selectedBox: number = 1;
  @Input() mode: string = 'L';
  OldDataSubject = new BehaviorSubject<any[]>([]);
  OldData$ = this.OldDataSubject.asObservable();
  @Output() toparent = new EventEmitter<any>();
  nSesid: any;
  isStopingdemostream: boolean = false;
  feedDataOriginal: any = []
  isLoaded: boolean = false;
  @Output() onTabEvent = new EventEmitter<tabmodel>();
  // OldData$: Observable<any[]> = new BehaviorSubject<any[]>([]);
  constructor(
    private ss: SearchService,
    override readonly fds: FeedDisplayService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    // private annotationDialogService: AnnotationDialogService, // Add AnnotationDialogService
    override readonly annotationService: AnnotationService,
    override readonly issueServer: IssueService,
    private cs: CommunicationService,
    // private route: ActivatedRoute,
    // private router: Router,
    private store: SecureStorageService,
    override readonly tost: TostbarService,
    public realtimeService: RealtimeService,
    public sessionService: SessionService
  ) {
    super(fds, annotationService, issueServer, tost);
    this.setOriginalScreensize();
    this.searchSub = this.ss.currentMatch$.subscribe((index) => {
      this.scrollToSearchMatch();
    });

  }




  get scaledScreen(): any {
    return { height: this.originalHeight / this.zoomLevel, width: this.originalWidth / this.zoomLevel }; // Adjust height based on scale
  }



  handleViewportScroll(event?: any) {
    if (this.currentPage != (event + 1)) { //&& !this.isPageChanging
      this.currentPage = event + 1;
      // console.warn('PAGE CHANGE', this.currentPage)
    }
    // const itemElements = this.itemElementRefs.toArray();
    // itemElements.forEach((itemElement: any) => {
    //   const pageWidth = itemElement.nativeElement.childNodes[0].offsetWidth;
    //   this.maxWidth = Math.max(this.maxWidth, pageWidth);
    // });
  }

  // fetchAnnotationsData(page):Annotation[]{
  //   return this.fds.fetchAnnotation(page);
  // }




  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['mode'] && !changes['mode'].firstChange) {
      if (changes['mode']["currentValue"] != changes['mode']["previousValue"]) {
        this.onSessionChange();
      }
    }

    if (changes['paramsData'] && !changes['paramsData'].firstChange) {
      if (changes['paramsData']["currentValue"] != changes['paramsData']["previousValue"]) {

        // 

        if (changes['paramsData']["previousValue"]) {
          try {
            this.fds.leaveRoom(changes['paramsData']["previousValue"]);
          } catch (error) {

          }
        }
        this.onSessionChange();
      }
    }

  }


  getDataLength() {
    return true;
  }

  reInitFeedDisplay(data) {
    if (data.currentTab != this.tab) return;

    this.feedData$ = this.fds.feedData$;
    this.cdr.detectChanges();
  }

  async ngOnInit() {
    try {

      // alert('Session Initiate');

      this.fds.dataMode = this.mode;


      this.fds.initSocketEvents();
      this.fds.feedDataSubject.pipe(takeUntil(this.destroy$)).subscribe(feedData => {
        // console.table(feedData)

        if (!this.fds.pausedState) {
          this.scrollToLastLine();
          this.calculateMaxScrollHeight();
          if (this.viewport) {
            this.viewport.checkViewportSize();
          }
        }
        this.cdr.detectChanges();



      })

      this.nUserid = await this.store.getUserId();

      try {
        try {
          if (this.comparesubscription)
            this.comparesubscription.unsubscribe();
        } catch (error) {

        }

        // setTimeout(() => {
        // this.comparesubscription = this.realtimeService.selectedCompare$.subscribe(value => {
        //   if (value !== null && value.change) {
        //     switch (value.change) {
        //       case 'A':
        //         this.handleUpdate(value);
        //         break;
        //       case 'L':
        //         if (this.tab === 1) this.handleUpdate(value);
        //         break;
        //       case 'R':
        //         if (this.tab === 2) this.handleUpdate(value);
        //         break;
        //       default:
        //         console.warn('Unknown change type:', value.change);
        //     }
        //   }
        // });


        // if (window.localStorage.getItem('hcolor')) {
        //   this.highlightColor = window.localStorage.getItem('hcolor') ? window.localStorage.getItem('hcolor') : '#ffe600';
        //   if (this.highlightColor == '#ffffff' || this.highlightColor == 'ffffff') {
        //     window.localStorage.setItem('hcolor', 'ffe600');
        //   }
        // } else {
        //   this.highlightColor = '#ffe600';
        //   window.localStorage.setItem('hcolor', '#ffe600');
        // }

      } catch (error) {
      }

      this.feedData$ = this.fds.feedData$;


      this.nSesid = this.paramsData;

      // const sesiondetail = await this.issueServer.fetchSessionObj(this.paramsData, this.nUserid, this.nCaseid);

      // this.sessionDetails$.next(sesiondetail);



      this.onSessionChange();

      // this.fetchPreviousSessions();
      // this.sessionDetails = this.dataService.getSessionDetails();
      // this.fetchHyperlinks();
      // await this.fetchAnnotations();
      // this.cdr.detectChanges();
      // this.fds.initialize(this.current_session, this.nUserid,this.tab);
      // this.OldData$ = this.fds.OldData$;
      // this.lastlines = this.fds.sd.globalLineNo;

      // setTimeout(() => {
      // if (this.mode != 'T') {
      //   this.initSubscribe()
      // }


      this.highlightColor = this.annotationService.getLastIssue().cColor;

      // if (window.localStorage.getItem('hcolor')) {
      // this.highlightColor = window.localStorage.getItem('hcolor') ? window.localStorage.getItem('hcolor') : 'ffe600'
      // } else {
      //   this.highlightColor = 'ffe600';
      //   window.localStorage.setItem('hcolor', 'ffe600');
      // }


      this.calculatePageHeight();
      this.scrollToLastLine();



      // if (this.mode == 'T') {
      // this.paramsData = null;
      // this.nSesid = null;
      // this.calculatePageHeight();
      // this.scrollToLastLine();
      // this.cdr.detectChanges();
      // this.onSessionChange(this.realtimeService.nSesdataR);
      // return;
      // }

      // // await this.fetchSession(this.paramsData);
      // await this.fds.initPages(this.current_session)
      // this.fds.init_session_room(this.current_session);

      this.cdr.detectChanges();
      // }, 200);

      if (location.href.includes('/realtime/feed')) {

        this.changingValue.next({ type: 'LOADED' });
      }
    } catch (error) {

    }
    // setTimeout(() => {
    this.isLoaded = true;
    this.cdr.detectChanges();
    // },500)
  }



  initSubscribe() {

    try {
      if (this.evsubscription)
        this.evsubscription.unsubscribe();
    } catch (error) {

    }
    this.evsubscription = this.cs.functionCalled$.subscribe(async (data) => {
      if (data && data.event == 'ISSUE-ON-PAGE') {
        this.scrollToPage(data.page);
      } else if (data && data.event == 'ISSUE-EDIT') {
        this.nEditid = data.nIDid;
        this.nOldEditPage = data.page;
        this.cdr.detectChanges();
      } else if (data && data.event == 'FETCH-ANNOTTIONS-DATA') {
        // setTimeout(() => {
        // }, 3000);
      } else if (data && data.event == 'START-DEMO') {
        // alert(1)
        this.StartDemo();
      }
      else if (data && data.event == 'STOP-DEMO') {
        // alert(2)
        this.stopDemo();
      } else if (data && data.event == 'RE-INIT-FEED-SUJECT') {
        this.reInitFeedDisplay(data.data);
      }
    })
  }

  private handleUpdate(value: any) {

    const data = this.tab === 1 ? value['L'] : value['R'];
    if (data) {
      this.mode = data.mode;
      console.log('Data mode:', data.mode);
      // this.onSessionChange(data);
    }
  }

  // async fetchPreviousSessions() {
  //   // previous_session
  //   this.previous_session = await this.issueServer.getPreviousSessions(this.current_session.nCaseid, this.nUserid)
  //   this.cdr.detectChanges();
  // }

  async fetchAnnotations(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const issueAnnotations = await this.issueServer.fetchAnnotations({ nCaseid: this.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid });
        if (issueAnnotations.length) {
          // setTimeout(() => {
          this.fds.bindAllAnnotes(issueAnnotations)
          // setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          // }, 1000);
          // }, 200);
        }
      } catch (error) {
      }
      resolve(true);
    });
  }


  async fetchSession(id): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let data = await this.issueServer.fetchSession((id), this.nUserid, this.nCaseid);
        if (data && data.length) {

          this.current_session = {
            cCasename: String(data[0].cCasename),
            cStatus: String(data[0].cName),
            cName: String(data[0].cName),
            maxNumber: Number(data[0].maxNumber || 0),
            lastPage: 0,
            pageRes: data[0]["pageRes"],
            secondLastRes: data[0]["secondLastRes"],
            dStartDt: data[0]["dStartDt"],
            lastLineNumber: 0,
            nSesid: (data[0].nSesid) || null,
            nCaseid: (data[0].nCaseid),
            totaIssues: Number(data[0].totaIssues || 0),
            nLSesid: Number(data[0].nLSesid || 0),
            settings: {
              lineNumber: data[0].nLines,
              startPage: data[0].nPageno
            }
          }

          this.sessionService.casename = data[0].cCasename;
          this.sessionService.cCaseno = data[0].cCaseno;
        }
      } catch (error) {

      }

      resolve(true);

    })

  }

  async fetchHyperlinks() {
    const hyperlinks = await this.issueServer.fetchHyperlinks({ nCaseid: this.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid });
    if (hyperlinks.length) {
      this.fds.bindAllHyperlinks(hyperlinks)
    }
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    if (this.fds.needScroll) {
      // // console.log('View has been checked and updated', this.fds.needScroll, this.itemSize);
      if (this.viewport) {
        this.viewport.checkViewportSize();
      }
      this.fds.needScroll = false;
      this.scrollToLastLine();



    }


  }

  private scrollListener: (event: Event) => void;

  ngAfterViewInit(): void {
    // this.handleViewportScroll();
    setTimeout(() => {
      if (this.viewport) {
        this.viewport.checkViewportSize();
      }
      this.calculateMaxScrollHeight();
      this.scrollListener = this.limitScroll.bind(this);
      this.viewport.elementRef.nativeElement.addEventListener('scroll', this.scrollListener);
    });

    this.highlightmode = 'H';
    // setTimeout(() => {
    //   const len =  this.fds.getDataLength()
    //   alert(len)
    // }, 2000);
  }

  maxScrollHeight: number;
  remainHeight: number;

  calculateMaxScrollHeight() {
    
    if (this.viewport) {
      this.viewport.checkViewportSize();
    }
    // var subtractHeight = 1200;
    // const viewportElement = this.viewport.elementRef.nativeElement;
    const totalContentHeight = this.viewport.getDataLength() * this.itemSize;
    this.maxScrollHeight = totalContentHeight - (this.remainHeight + (this.realtimeService.fullscreen ? 121 : 0)) / this.zoomLevel;
    this.cdr.detectChanges();
  }

  limitScroll() {
    
    const totalContentHeight = this.viewport.getDataLength() * this.itemSize;
    this.maxScrollHeight = totalContentHeight - (this.remainHeight + (this.realtimeService.fullscreen ? 121 : 0)) / this.zoomLevel;
    if (this.viewport) {
      this.viewport.checkViewportSize();
    }
    // const element = event.target as HTMLElement;
    const element = this.viewport.elementRef.nativeElement;
    if (element.scrollTop > this.maxScrollHeight) {
      element.scrollTop = this.maxScrollHeight;
      // this.fds.resumePause();
    }

  }


  toggleTimestamp() {
    this.showTimestamp = !this.showTimestamp;
    return this.showTimestamp;
  }

  openLiveFeedDialog(): void {
    // const dialogRef = this.dialog.open(LiveFeedDialogComponent, {
    //   width: '400px',
    //   position: { right: '0' },
    //   hasBackdrop: false,
    //   data: { updateFeedData: this.fds.updateFeedData.bind(this.fds), baseLineNumber: Number(this.lastlines) + 1, previousInputText: '' }
    // });
  }

  performAnnotation() {
    // const annotation: Annotation = {
    //   id: this.generateUniqueId(),
    //   nIDid: null,
    //   pageIndex: 0,
    //   text: '',
    //   color: 'FFFF00',
    //   cordinates: []
    // };

    // this.annotationDialogService.openDialog(annotation);
    // this.annotationDialogService.handleDialogResult(0, this.cdr); // Use 0 as placeholder page index
  }

  trackByPage(index: number, item: any): number {
    return (item && item.page) ? item.page : index;
  }

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }

  ngOnDestroy(): void {
    try {
      // alert('Destroyed');
      this.tabSessionEnd()
      if (this.dialogRef) {
        this.dialogRef.close();
      }
      if (this.dialogcreationRef) {
        this.dialogcreationRef.close();
      }
      if (this.comparesubscription) {
        this.comparesubscription.unsubscribe();
      }

      if (this.scrollListener && this.viewport) {
        this.viewport.elementRef.nativeElement.removeEventListener('scroll', this.scrollListener);
      }


    } catch (error) {

    }



    this.fds.issueDetailAnnots = [];
    this.fds.clearAllDisconnected();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.evsubscription) {
      this.evsubscription.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  private scrollToLastLine(): void {
    

    if (this.fds.pausedState) return;
    // console.warn('SCROLLING TO LAST')
    // console.log('scrollToLastLine called');
    // const page = this.fds.getTotalLength() + 1
    try {

      const line = Number(this.fds.sd.lastLineNumber - 1);
      const lineheigt = 24,
        headerheight = (35.99 + 24),
        extraMargin = 20;
      const lastPageTempHeight = (line + 1) * lineheigt + headerheight;
      const remainHeight = this.itemSize - lastPageTempHeight - extraMargin;

      // this.scrollToPage(page)
      const totallength = this.fds.getTotalLength();
      const totalContentHeight = totallength * this.itemSize; // Assuming each item has a fixed height of 50px
      this.maxScrollHeight = totalContentHeight;

      const viewportHeight = this.viewport.getViewportSize() / this.zoomLevel;
      this.remainHeight = remainHeight + viewportHeight;
      const scrollOffset = totalContentHeight - viewportHeight;

      const currentScrollPosition = this.viewport.measureScrollOffset();
      // console.log(currentScrollPosition, scrollOffset)
      this.viewport.scrollToOffset(scrollOffset - remainHeight);



    } catch (error) {
      // console.error('scrollToLastLine', error)
    }


    // this.scrollToLast(page, line)
    /*
        const screenHeight = window.innerHeight;
        const scrollHeight = this.itemSize - (screenHeight - 131);
        //this.feedData$.pipe(takeUntil(this.destroy$)).subscribe(feedData => {
    
        
        // if(this.fds.needScroll){
        // this.fds.needScroll=false;
        // if (this.viewport && feedData.length > 0) {
        const lastLine = Number(this.fds.sd.lastLineNumber - 1);
        const totalLines = Number(this.fds.sd.settings.lineNumber)
        const scrollOffset = (totalLines - lastLine) * Number(this.lineHeight);
        this.viewport.scrollToIndex(this.fds.getTotalLength() + 1);
        const currentScrollPosition = this.viewport.measureScrollOffset();
        this.viewport.scrollToOffset(currentScrollPosition - (scrollOffset - scrollHeight - 84));*/
    // }

    // }
    // }
    // );
    // // console.log(scrollHeight, this.itemSize, this.viewport.measureScrollOffset());
  }

  private scrollToSearchMatch(): void {


    try {
      let curMatch: any = this.ss.getCurrentMatch()
      if (curMatch) {
        const page = curMatch.page;
        const line: any = curMatch.line
        this.scrollToLast(page, line)
      }

    } catch (error) {
      console.error('scrollToLastLine1', error)
    }
  }

  scrollToLast(page, line) {
    
    const lastLine = Number(line);
    var windowheight = window.innerHeight;
    const screenHeight = this.zoomLevel > 1 ? (window.innerHeight / this.zoomLevel) : (window.innerHeight * this.zoomLevel);
    const totalLines = Number(this.fds.sd.settings.lineNumber)
    const scrollHeight = ((this.itemSize + 60) - (screenHeight - 56));
    const scrollOffset = ((totalLines - lastLine) * Number(this.lineHeight));
    this.viewport.scrollToIndex(page);
    const currentScrollPosition = this.viewport.measureScrollOffset();
    this.viewport.scrollToOffset(currentScrollPosition - (scrollOffset - scrollHeight - 84));
  }




  private calculatePageHeight() {
    if (this.fds.sd && this.fds.sd.settings) {
      const linesPerPage = this.fds.sd.settings.lineNumber;
      this.cdr.detectChanges();
      this.itemSize = (Number(this.lineHeight) * linesPerPage) + 84;
      this.cdr.detectChanges();
      if (this.viewport) {
        this.viewport.checkViewportSize();
      }
    }
  }


  protected override onAnnotEvent(annotation, page, pageIndex) {

    this.showTemporaryAnnotation(annotation, page, pageIndex)
    // if (this.current_session.totaIssues) {
    this.openIssueModel();
    // } else {
    // this.createissue()
    // }
    if (this.dialogRef) {
      this.dialogRef.componentInstance.enableMode('N');
    }
  }

  onEvent(e, page, pageIndex) {

    if (e.event == 'ANNOTATED') {
      this.onAnnotEvent(e.annotation, page, pageIndex)
    } else if (e.event == 'ICON-CLICK-A') {
      if (!this.dialogRef) {
        this.openIssueModel('E', e.annotation);
      } else {
        this.dialogRef.componentInstance.reInit(e.annotation, 'A');
        // send data to issue form;
      }
    }
    else if (e.event == 'ICON-CLICK-H') {
      if (!this.dialogRef) {
        this.openIssueModel('E', e.annotation, true);
      } else {
        this.dialogRef.componentInstance.reInit(e.annotation, 'H');
      }
    }
  }

  private showTemporaryAnnotation(annotation: Annotation, page, pageIndex: number) {
    if (!page.annotations) {
      page.annotations = [];
    }

    this.fds.removeAnnotation(this.nEditid, this.nOldEditPage); // Check if the annotation is in edit mode
    this.cdr.detectChanges(); // Trigger change detection

    this.fds.checkTempAnnotatation(pageIndex); // Check if the annotation is temporary 
    this.annotationService.clearTempAnnotation();

    page.annotations = [...page.annotations, ...[annotation]]; // Show only the current temporary annotation
    this.annotationService.setTempAnnotation(annotation);
    this.fds.addAnnotationToQueue(page.page, annotation);
    this.cdr.detectChanges(); // Trigger change detection
  }


  openIssueModel(isView?, annotData?, ishilight?, isIssuemdl?) {
    if (this.dialogRef || this.realtimeService.compareMode || this.isSetupscreen) {
      // If the dialog is already open, do nothing
      return;
    }
    this.fds.pauseEvent();
    this.dialogRef = this.dialog.open(IssuemodelComponent, {
      width: '519px',
      height: 'calc(100vh - 145px)',
      hasBackdrop: true,
      panelClass: ['issuemodel', 'noshadow'],
      backdropClass: 'issuemodalbackdrop',
      position: {
        top: `145px`,
        right: `0px`,
      },
      data: { annotData: annotData, current_session: this.current_session }
    });

    this.dialogRef.componentInstance.isTrasnscript = this.mode == 'T' ? 'Y' : 'N';
    this.dialogRef.componentInstance.dialogEvent.subscribe((res) => {

      // console.log('Received from dialog:',this.tab, res.message);

      if (res.event == 'ADD-ANNOTATION') {
        this.fds.addAnnotationToQueue(res.data.pageIndex, res.data.newAnnotation);
      } else if (res.event == 'CHECK-TEMP-ANNOT') {
        this.fds.checkTempAnnotatation(null);
      } else if (res.event == 'REMOVE-ANNOT') {

        this.fds.removeAnnotation(res.data.nIDid, res.data.page);
      } else if (res.event == 'IS-EXISTS') {
        res.data.callback(this.fds.isAnnotationExists(res.data.pageIndex, res.data.nIDid));
      } else if (res.event == 'ISSUE-EDITED') {
        if (res.data && res.data.type == 'E') {
          this.fds.updateAnnotAndHyperLinksColors(res.data);
        }
      } else if (res.event == 'DEFAULT-ISSUES-UPDATED') {
        // this.setDefaulIssues(res.data);
      }

    });

    this.dialogRef.componentInstance.modelType = isView ? isView : this.dialogRef.componentInstance.modelType;
    this.dialogRef.componentInstance.ishilight = ishilight ? ishilight : false;
    this.dialogRef.componentInstance.isIssuemdl = isIssuemdl ? isIssuemdl : false;
    this.dialogRef.afterClosed().subscribe(async (result) => {
      this.activeFeedElement();
      try {


        if (result && result.event == 'HIGHLIGHT-ISSUE-EDITS') {
          try {
            if (result.jHids.length) {
              for (let i = 0; i < result.jHids.length; i++) {
                this.fds.updateHyperlink(result.page, result.jHids[i], result.cColor, result.jIssues);
              }

            }
          } catch (error) {
          }
        }
        else if (result && result.event == 'HIGHLIGHT-ISSUE-DELETE') {
          try {

            if (result.jHids.length) {
              let res = await this.issueServer.removeHighlights({ nUserid: this.nUserid, jHids: result.jHids });
              if (res.length) {

                try {
                  for (let i = 0; i < result.jHids.length; i++)
                    this.fds.removeHyperlink(result.page, result.jHids[i], null)
                } catch (error) {

                }



                this.tost.openSnackBar(res[0]["message"]);
              }
            }

          } catch (error) {

          }
        } else if (result?.event == 'ISSUE-DELETED-UPDATE-ANNOTS') {
          this.fds.reFetchAnnotations(this.mode == 'T' ? 'Y' : 'N');
        }

        this.getSessionobj();
        this.realtimeService.issueOpened = false;
        this.fds.setIdValue()
        // console.log(`Dialog result: ${result}`);

        this.fds.checkTempAnnotatation(null); // Check if the annotation is temporary (for the current session only

        // this.fds.resumePause();
      } catch (error) {
        console.error('Dialog close error:', error);
      }
      this.dialogRef = null;
      this.nEditid = null;
      this.fds.currentHdetailId = null;
      this.nOldEditPage = null;
      this.cdr.detectChanges();
    });
  }

  openExportModel() {

    this.dialogRefExport = this.dialog.open(ExportComponent, {
      width: 'fit-content',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 181px)',
      // hasBackdrop: false,
      panelClass: [],
      // position: {
      //   top: `160px`,
      //   right: `0px`,
      // },
      // data: { current_session: this.current_session,nUserid:this.nUserid }
    });
    this.dialogRefExport.componentInstance.cTranscript = this.realtimeService.leftMode == 'T' ? 'Y' : 'N';
    this.dialogRefExport.componentInstance.current_session = this.current_session;
    this.dialogRefExport.componentInstance.nUserid = this.nUserid;

  }

  async getSessionobj() {
    this.current_session = await this.issueServer.fetchSessionObj(this.paramsData, this.nUserid, this.nCaseid);
  }

  createissue() {
    if (this.realtimeService.compareMode) {
      // If the dialog is already open, do nothing
      return;
    }
    this.dialogcreationRef = this.dialog.open(CreateissueComponent, {
      width: '519px',
      height: 'calc(100vh - 145px)',
      hasBackdrop: false,
      backdropClass: 'issuemodalbackdrop',
      panelClass: 'noshadow',
      position: {
        top: `145px`,
        right: `0px`,
      },
      data: {
        current_session: this.current_session
      }
    });

    this.dialogcreationRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.type == 'E') {
          this.fds.updateAnnotAndHyperLinksColors(result);
        }

        this.getSessionobj() // 
        setTimeout(() => {
          this.openIssueModel();
        }, 100);
      }
      this.dialogcreationRef = null;
      this.cdr.detectChanges();
    })
  }

  scrollToPage(pg) {
    this.fds.pauseEvent();
    // this.isPageChanging = true;
    // setTimeout(() => {
    //   this.isPageChanging = false;
    //   this.cdr.detectChanges();
    // }, 300);
    this.currentPage = Number(pg) + 1;
    this.viewport.scrollToIndex(pg);
    this.cdr.detectChanges();
  }

  async toolbarclick(ev) {
    console.warn('TAB EVENTS');
    switch (ev.type) {
      case 'ToPage':
        this.scrollToPage(ev.data);
        break;
      case 'ColorChange':
        this.highlightColor = ev.data;
        this.highlightColor = this.annotationService.getLastIssue().cColor;
        window.localStorage.setItem('hcolor', this.highlightColor);
        break;
      case 'ModeChange':
        if (ev.data) {
          this.fds.pauseEvent();
        }
        // else {
        //   this.fds.resumePause();
        // }
        this.highlightmode = ev.data;
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        break;
      case 'FontChange':

        this.selectedFont = ev.data;
        this.cdr.detectChanges()
        // console.log('Font changed to:', this.selectedFont);
        break;
      case 'Hissue':

        if (ev.data) {
          this.fds.pauseEvent();
        }
        this.highlightmode = ev.data;
        if (this.dialogRef) {
          this.dialogRef.close();
          this.cdr.detectChanges();
          await this.delay(200)
        }
        this.openIssueModel('N', '', ev.data == 'H', ev.data == 'I');
        break;

      case 'Zoom':
        this.zoomLevel = ev.data;
        break;
      case 'Timestamp':
        this.toggleTimestamp();
        break;
      case 'LiveDialog':
        this.openLiveFeedDialog();
        break;
      case 'Annotation':
        this.performAnnotation();
        break;
      case 'CLOSE-COMP':
        // this.realtimeService.tab = 1

        this.realtimeService.nSesidL = this.paramsData;
        // this.nSesid = this.paramsData
        // this.onSessionChange();
        this.cdr.detectChanges();
        break;
      case 'RelatimeChange':
        if (ev.data.type == this.tab) {
          console.warn('Realtime change:', this.mode, this.tab, ev.data);
          this.onSessionChange();
        }

        break;
      case 'FUll':
        // this.isfullscreen = ev.data;
        // alert(1);
        // this.toparent.emit({ type: 'Full', data: ev.data });
        // this.calculateMaxScrollHeight();
        this.limitScroll();
        this.scrollToLastLine();
        break;
      case 'COMPARE':
        this.comareData(ev.data);
        break;
      case 'Issue':
        if (this.dialogRef) {
          this.dialogRef.close()
        }else{
          this.openIssueModel('V');
        }
        break;
      case 'hand':
        this.handtool = ev.data;
        break;
      case 'Export':
        this.openExportModel();
        break;
      default:
        console.warn('Unhandled toolbar event:', ev.type);
    }
  }

  delay(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    })
  }

  async onSessionChange() {
    if (this.fds.demoStream) return;
    
    this.tabSessionStart();
    this.fds.feedDataSubject.next([]);
    this.fds.feedDataHoldSubject.next([]);
    this.current_session = await this.issueServer.fetchSessionObj(this.paramsData, this.nUserid, this.nCaseid);
    this.fds.issueDetailAnnots = [];
    this.fds.highlightsAnnots = [];
    const { ref1, ref2 } = await this.issueServer.getIssueDetailAnots(this.current_session.nSesid, this.nUserid, this.nCaseid, this.mode == 'T' ? 'Y' : 'N');
    this.fds.issueDetailAnnots = ref1;
    this.fds.highlightsAnnots = ref2;


    if (!this.fds.issueDetailAnnots)
      this.fds.issueDetailAnnots = [];
    if (!this.fds.highlightsAnnots)
      this.fds.highlightsAnnots = [];
    this.showTimestamp = false;
    this.initSubscribe();
    if (['L', 'D'].includes(this.mode)) {
      this.initSubscribe();

      await this.fds.initPages(this.current_session)
      // this.fds.initSocketEvents();
      this.fds.initialize(this.current_session, this.nUserid, this.tab);
      this.calculatePageHeight();
      this.scrollToLastLine();
      if (this.mode == 'L') {
        this.fds.init_session_room(this.current_session);
      }
    } else {
      this.fds.sd = this.current_session;
      const realtimedata = await this.issueServer.getRealtimeDataBySessionId(this.paramsData, this.nUserid, this.nCaseid);
      if (realtimedata.msg == 1) {
        this.fds.feedDataSubject.next(realtimedata.data);
        this.fds.addQuestionBold()

        this.calculatePageHeight();
        this.cdr.detectChanges();
      } else {
        this.tost.openSnackBar('Session data not found on server', 'E');
      }
    }
    this.cdr.detectChanges();
  }
  async comareData(data) {
    this.fds.compareMode = data;
    this.selectedBox = 1;
  }






  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.lastClientY = event.clientY;
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      // Throttle mousemove events
      if (!this.lastClientY || Math.abs(event.clientY - this.lastClientY) < 5) {
        return;
      }
      const deltaY = event.clientY - this.lastClientY;
      const scrollPosition = this.viewport.measureScrollOffset('top');
      const newScrollPosition = scrollPosition - deltaY * this.scrollSpeedFactor;
      this.viewport.scrollTo({ top: newScrollPosition, behavior: 'auto' });
      this.lastClientY = event.clientY;
    }

  }

  onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }


  vitualsrolled(ev) {
    this.calculateMaxScrollHeight();
    // const currentOffset = this.viewport.measureScrollOffset();
    // const direction = currentOffset > this.previousOffset ? 'down' : 'up';
    // this.previousOffset = currentOffset;
    // if (direction == 'up' && !this.fds.demoStream && !this.isSetupscreen) {
    //   this.fds.pauseEvent();
    // }
    // this.calculateMaxScrollHeight();
    // this.limitScroll(ev)
  }




  async StartDemo() {

    if (this.fds.demoStream) {
      return;
    }
    this.previousOffset = 0;
    this.fds.clearPause();
    this.fds.demoStream = true;
    this.realtimeService.leftMode = 'L';
    this.realtimeService.nSesidL = this.current_session.nDemoid;
    this.current_session = await this.issueServer.fetchSessionObj(this.current_session.nDemoid, this.nUserid, this.nCaseid);
    await this.issueServer.deleteDemoIssues({ nSesid: this.current_session.nSesid, nUserid: this.nUserid, nCaseid: this.nCaseid });
    this.current_session.cStatus = 'R';
    this.fds.initilizeDemoMode();
    this.fds.feedDataSubject.next([]);
    this.fds.feedDataHoldSubject.next([]);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.fds.streamDemoData(this.realtimeService.nSesidL, this.nUserid, this.nCaseid);
    }, 500);
  }

  async stopDemo() {

    if (this.isStopingdemostream) return;
    this.isStopingdemostream = true;
    try {
      this.fds.deIntilizeDemoMode();
      this.fds.StopstreamDemoData();
      this.current_session = await this.issueServer.fetchSessionObj(0, this.nUserid, this.nCaseid);
      this.realtimeService.nSesidL = this.current_session.nSesid;
      // this.current_session.nCaseid = this.current_session.nCaseid ? this.current_session.nCaseid : this.nCaseid;
      if (this.current_session.isTrans) {
        this.realtimeService.leftMode = 'T';
      } else {
        this.realtimeService.leftMode = 'D';
      }
    } catch (error) {

    }
    this.fds.demoStream = false;
    this.isStopingdemostream = false;
    this.cdr.detectChanges();
  }

  OnTabEvent(e) {
    this.onTabEvent.next(e);
  }

  isOnLiveFeed() {
    return location.href.includes('/realtime/feed');
  }
  // onSpacebarPress(e: any) {
  //   alert('Spacebar pressed! ' );

  // }

  onWheel(event: WheelEvent) {
    const viewport = this.viewport.measureScrollOffset();
    // Check if user scrolled up and the scroll position is above 200px from the bottom
    if (event.deltaY < 0 && viewport > 200) {
      this.fds.pauseEvent();
    }
  }



  protected override getUserId(): string {
    return this.nUserid;
  }



  protected override getMode(): string {
    return this.mode;
  }


  protected override getCurrentSession(): any {
    return this.current_session;
  }

  protected override gethighlightmode(): hylightMD {
    return this.highlightmode;
  }

  tabSessionStart() {
    this.fds.tabSessionId = String(new Date().getTime());
  }

  tabSessionEnd() {
    this.fds.tabSessionId = null;
  }

  activeFeedElement() {
    try {
      this.myActiveInput.nativeElement.focus();
      this.myActiveInput.nativeElement.click();
    } catch (error) {

    }
  }

}