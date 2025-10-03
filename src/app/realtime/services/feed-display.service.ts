import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { DataGenerationService } from './data-generation/data-generation.service';
import { FeedData, LineData } from '../models/data.interface';
import { Annotation, highlightsAnnot } from '../models/annotation.interface';
import { hyperLinksMDL, sessionDataMDL } from '../models/issue.interface';
import { CommunicationService } from '../../shared/services/communication/communication.service';
import { SocketService } from '../../shared/services/socket.service';
import async from 'async';

import { RealtimeService } from './realtime/realtime.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SecureStorageService } from '../../core/services/storage/secure-storage.service';
@Injectable({
  providedIn: 'root'
})
export class FeedDisplayService {
  /**
   *  {
        lastPage: 5,
        lastLineNumber: 22, // Random line number between 1 and 25 for the last page
        sessionId: this.sessionId,
        userName: this.userName,
        settings: {
          lineNumber: 25,
          startPage: 1,
        },
      };
   */
  feedDataHoldSubject = new BehaviorSubject<any[]>([]);
  feedDataSubject = new BehaviorSubject<any[]>([]);
  feedData$ = this.feedDataSubject.asObservable();
  needScroll: boolean = false; //flag to check if the scroll is needed this will ensure the scroll will happen only once after the viewUpdated
  sd: sessionDataMDL;
  tempAnnotationArray: number[] = [];
  issueAnnotations: Annotation[] = [];
  // totalPreviousLength:number;
  isCalled: boolean = false;
  annotationsArray: Annotation[] = [];
  hyperlinksArray: hyperLinksMDL[] = [];
  pausedState: boolean = false;
  private pausedData: any[] = []; // Array to store data during pause
  currentIsseuDetailId: string;
  currentHdetailId: any;
  receivedPages: number = 0;
  onSubscription_previous: Subscription;
  onSubscription_linereplace: Subscription;
  onSubscription_linedelete: Subscription;
  onSubscription_lineaddon: Subscription;
  onSubscription_refresh: Subscription;
  onSubscription_current: Subscription;
  onSubscriptionRefresh_current: Subscription;
  onSubscription_democurrent: Subscription;
  isBolad: boolean = false;
  isComparemode: boolean = false;
  compareMode: any = 'L';
  dataMode: any = 'L';
  currentTab: number;
  demoStream: boolean = false;
  timeOut: any;
  private readonly queue;
  refreshCount: number = 0;
  cmdCount: number = 0;
  isRefreshing: boolean = false;
  refreshInterval: any;
  issueDetailAnnots: Annotation[] = [];
  highlightsAnnots: highlightsAnnot[] = [];
  tabSessionId: string;
  constructor(private cm: CommunicationService, private http: HttpClient, private socketService: SocketService, private realtime: RealtimeService, private secureS: SecureStorageService
    // , private issueService: IssueService
  ) {

    this.queue = async.queue(async (task, callback) => {
      // console.warn("\n T s", new Date());
      try {
        await task();
      } catch (error) {
      }
      // console.warn("\n T e", new Date());
      callback();
    }, 1);

    // Add an error listener
    // this.queue.on("error", (err, task) => {
    //   console.error('Task encountered an error:', err);
    // });

    /*
    this.queue = async.queue(async (task, callback) => {
      try {
        // await task();  // Execute the task (which is an async function)

        if (task.method == 'ADDON') {
          await this.lineAddon(task.newLine);
        } else if (task.method == 'DELETE') {
          await this.deleteLine(task.startInd, task.endInd);

        }
        if (callback) {
          callback(null);    // Call the callback to indicate task completion
        }
      } catch (error) {
        console.error('Error processing task:', error);
        if (callback) {
          callback(error);  // Call the callback with the error to indicate failure
        }
      }
    }, 1); // Concurrency 1
    */


    this.queue.drain(() => {
      // console.warn("\n All tasks have been processed", new Date());
    });
  }

  initSocketEvents() {
    this.isBolad = false;
    this.receivedPages = 0;
    this.isCalled = false;
    // console.log('ASKING FOR DATA')

    try {
      if (this.onSubscription_previous) {
        this.onSubscription_previous.unsubscribe();
      }
      if (this.onSubscription_current) {
        this.onSubscription_current.unsubscribe();
      }


      if (this.onSubscriptionRefresh_current) {
        this.onSubscriptionRefresh_current.unsubscribe();
      }

      if (this.onSubscription_linereplace) {
        this.onSubscription_linereplace.unsubscribe();
      }
      if (this.onSubscription_linedelete) {
        this.onSubscription_linedelete.unsubscribe();
      }
      if (this.onSubscription_lineaddon) {
        this.onSubscription_lineaddon.unsubscribe();
      }
      if (this.onSubscription_refresh) {
        this.onSubscription_refresh.unsubscribe();
      }
    } catch (error) {

    }

    this.onSubscription_previous = this.socketService.getPrevious().subscribe(res => {



      this.queue.unshift(async () => {
        if (res.tab != this.currentTab || (res.tabSessionId != this.tabSessionId)) {
          return;
        }

        // console.warn('P { PAGE} =', res);
        this.receivedPages++
        // console.warn(`P = ${res.page}  T = ${res.tabSessionId}`);
        // this.addFeedData(res);

        const lastPage = res.totalPages ? res.totalPages : 0;

        await this.addPreviousFeedData(res);
        try {
          if (this.sd?.cProtocol == 'C') {
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(() => {
              if (res.page == 1) {
                this.addQuestionBold();
              }
            }, 1500)
          }
        } catch (error) {

        }
        // console.log('TO LAST', lastPage, this.getTotalLength())
        if (this.receivedPages >= lastPage && !this.isCalled) {
          // console.log('TO CALLED')
          this.isCalled = true;
          this.cm.callFunction({ event: 'FETCH-ANNOTTIONS-DATA' });
          this.needScroll = true;
        }
      })

    });


    this.onSubscription_current = this.socketService.getMessagesR().subscribe(res => {
      // this.cmdCount++ //,this.cmdCount
      // console.warn('Rec feed');
      if (this.compareMode == 'L') {
        this.queue.push(async () => {
          // this.cmdCount++
          await this.addLiveFeedData(res);
        });
        // this.addLiveFeedData(res)
      }
    });


    this.onSubscriptionRefresh_current = this.socketService.getAnnotsRefreshTransfer().subscribe(msg => {

      if (msg.nSesid != this.sd?.nSesid) {
        return;
      }

      this.queue.push(async () => {
        await this.handleRefreshAnnotTransfer(msg);
      });
    })

    this.onSubscription_refresh = this.socketService.getFeedRefreshData().subscribe(res => {
      if (res.nSesid != this.sd?.nSesid) {
        return;
      }
      // console.warn(res);
      this.queue.push(async () => {
        await this.refreshData(res);
      });
    })

  }


  async handleRefreshAnnotTransfer(msg): Promise<void> {


    try {
      if (msg.cType == 'A') {
        const currentArray = this.feedDataSubject.getValue();
        const data = msg.data || [];

        const userid = await this.secureS.getUserId();
        for (let x of data) {
          try {
            if (userid == x.nUserid) {
              // const pages: any[] = [...new Set(x?.jCordinates.map((a) => a.p))];
              const startPage = x?.jCordinates.find(a => a.p) || 0;
              const indOfAnnot = this.issueDetailAnnots.findIndex(a => a.nIDid == x.nIDid);
              if (indOfAnnot > -1) {
                if (x.isInActivated)
                  this.issueDetailAnnots = this.issueDetailAnnots.filter(a => a.nIDid != x.nIDid);
                else
                  this.issueDetailAnnots[indOfAnnot].cordinates = x?.jCordinates;
              } else {
                if (!x.isInActivated)
                  this.issueDetailAnnots.push(x);
              }
              // for (let pg of pages) {
              // for (let pg of currentArray) {
              for (let i = startPage; i < currentArray.length; i++) {
                const pg = currentArray[i];
                if (!pg["annotations"]) {
                  pg["annotations"] = [];
                }
                const annots = await this.getIssueDetailAnnotsPage(pg, pg["data"]);
                this.needScroll = false;
                pg["annotations"] = [...annots];
                // currentArray[pg - 1]["annotations"].push(...annots);
                // currentArray[pg - 1]["annotations"] = [...annots];
                // currentArray[pg - 1]["annotations"] = [...currentArray[pg - 1]["annotations"]];
              }
            }
          } catch (error) {
            console.error(error);
          }

        }
        /*
        const page = currentArray[msg?.data?.cPageno - 1];
        
        const index = page.annotations.findIndex(a => a.nIDid == msg.data.nIDid);
        if (index > -1)
          page.annotations[index] = { ...page.annotations[index], cordinates: msg.data?.jCordinates, cONote: msg.data?.cONote, cPageno: msg.data?.cPageno };
        page.annotations = [...page.annotations]*/
        // a = { ...a, ...msg.data };
        this.feedDataSubject.next(currentArray);
      } else if (msg.cType == 'H') {

        const currentArray = this.feedDataSubject.getValue();
        const data = msg.data || [];
        const userid = await this.secureS.getUserId();

        this.highlightsAnnots;

        for (let x of data) {
          if (userid == x.nUserid) {
            const indOfAnnot = this.highlightsAnnots.findIndex(a => a.nHid == x.nHid);
            if (indOfAnnot > -1) {
              this.highlightsAnnots[indOfAnnot].cPageno = x.cPageno;
              this.highlightsAnnots[indOfAnnot].cLineno = x.cLineno;
              this.highlightsAnnots[indOfAnnot].identity = x.identity;
              this.highlightsAnnots[indOfAnnot].cTime = x.cTime;
              this.highlightsAnnots[indOfAnnot].cNote = x.cNote;
            } else {
              console.warn('New highlight on refresh');
              this.highlightsAnnots.push(x);
            }
          }
        }

        // const pages: any[] = [...new Set(data.map((a) => a.cPageno))];
        const startPage = data.find(a => a.cPageno) || 0;

        // for (let pg of pages) {
        for (let i = startPage; i < currentArray.length; i++) {
          const pg = currentArray[i];
          if (!pg["hyperlinks"]) {
            pg["hyperlinks"] = [];
          }
          const hyperlinks = await this.getHighlightAnnotsPage(pg, pg["data"]);
          this.needScroll = false;
          pg["hyperlinks"] = [...hyperlinks];
        }

        /*  for (let x of data) {
            try {
              if (userid == x.nUserid) {
                currentArray[x.p - 1]["hyperlinks"] = [...(x.pageData || [])];
              }
 
            } catch (error) {
              console.error(error);
            }
  
          }*/
        this.feedDataSubject.next(currentArray);
      }
    } catch (error) {
      console.error(error);
    }

  }

  convertToFrame(timestamp) {
    // console.log(timestamp);
    if (!timestamp) return '';
    // Convert the timestamp into frames (assuming 30 frames per second)
    const [hours, minutes, seconds, frames] = timestamp.split(':').map(Number);
    return ((hours * 3600 + minutes * 60 + seconds) * 30) + frames;
  }

  convertToFrameWithoutFram(timestamp) {
    // console.log(timestamp);
    if (!timestamp) return '';
    // Convert the timestamp into frames (assuming 30 frames per second)
    const [hours, minutes, seconds, frames] = timestamp.split(':').map(Number);
    return ((hours * 3600 + minutes * 60 + seconds) * 30);
  }

  removeTimestampsInRange(timestamps, range, refreshType) {
    const [startRange, endRange] = range.map(this.convertToFrame);



    const sInd = timestamps.findIndex(({ time }) => {
      const currentFrame = this.convertToFrame(time);
      return currentFrame >= startRange && currentFrame <= endRange;
    })

    const lInd = timestamps.findLastIndex(({ time }) => {
      const currentFrame = this.convertToFrame(time);
      return currentFrame >= startRange && currentFrame <= endRange;
    })

    return timestamps.filter(({ time }, index) => {
      const currentFrame = this.convertToFrame(time);

      let isInRange = currentFrame >= startRange && currentFrame <= endRange;

      if (lInd != sInd && lInd == index && currentFrame == endRange) {
        isInRange = false
      }

      if (((lInd - sInd) + 1) > 2 && sInd == index && currentFrame == startRange) {
        try {
          const nextData = timestamps[index + 1]
          if (nextData) {
            const nextTimeRange = this.convertToFrame(nextData?.time);
            if (nextTimeRange == startRange) {
              isInRange = false
            }
          }
        } catch (error) {
        }
      }
      // try {
      //   // console.log('RANGE TYPE',refreshType);
      //   if (refreshType == 'no-first-last') {
      //     isInRange = currentFrame > startRange && currentFrame < endRange; // TODO: REMOVE ONLY THE RANGE NOT FIRST AND LAST
      //   } else if (refreshType == 'no-first') {
      //     isInRange = currentFrame > startRange && currentFrame <= endRange; // TODO: REMOVE ONLY THE RANGE NOT FIRST 
      //   } else if (refreshType == 'no-last') {
      //     isInRange = currentFrame >= startRange && currentFrame < endRange; // TODO: REMOVE ONLY THE RANGE NO LAST
      //   }
      // } catch (error) {
      // }

      return !isInRange; //  && sInd != index && lInd != index; //currentFrame < startRange || currentFrame > endRange;
    });
  }

  async refreshData(res): Promise<boolean> {

    try {
      this.isRefreshing = true;
      this.refreshCount++
      console.warn('r count ', res.current_refresh)
      // if (this.refreshCount == 23) {
      // 
      // }
      const currentArray = this.feedDataSubject.getValue();

      let newData = [];
      if (currentArray.length) {
        const flatData = this.sortArray(currentArray.map((a) => a.data).flat());
        newData = this.removeTimestampsInRange(flatData, [res.start, res.end], res?.refreshType);
      }



      if (res.newLines?.length) {
        // const newLines = [];



        for (let i = 0; res.newLines.length > i; i++) {
          try {
            const lineData = res.newLines[i];
            const obj = {
              asciiValue: lineData[1] || [],
              formate: lineData[3] || 'FL',
              lineIndex: lineData[2],
              lines: [String.fromCharCode(...lineData[1])],
              time: lineData[0],
              oPage: lineData[4] || 0,
              oLine: lineData[5] || 0,
              unicid: lineData[6] || 0,
              links: lineData[7] || [],
              refreshSeq: lineData[9]
            }

            // try {

            //   if (currentArray[i]["hyperlinks"]) {

            //   }
            // } catch (error) {

            // }

            newData.push(obj);
            // newData.splice(lineData[2], 0, obj);
          } catch (error) {
          }
        }

      }

      const blankLine = newData.filter(a => !a.time)
      if (blankLine.length) {
        console.warn('Blank Line Found', this.refreshCount, blankLine.length);
      }

      try {
        // newData.sort((a, b) => {
        //   // console.log(a);
        //   return this.convertToFrame(a.time) - this.convertToFrame(b.time);
        // });
        newData = this.sortArray(newData);
        newData = newData.filter(a => a?.time);
      } catch (error) {
        console.error(error);
      }


      const totalPagges = Math.floor(newData.length / (25)) + 1;
      for (let i = 0; totalPagges > i; i++) {
        try {
          if (!currentArray[i]) {
            currentArray[i] = {
              msg: i + 1,
              page: i + 1,
              data: [],
              annotations: [],
              hyperlinks: [],
              hyperlinksicons: []
            }
          }
        } catch (error) {

        }
        currentArray[i]["data"] = newData.slice(i * 25, (i + 1) * 25);
        try {

          // if (currentArray[i]["annotations"]){
          const annots = await this.getIssueDetailAnnotsPage(i + 1, currentArray[i]["data"]);
          currentArray[i]["annotations"] = [...annots]; // [...currentArray[i]["annotations"]]
          const hyperlinks = await this.getHighlightAnnotsPage(i + 1, currentArray[i]["data"]);
          currentArray[i]["hyperlinks"] = [...hyperlinks] //currentArray[i]["hyperlinks"];


          // }

        } catch (error) {

        }
      }

      const finalArray = Array.from(currentArray, (item, index) => item === undefined ? { msg: 1, page: index + 1, data: [] } : item);
      try {
        this.sd.lastLineNumber = finalArray[finalArray.length - 1].data.length; //update the last line number of the last page to the sessions details
      } catch (error) {

      }

      this.feedDataSubject.next(finalArray);
    } catch (error) {
      console.error(error);
    }

    this.clearRefreshStatu()
    return true;
  }

  convertSortTimestamp(timestamp) {
    // console.log(timestamp);
    if (!timestamp) return '';
    // Convert the timestamp into frames (assuming 30 frames per second)
    const [hours, minutes, seconds, frames] = timestamp.split(':').map(Number);
    return ((hours * 3600 + minutes * 60 + seconds) * 30) + frames;
  }

  sortArray(array) {
    // array.sort((a, b) => {
    //     return this.convertToFrame(a[0]) - this.convertToFrame(b[0]);
    //   });
    return array.sort((a, b) => {
      const frameA: any = this.convertSortTimestamp(a?.time);
      const frameB: any = this.convertSortTimestamp(b?.time);
      if (frameA !== frameB) return frameA - frameB;

      // 2nd level: sort by a[4]
      // const valA4 = a?.oPage ?? 0;
      // const valB4 = b?.oPage ?? 0;
      // if (valA4 !== valB4) return valA4 - valB4;


      const valA2 = a?.unicid ?? 0;
      const valB2 = b?.unicid ?? 0;
      if (valA2 !== valB2) return valA2 - valB2;
      // 3rd level: sort by a[2]
      // const valA2 = a?.oLine ?? 0;
      // const valB2 = b?.oLine ?? 0;
      // if (valA2 !== valB2) return valA2 - valB2;

      // // 4th level: sort by a[9]
      // const valA9 = a?.refreshSeq ?? 0;
      // const valB9 = b?.refreshSeq ?? 0;
      // return valA9 - valB9;  // If both conditions are equal, return 0
      return 0;
    });
  }


  clearRefreshStatu() {
    try {
      clearTimeout(this.refreshInterval)
    } catch (error) {

    }
    this.refreshInterval = setTimeout(() => {

      this.isRefreshing = false;
    }, 400);
  }



  deIntilizeDemoMode() {
    try {
      if (this.onSubscription_democurrent)
        this.onSubscription_democurrent.unsubscribe();
    } catch (error) {
    }
  }

  initilizeDemoMode() {
    this.deIntilizeDemoMode();
  }

  getDataLength() {
    console.warn('LENGTH', this.feedDataSubject.getValue().length);
    return this.feedDataSubject.getValue().length;
  }

  async initPages(current_session: sessionDataMDL): Promise<boolean> {
    // alert(2)
    console.warn(`Initilizing Pages total:${current_session?.maxNumber}`);
    this.sd = current_session;
    let arra = [];
    for (let i = 1; current_session.maxNumber >= i; i++) {
      arra.push({ page: i, data: [], annotations: [], hyperlinks: [], msg: `Page ${i}` })
    }
    this.feedDataSubject.next(arra.slice());
    this.needScroll = true;
    if (current_session.pageRes) {
      let res = {
        "msg": 1,
        "page": current_session.maxNumber,
        "data": current_session.pageRes,
        "totalPages": current_session.maxNumber,
        "nSesid": current_session.nSesid,
        "a": [],
        "h": []
      }
      await this.addPreviousFeedData(res);
    }


    try {
      if (current_session?.secondLastRes && (current_session.maxNumber - 1) > 0) {
        let res = {
          "msg": 1,
          "page": current_session.maxNumber - 1,
          "data": current_session.secondLastRes,
          "totalPages": current_session.maxNumber - 1,
          "nSesid": current_session.nSesid,
          "a": [],
          "h": []
        }
        this.addPreviousFeedData(res)
      }

    } catch (error) {
      console.error(error);
    }


    return true;
  }


  init_session_room(ssession: sessionDataMDL) {

    this.socketService.joinRealtime(this.sd?.nSesid)

  }

  addQuestionBold() {
    this.isBolad = false;
    let feeddata = this.feedDataSubject.getValue();
    feeddata.forEach((page) => {
      page.data.forEach((line) => {
        try {
          if (line.lines[0].trim().toUpperCase().substring(0, 2).toLowerCase() == 'q.') {
            this.isBolad = true;
            // line.lines[0] = line.lines[0].replace('?','<b>?</b>')
          } else if (line.lines[0].trim().toUpperCase().substring(0, 2).toLowerCase() == 'a.') {
            this.isBolad = false;
          }
          if (this.isBolad)
            line.isBold = true;

          //  console.warn('BOLD', this.isBolad)
          // line = {...line}
        } catch (error) {
          console.error(error)
        }

      })
      page.data = [...page.data]
    })

    this.feedDataSubject.next(feeddata)

  }

  leaveRoom(id?: any) {
    this.socketService.leaveRealtime(id ? id : this.sd?.nSesid);
  }

  clearAllDisconnected() {

    this.leaveRoom();
    this.receivedPages = 0;
    this.isCalled = false;
    // try {
    if (this.onSubscription_previous) {
      // console.log('DESTROYING PREVIOUS SUBSCRIPTION')
      this.onSubscription_previous.unsubscribe();
    }

    if (this.onSubscription_current) {
      this.onSubscription_current.unsubscribe();
    }



    if (this.onSubscriptionRefresh_current) {
      this.onSubscriptionRefresh_current.unsubscribe();
    }

    if (this.onSubscription_linereplace) {
      this.onSubscription_linereplace.unsubscribe();
    }
    if (this.onSubscription_linedelete) {
      this.onSubscription_linedelete.unsubscribe();
    }
    if (this.onSubscription_lineaddon) {
      this.onSubscription_lineaddon.unsubscribe();
    }
    if (this.onSubscription_refresh) {
      this.onSubscription_refresh.unsubscribe();
    }
    this.deIntilizeDemoMode();
    // this.feedDataSubject.complete();
    this.feedDataSubject.next([]);
    this.feedDataHoldSubject.next([]);
    this.StopstreamDemoData();
    // this.feedData$.next();
    // this.feedData$.complete();

    // } catch (error) {

    // }

  }


  setIdValue() {
    this.currentIsseuDetailId = null;
  }

  getcurrentactive() {
    return this.currentIsseuDetailId
  }




  fetchAnnotation(page: number) {
    return this.annotationsArray.filter(a => a.pageIndex == page);
  }

  fetchHyperlinks(page: number) {
    try {
      return this.hyperlinksArray.filter(a => Number(a.cPageno) == page);
    } catch (error) {
      console.error(error);
    }
    return [];
  }


  StopstreamDemoData() {
  }


  streamDemoData(nSesid, nUserid, nCaseid) {
  }

  initialize(sessionDetails: any, nUserid: string, tab: number) {
    // alert(JSON.stringify(sessionDetails))
    this.sd = sessionDetails;
    this.currentTab = tab;
    console.warn('Fetch data', { nSesid: sessionDetails.nSesid, nUserid: nUserid, nCaseid: sessionDetails.nCaseid, tab: this.currentTab })
    // if(this.realtime?.compareMode){
    //   this.socketService.sendMessageR('fetch-data', { nSesid: sessionDetails.nSesid, nUserid: nUserid, nCaseid: sessionDetails.nCaseid, tab: this.currentTab });
    // }else{

    this.socketService.sendMessage('fetch-data', { nSesid: sessionDetails.nSesid, nUserid: nUserid, nCaseid: sessionDetails.nCaseid, tab: this.currentTab, cProtocol: sessionDetails.cProtocol, tabSessionId: this.tabSessionId });
    // }

    // 
    this.setGlobalLineNumber()
    // this.globalLineNumber = sessionDetails.lastPage * 25 + sessionDetails.lastLineNumber;
  }

  getTotalLength() {
    return this.feedDataSubject.getValue().length;
  }

  setGlobalLineNumber() {
    try {
      // this.sd.globalLineNo = Number(Number(this.sd.lastPage) - 1) * (this.sd.settings.lineNumber) + this.feedDataSubject.getValue()[Number(this.sd.lastPage) - 1].data.length;
    } catch (error) {

    }
  }

  removeTemp(pageIndex: number) {
    const currentArray = this.feedDataSubject.getValue();
    if (currentArray[pageIndex] && currentArray[pageIndex]["annotations"]) {
      currentArray[pageIndex]["annotations"] = currentArray[pageIndex]["annotations"].filter(a => !a.temp);
      this.needScroll = false;
    }
  }

  getLineOfCurPage(globalLineNumber: Number): Number {
    return ((Number(globalLineNumber) - 1) % Number(this.sd?.settings?.lineNumber)) + 1;
  }

  checkTempAnnotatation(pageIndex: number): void {
    this.removeTempData();
    if (pageIndex != null) {
      this.tempAnnotationArray.push(pageIndex);
    }
  }

  private removeTempData() {
    if (this.tempAnnotationArray.length) {
      this.tempAnnotationArray.forEach((i) => {
        try {
          this.removeTemp(i)
        } catch (error) {
        }
      })
      this.tempAnnotationArray = [];
    }
  }

  removeAnnotation(nIDid: string, pageNumber: number) {

    if (nIDid) {
      const currentArray = this.feedDataSubject.getValue();
      const annotInd = this.issueDetailAnnots.findIndex(a => a.nIDid == nIDid)
      if (annotInd > -1) {
        // const pages = [...new Set(this.issueDetailAnnots[annotInd]?.cordinates.map((a) => a.p))];
        const pages = currentArray.filter(a => a.annotations?.findIndex(b => b.nIDid == nIDid) > -1).map(a => a.page);

        for (let pg of pages) {
          if (currentArray[pg - 1]) {
            if (!currentArray[pg - 1]["annotations"]) {
              currentArray[pg - 1]["annotations"] = [];
            }
            this.needScroll = false;
            currentArray[pg - 1]["annotations"] = currentArray[pg - 1]["annotations"].filter(a => a.nIDid != nIDid)
          }
        }

        this.issueDetailAnnots.splice(annotInd, 1);

        try {
          if (this.pausedState) {
            const currentArray = this.feedDataHoldSubject.getValue();
            const pages = currentArray.filter(a => a.annotations?.findIndex(b => b.nIDid == nIDid) > -1).map(a => a.page);
            for (let pg of pages) {
              if (currentArray[pg - 1]) {
                if (!currentArray[pg - 1]["annotations"]) {
                  currentArray[pg - 1]["annotations"] = [];
                }
                this.needScroll = false;
                currentArray[pg - 1]["annotations"] = currentArray[pg - 1]["annotations"].filter(a => a.nIDid != nIDid)
              }
            }
            this.feedDataHoldSubject.next(currentArray);
          }
        } catch (error) {
        }
      }

      /*
            if (!currentArray[pageNumber - 1]["annotations"]) {
              currentArray[pageNumber - 1]["annotations"] = [];
            }
            this.needScroll = false;
            currentArray[pageNumber - 1]["annotations"] = currentArray[pageNumber - 1]["annotations"].filter(a => a.nIDid != nIDid) 
            */

      this.annotationsArray = this.annotationsArray.filter(a => a.nIDid != nIDid)

    }

  }



  addAnnotationToQueue(pageIndex: number, annotation: Annotation) {
    if (this.pausedState) {
      this.addAnnotation(pageIndex, annotation);
    } else {
      this.queue.unshift(async () => {
        try {
          await this.addAnnotation(pageIndex, annotation);
        } catch (error) {

        }
      });
    }
  }

  async addAnnotation(pageIndex: number, annotation: Annotation): Promise<void> {

    this.removeTempAnnotation(pageIndex);
    const currentArray = this.feedDataSubject.getValue();
    let pages = [...new Set(annotation?.cordinates.map((a) => a.p))];
    const ind = this.issueDetailAnnots.findIndex(a => a.nIDid == annotation.nIDid);
    if (ind == -1) {
      this.issueDetailAnnots.push(annotation);
    } else {
      pages = currentArray.filter(a => a.annotations?.findIndex(b => b.nIDid == annotation.nIDid) > -1).map(a => a.page);
      this.issueDetailAnnots[ind] = { ...this.issueDetailAnnots[ind], ...annotation }
    }
    this.annotationsArray.push(annotation);

    for (let pg of pages) {
      if (!currentArray[pg - 1]["annotations"]) {
        currentArray[pg - 1]["annotations"] = [];
      }
      const annots = await this.getIssueDetailAnnotsPage(pg, currentArray[pg - 1]["data"]);
      this.needScroll = false;
      currentArray[pg - 1]["annotations"] = [...annots];
      currentArray[pg - 1]["annotations"] = [...currentArray[pg - 1]["annotations"]];
    }
    this.feedDataSubject.next(currentArray);


    if (this.pausedState) {
      const currentArray = this.feedDataHoldSubject.getValue();
      let pages = [...new Set(annotation?.cordinates.map((a) => a.p))];
      for (let pg of pages) {
        if (!currentArray[pg - 1]["annotations"]) {
          currentArray[pg - 1]["annotations"] = [];
        }
        const annots = await this.getIssueDetailAnnotsPage(pg, currentArray[pg - 1]["data"]);
        this.needScroll = false;
        currentArray[pg - 1]["annotations"] = [...annots];
        currentArray[pg - 1]["annotations"] = [...currentArray[pg - 1]["annotations"]];
      }
      this.feedDataHoldSubject.next(currentArray);
    }

  }


  removeTempAnnotation(pageIndex: number) {
    try {
      const currentArray = this.feedDataSubject.getValue();
      if (!currentArray[pageIndex - 1]["annotations"]) {
        currentArray[pageIndex - 1]["annotations"] = [];
      }
      this.needScroll = false;
      let ind = this.annotationsArray.findIndex(a => a.temp && a.pageIndex == pageIndex)
      if (ind > -1) {
        this.annotationsArray.splice(ind, 1);
      }

      let ind2 = currentArray[pageIndex - 1]["annotations"].findIndex(a => a.temp)
      if (ind2 > -1) {
        currentArray[pageIndex - 1]["annotations"].splice(ind2, 1);
      }
    } catch (error) {

    }

  }

  async addHyperlinkToQueue(pageIndex: number, mdl: any, groupData: any) {
    if (this.pausedState) {
      await this.addHyperlink(pageIndex, mdl, groupData);
    } else {
      this.queue.unshift(async () => {
        try {

          await this.addHyperlink(pageIndex, mdl, groupData);
        } catch (error) {

        }
      });
    }
  }

  async removeHyperlinkToQueue(pageIndex: number, nHid, groupData: any) {
    if (this.pausedState) {
      await this.removeHyperlink(pageIndex, nHid, groupData);
    } else {
      this.queue.unshift(async () => {
        try {
          await this.removeHyperlink(pageIndex, nHid, groupData);
        } catch (error) {

        }
      });
    }
  }

  async addHyperlink(pageIndex: number, mdl: any, groupData: any): Promise<void> {

    this.highlightsAnnots;
    const currentArray = this.feedDataSubject.getValue();
    if (!currentArray[pageIndex - 1]["hyperlinks"]) {
      currentArray[pageIndex - 1]["hyperlinks"] = [];
    }
    this.needScroll = false;

    const ind = this.highlightsAnnots.findIndex(a => a.nHid == mdl.nHid);
    if (ind == -1) {
      this.highlightsAnnots.push(mdl);
    } else {
      this.highlightsAnnots[ind] = { ...this.highlightsAnnots[ind], ...mdl };
    }


    const pageAnnots = await this.getHighlightAnnotsPage(pageIndex, currentArray[pageIndex - 1]["data"]);
    currentArray[pageIndex - 1]["hyperlinks"] = pageAnnots;
    this.feedDataSubject.next(currentArray);


    if (this.pausedState) {
      const currentArray = this.feedDataHoldSubject.getValue();
      const pageAnnots = await this.getHighlightAnnotsPage(pageIndex, currentArray[pageIndex - 1]["data"]);
      currentArray[pageIndex - 1]["hyperlinks"] = pageAnnots;
      this.feedDataHoldSubject.next(currentArray);
    }
  }

  async removeHyperlink(pageIndex: number, nHid, groupData: any) {
    this.highlightsAnnots;

    const currentArray = this.feedDataSubject.getValue();
    if (!currentArray[pageIndex - 1]["hyperlinks"]) {
      currentArray[pageIndex - 1]["hyperlinks"] = [];
    }
    this.needScroll = false;

    this.highlightsAnnots = this.highlightsAnnots.filter(a => a.nHid != nHid);



    const pageAnnots = await this.getHighlightAnnotsPage(pageIndex, currentArray[pageIndex - 1]["data"])
    currentArray[pageIndex - 1]["hyperlinks"] = pageAnnots;



    this.feedDataSubject.next(currentArray);


    if (this.pausedState) {

      const currentArray = this.feedDataHoldSubject.getValue();
      const pageAnnots = await this.getHighlightAnnotsPage(pageIndex, currentArray[pageIndex - 1]["data"])
      currentArray[pageIndex - 1]["hyperlinks"] = pageAnnots;
      this.feedDataHoldSubject.next(currentArray);

    }

  }

  fetchIdByGroupData(groupData: any, a: any, col) {

    try {
      const link = groupData.find(m => m.nHid == a.nHid);
      if (link) {
        return link[col] ? link[col] : null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }




  addHyperlinkicons(pageIndex: number, mdl) {

    const currentArray = this.feedDataSubject.getValue();

    if (!currentArray[pageIndex - 1]["hyperlinksicons"]) {
      currentArray[pageIndex - 1]["hyperlinksicons"] = [];
    }

    this.needScroll = false;
    // let ind2 = currentArray[pageIndex - 1]["hyperlinksicons"].findIndex(a => a.nHid == mdl.nHid)
    // if (ind2 == -1) {
    currentArray[pageIndex - 1]["hyperlinksicons"] = mdl;
    // }
    // if (this.hyperlinksArray.findIndex(a => a.nHid == mdl.nHid) == -1) {
    //   this.hyperlinksArray.push(mdl);
    // }

    if (this.pausedState) {

      const currentArray = this.feedDataHoldSubject.getValue();
      if (!currentArray[pageIndex - 1]["hyperlinksicons"]) {
        currentArray[pageIndex - 1]["hyperlinksicons"] = [];
      }
      this.needScroll = false;
      currentArray[pageIndex - 1]["hyperlinksicons"] = mdl;
    }
  }

  async updateHyperlink(pageIndex: number, nHid, color: any, jIssues) {
    const currentArray = this.feedDataSubject.getValue();
    if (!currentArray[pageIndex - 1]["hyperlinks"]) {
      currentArray[pageIndex - 1]["hyperlinks"] = [];
    }

    const ind = this.highlightsAnnots.findIndex(a => a.nHid == nHid);

    if (ind > -1) {
      this.highlightsAnnots[ind] = { ...this.highlightsAnnots[ind], cColor: color, issueids: jIssues };
    }

    const pageAnnots = await this.getHighlightAnnotsPage(pageIndex, currentArray[pageIndex - 1]["data"])
    currentArray[pageIndex - 1]["hyperlinks"] = pageAnnots;

    this.feedDataSubject.next(currentArray);

    if (this.pausedState) {
      const currentArray = this.feedDataHoldSubject.getValue();
      const pageAnnots = await this.getHighlightAnnotsPage(pageIndex, currentArray[pageIndex - 1]["data"])
      currentArray[pageIndex - 1]["hyperlinks"] = pageAnnots;
      this.feedDataHoldSubject.next(currentArray);
    }
  }



  isAnnotationExists(pageIndex: number, nIDid: string) {
    try {
      const currentArray = this.feedDataSubject.getValue();
      if (!currentArray[pageIndex]["annotations"]) {
        currentArray[pageIndex]["annotations"] = [];
      }
      if (currentArray[pageIndex]["annotations"].length) {
        let ind = currentArray[pageIndex]["annotations"].findIndex(a => a.nIDid == nIDid);
        return ind > -1;
      }
    } catch (error) {
      console.error(error);
    }


    try {
      if (this.pausedState) {
        const currentArray = this.feedDataHoldSubject.getValue();
        if (!currentArray[pageIndex]["annotations"]) {
          currentArray[pageIndex]["annotations"] = [];
        }
        if (currentArray[pageIndex]["annotations"].length) {
          let ind = currentArray[pageIndex]["annotations"].findIndex(a => a.nIDid == nIDid);
          return ind > -1;
        }
      }
    } catch (error) {

    }
    return false;
  }

  bindAllAnnotes(issueAnnotations: Annotation[]) {
    this.annotationsArray = issueAnnotations;
    return;
    // return new Promise((resolve, reject) => {

    const currentArray = this.feedDataSubject.getValue();
    try {
      this.needScroll = false;
      issueAnnotations.forEach((annotation: Annotation) => {
        try {
          if (!currentArray[annotation.pageIndex - 1]["annotations"]) {
            currentArray[annotation.pageIndex - 1]["annotations"] = [];
          }
          // currentArray[annotation.pageIndex - 1]["annotations"].push(annotation);
          console.log('push', annotation.pageIndex)
          currentArray[annotation.pageIndex - 1]["annotations"] = [...currentArray[annotation.pageIndex - 1]["annotations"], ...[annotation]];
        } catch (error) {
          console.error(error);
        }
      })
    } catch (error) {
      console.error(error);
    }
    this.feedDataSubject.next(currentArray.slice());
    // resolve(true);
    // })

  }


  bindAllHyperlinks(hyperlinks: hyperLinksMDL[]) {

    if (!hyperlinks.length) {
      return;
    }
    this.hyperlinksArray = hyperlinks;
    return;
    const currentArray = this.feedDataSubject.getValue();
    this.needScroll = false;
    hyperlinks.forEach((e: hyperLinksMDL) => {
      if (!currentArray[Number(e.cPageno) - 1]["hyperlinks"]) {
        currentArray[Number(e.cPageno) - 1]["hyperlinks"] = [];
      }
      // currentArray[Number(e.cPageno) - 1]["hyperlinks"].push(e);
      currentArray[Number(e.cPageno) - 1]["hyperlinks"] = [...currentArray[Number(e.cPageno) - 1]["hyperlinks"], ...[e]];
    })
  }



  getData() {
    return this.feedDataSubject.getValue();
  }


  async addPreviousFeedData(res: any): Promise<void> {
    // if (res.page == 1)
    //   
    // Parse the received data


    if (res.nSesid != this.sd?.nSesid) {
      return;
    }

    let feeddata = this.feedDataSubject.getValue();
    let parsedData
    try {
      parsedData = JSON.parse(res.data);
    } catch (error) {
      console.error(error, parsedData, res)
      return;
    }
    let formattedData;
    try {
      formattedData = parsedData.filter(e => e).map((item: any) => {
        return {
          // time: item[0],  
          // asciiValue: item[1],
          // lineIndex: item[2],
          // lines: [String.fromCharCode(...item[1])],
          // formate: item[3] || 'FL'
          time: item[0] || '',
          asciiValue: item[1] || [],
          lines: [this.convertAsciiToVisibleString(item[1] || [])], // Convert ASCII values to text
          lineIndex: item[2] || 0,
          formate: item[3] || 'FL',
          oPage: item[4] || 0,
          oLine: item[5] || 0,
          unicid: item[6] || 0,
          links: item[7] || [],
          // isBolad:true
        };
      });
    } catch (error) {
      console.error(error)
      // console.log('Parsed data', parsedData)
    }

    // feeddata.push(data);
    // console.warn(feeddata);
    let objs = feeddata.find((e) => e && e?.page == res.page);

    try {
      res.a = [...await this.getIssueDetailAnnotsPage(res.page, formattedData)];
    } catch (error) {
      console.error(error);
    }

    try {
      res.h = [...await this.getHighlightAnnotsPage(res.page, formattedData)];
    } catch (error) {
      console.error(error);
    }

    let data: any = {
      msg: res.msg,
      page: res.page,
      data: formattedData,
      annotations: res.a ? res.a : [],
      // tempdata: res.a ? res.a : [],
      hyperlinks: res.h ? res.h : [],

      hyperlinksicons: [],
      // oPage: res.oPage,
      // oLine: res.oLine

    }

    if (!objs) {
      if (!feeddata[res.page - 1]) {
        feeddata[res.page - 1] = [];
      }
      feeddata[res.page - 1] = data;
    } else {

      objs.data = formattedData
      objs.annotations = res.a ? res.a : [];
      // tempdata: res.a ? res.a : [],
      objs.hyperlinks = res.h ? res.h : []
    }
    feeddata = Array.from(feeddata, (item, index) => item === undefined ? { msg: 1, page: index + 1, data: [] } : item);
    feeddata.sort((a, b) => a.page - b.page);

    // console.warn('Length', feeddata.length, feeddata);
    try {
      this.sd.lastPage = feeddata.length//update the last page number to the sessions details
      this.sd.lastLineNumber = (feeddata[feeddata.length - 1] && feeddata[feeddata.length - 1].data) ? feeddata[feeddata.length - 1].data.length : 1; //update the last line number of the last page to the sessions details

    } catch (error) {
      // console.error('ERR SESS', error);
    }
    this.feedDataSubject.next(feeddata.slice());
    //return [data];
    // Find the existing page or add a new one
    // const existingPage = feeddata.find(page => page.page === res.page);
    // if (existingPage) {
    //   existingPage.data = formattedData;
    // } else {
    //   feeddata = [...feeddata, data];
    // }
    // Sort feedData by page number to maintain order
    // console.log('this.feedData 2', this.feedDataSubject.getValue())
    // Trigger change detection to update the view
  }

  getIssueDetailAnnotsPage(page, formattedData) {

    const issues = [];


    if (this.issueDetailAnnots?.length) {
      this.issueDetailAnnots.forEach((a) => {
        const obj = { ...a }

        try {
          if (this.sd?.cProtocol == 'C') {
            if ((a?.cordinates || a?.jCordinates)) {
              const pages = [...new Set((a?.cordinates || a?.jCordinates).map(m => m.p))];
              if (pages.includes(Number(a.pageIndex))) {
                const cordinates = (a?.cordinates || a?.jCordinates).filter(m => m.p == page);
                if (cordinates?.length) {
                  try {
                    if (pages?.length > 1) {
                      if (pages[pages.length - 1] == page) {
                        obj.isRefrence = true;
                      }
                    }
                  } catch (error) {
                  }
                  obj.cordinates = cordinates;
                  obj.orgCordinates = (a?.cordinates || a?.jCordinates);
                  issues.push(obj);
                }

                /*if (cordinates?.length) {
                  try {
                    if (pages?.length > 1) {
                      const firstPage = Math.min(...pages);
                      const lastPage = Math.max(...pages);

                      if (page == firstPage) {
                        // FIRST page of multi-page annotation
                        obj.firstrefrence = true;
                        // Calculate total height based on lines and pages
                        const allCoordinates = (a?.cordinates || a?.jCordinates);
                        const heightData = this.calculateAnnotationHeight(allCoordinates);
                        obj.highestY = heightData.totalHeight;
                        obj.pageCount = heightData.pageCount;
                      } else {
                        // Other pages in multi-page annotation
                        obj.isRefrence = true;
                      }
                    }
                  } catch (error) {
                  }
                  obj.cordinates = cordinates;
                  obj.orgCordinates = (a?.cordinates || a?.jCordinates);
                  issues.push(obj);
                }*/
              }
            }
          } else {

            if ((a?.cordinates || a?.jCordinates)) {
              // const cordinates = (a?.cordinates || a?.jCordinates).filter(m => formattedData.findIndex(n => (n.unicid ? n.unicid == m.identity : (n.unicid == 0 || this.dataMode == 'T')) && n.time == m.t) > -1)
              const cordinates = (a?.cordinates || a?.jCordinates).filter(m => formattedData.findIndex(n => (n.unicid == m.identity || n.unicid == 0 || this.dataMode == 'T') && n.time == m.t) > -1)
              if (cordinates?.length) {
                try {
                  const firstIndex = formattedData.findIndex(n => (n.unicid == cordinates[0].identity || n.unicid == 0) && n.time == cordinates[0].t)
                  if (cordinates[0]["identity"] != (a?.cordinates || a?.jCordinates)[0]["identity"] && firstIndex == 0) {
                    obj.isRefrence = true;
                  }

                  /*// Check for multi-page annotations in default mode
                  const allPages = [...new Set((a?.cordinates || a?.jCordinates).map(m => m.p))];
                  if (allPages?.length > 1) {
                    const firstPage = Math.min(...allPages);
                    const currentPageFromCoordinates = cordinates[0]?.p; // Get current page from coordinates

                    if (currentPageFromCoordinates == firstPage) {
                      // FIRST page of multi-page annotation
                      obj.firstrefrence = true;
                      // Calculate total height based on lines and pages
                      const allCoordinates = (a?.cordinates || a?.jCordinates);
                      const heightData = this.calculateAnnotationHeight(allCoordinates);
                      obj.highestY = heightData.totalHeight;
                      obj.pageCount = heightData.pageCount;
                    } else {
                      // Other pages in multi-page annotation
                      obj.isRefrence = true;
                    }
                  }*/

                } catch (error) {
                }
                obj.cordinates = cordinates;
                obj.orgCordinates = (a?.cordinates || a?.jCordinates);
                issues.push(obj);
              }
            }

          }

        } catch (error) {
          console.error(error);
        }
      })
    }
    return issues || [];
  }




  /*calculateAnnotationHeight(coordinates) { 
    try {
      if (!coordinates || coordinates.length === 0) {
        return { totalHeight: 0, pageCount: 0 };
      }

      // Simply count total coordinates (rects) across all pages
      const totalRectCount = coordinates.length;

      // Count unique pages
      const uniquePages = [...new Set(coordinates.map(coord => coord.p))];
      const pageCount = uniquePages.length;

      console.log(`Annotation spans ${pageCount} pages, ${totalRectCount} total rects`);

      return {
        totalHeight: totalRectCount * 24,  // Total number of coordinates/rects
        pageCount: pageCount
      };

    } catch (error) {
      console.error('Error calculating annotation height:', error);
      return { totalHeight: 0, pageCount: 0 };
    }
  }*/


  getIssueDetailAnnotsPage_old(page, formattedData) {

    const issues = [];

    if (this.issueDetailAnnots?.length) {
      this.issueDetailAnnots.forEach((a) => {
        const obj = { ...a }

        try {
          if (this.sd?.cProtocol == 'C') {
            if ((a?.cordinates || a?.jCordinates)) {
              const pages = [...new Set((a?.cordinates || a?.jCordinates).map(m => m.p))];
              if (pages.includes(Number(a.pageIndex))) {
                const cordinates = (a?.cordinates || a?.jCordinates).filter(m => m.p == page);
                if (cordinates?.length) {
                  try {
                    if (pages?.length > 1) {
                      if (pages[pages.length - 1] == page) {
                        obj.isRefrence = true;
                      }
                    }
                  } catch (error) {
                  }
                  obj.cordinates = cordinates;
                  issues.push(obj);
                }
              }
            }
          } else {

            if ((a?.cordinates || a?.jCordinates)) {
              const cordinates = (a?.cordinates || a?.jCordinates).filter(m => formattedData.findIndex(n => (n.unicid == m.identity || n.unicid == 0 || this.dataMode == 'T') && n.time == m.t) > -1)
              if (cordinates?.length) {
                try {
                  const firstIndex = formattedData.findIndex(n => (n.unicid == cordinates[0].identity || n.unicid == 0) && n.time == cordinates[0].t)
                  if (cordinates[0]["identity"] != (a?.cordinates || a?.jCordinates)[0]["identity"] && firstIndex == 0) {
                    obj.isRefrence = true;
                  }
                } catch (error) {
                }
                obj.cordinates = cordinates;
                issues.push(obj);
              }
            }

          }


        } catch (error) {
          console.error(error);
        }
      })
    }
    return issues || [];
  }

  getHighlightAnnotsPage(pageno: number, formattedData) {
    debugger;
    try {
      if (this.sd?.cProtocol == 'C') {
        const issues = [...this.highlightsAnnots.filter(a => a.cPageno == pageno)];
        issues.map((a, index) => a.nGroupid = index);
        return this.assignGroups(issues);
      } else {
        const issues = [];
        this.highlightsAnnots.forEach((a) => {
          try {
            // if (a.issueids) {
            const firstIndex = formattedData.findIndex(n => this.convertToFrameWithoutFram(n.time) == this.convertToFrameWithoutFram(a.cTime) && (n.unicid == a.identity || this.dataMode == 'T')); //  || n.oLine == a.oL
            if (firstIndex > -1) {
              const obj = { ...a };
              obj.cPageno = pageno;
              obj.cLineno = firstIndex + 1;
              issues.push(obj);
            }
            // }
          } catch (error) {
          }
        })
        issues.map((a, index) => a.nGroupid = index);
        return this.assignGroups(issues);
      }
    } catch (error) {
      console.error(error);
      return [];
    }
    /*const pageissueAnnots = this.highlightsAnnots?.filter(a => a.cPageno == pageno) || [];
    pageissueAnnots.map((a, index) => a.nGroupid = index);
    return this.assignGroups([...pageissueAnnots]);*/
  }

  normalizeIssueIds(issueids) {
    try {
      // return issueids.split(',').map(Number).sort((a, b) => a - b).join(',');
      return issueids.split(',').map(String).join(',');
    } catch (error) {
      return ''
    }
  }

  assignGroups(highlights) {
    // Step 1: Normalize issueids
    highlights.forEach(h => {
      h.normIssueids = this.normalizeIssueIds(h.issueids);
    });

    // Step 2: Group by (cPageno, normIssueids)
    const grouped = {};
    highlights.forEach(h => {
      const key = `${h.cPageno}_${h.normIssueids}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(h);
    });

    let groupId = 1;
    const result = [];

    for (const key in grouped) {
      const group = grouped[key];

      // Sort by cLineno
      group.sort((a, b) => a.cLineno - b.cLineno);

      // Calculate grp = cLineno - index
      const subgroups = {};
      group.forEach((item, idx) => {
        const grp = item.cLineno - idx;
        if (!subgroups[grp]) subgroups[grp] = [];
        subgroups[grp].push(item);
      });

      // Assign groupId
      for (const g in subgroups) {
        subgroups[g].forEach(item => {
          result.push({
            ...item,
            nGroupid: groupId,
          });
        });
        groupId++;
      }
    }

    // Optional: sort by nHid or original order
    result.sort((a, b) => a.nHid - b.nHid);
    return result;
  }



  convertAsciiToVisibleString(asciiArray: number[]): string {
    return asciiArray.map(code => {
      if (code === 17)
        return '&emsp;'; // Using a right arrow tab symbol as a placeholder
      return String.fromCharCode(code);
    }).join('');
  }

  async addLiveFeedData(res: any): Promise<boolean> {
    // Parse the received data
    //  console.warn('FEED REC', res)


    try {

      if (res.date != this.sd?.nSesid) {
        return true;
      }

      const parsedData = res.d || [];
      let formattedData
      try {
        formattedData = parsedData.map((item: any) => ({
          time: item[0] || '',
          asciiValue: item[1] || [],
          lines: [this.convertAsciiToVisibleString(item[1] || [])], // Convert ASCII values to text
          lineIndex: item[2] || 0,
          formate: item[3] || 'FL',
          oPage: item[4] || 0,
          oLine: item[5] || 0,
          unicid: item[6] || 0,
          links: item[7] || []
        }));

        // console.log(formattedData);
      } catch (error) {
        console.error(error)
        // console.log('Parsed data', parsedData)
      }
      try {
        formattedData = formattedData || [];
        formattedData = formattedData.filter(a => a.lineIndex > -1 && a.time)
      } catch (error) {

      }

      // console.warn('DTR ',this.pausedState,this.pausedData.length)
      /* if (this.pausedState) {
         this.pausedData.push(...formattedData);
         return true;
       }*/


      await this.updateFeedData(formattedData);
    } catch (error) {
      console.error(error);
    }

    return true;
  }


  async updateFeedData(formattedData): Promise<boolean> {
    try {
      let storeData = this.feedDataSubject.getValue() || []; // 'feedData';
      // console.log('live feed data received', formattedData, storeData);
      formattedData.forEach((item: any, index) => {
        // Calculate the page number and line number within the page
        const lineNo = (((this.sd && this.sd.settings && this.sd.settings.lineNumber) ? this.sd.settings.lineNumber : 25) || 25);
        const pageIndex = Math.floor(item.lineIndex / lineNo);
        const lineIndex = item.lineIndex % lineNo;
        // console.log('pageIndex',pageIndex)
        // console.warn(`P ${pageIndex + 1}`)
        // Find the existing page or create a new one
        // let page = storeData.find(page => page.page === (pageIndex + 1));
        // console.log('page',page)
        if (!storeData[pageIndex]) {
          // console.warn(`Page ${pageIndex + 1} Not Found`)
          storeData[pageIndex] = {
            msg: `Page ${pageIndex + 1}`,
            page: pageIndex + 1,
            data: [], // Array(25).fill(null) // Initialize an array with 25 nulls
            annotations: [],
            hyperlinks: []
          };
          // storeData.push(page);
        }
        this.checkForBlankPages(storeData, pageIndex);
        let page = storeData[pageIndex];

        try {
          if (this.sd?.cProtocol == 'C') {
            if (item.lines[0].trim().toUpperCase().substring(0, 2).toLowerCase() == 'q.') {
              this.isBolad = true;
            } else if (item.lines[0].trim().toUpperCase().substring(0, 2).toLowerCase() == 'a.') {
              this.isBolad = false;
            }
          }
        } catch (error) {
          console.error(error);
        }

        if (!page.data[lineIndex]) {
          page.data[lineIndex] = {};
        }
        // item.isBold = this.isBolad

        let boldVal;
        try {
          boldVal = page.data[lineIndex]["isBold"];
        } catch (error) {
          console.error(error);
        }

        page.data[lineIndex] = {
          time: item.time,
          asciiValue: item.asciiValue,
          lineIndex: item.lineIndex,
          lines: item.lines,
          formate: item.formate || 'FL',
          isBold: boldVal,
          isHilighted: (page.data[lineIndex] && page.data[lineIndex]["isHilighted"] ? page.data[lineIndex]["isHilighted"] : null),
          cColor: (page.data[lineIndex] && page.data[lineIndex]["cColor"] ? page.data[lineIndex]["cColor"] : null),
          oPage: item.oPage,
          oLine: item.oLine,
          unicid: item.unicid,
          links: item.links
        };

        try {
          if (this.sd?.cProtocol == 'C' && index == formattedData?.length - 1) {
            page.data[lineIndex]["isBold"] = this.isBolad;
          }
        } catch (error) {
          console.error(error);

        }

        try {
          if (page.data.includes(undefined)) {
            page.data = Array.from(page.data, (item, index) => item === undefined ? {
              time: '0:0:0:0',
              asciiValue: [],
              lineIndex: index,  // Set the current index as the lineIndex
              lines: [''],
              formate: 'FL',
              isBold: false
            } : item);
            // page.data = Array.from(page.data, item => item === undefined ? {
            //   time: '00:00:00',
            //   asciiValue: [],
            //   lineIndex: -1,
            //   lines: [''],
            //   formate: 'FL',
            //   isBold: false
            // } : item);
          }
        } catch (error) {
          console.error(error);
        }

        /* let idx = page.data.findIndex((i) => i.lineIndex === item.lineIndex);
         if (idx == -1) {
           this.needScroll = true;
           item.isBold = this.isBolad
           page.data.push(item)
         } else {
           let boldVal;
           try {
             boldVal = page.data[idx]["isBold"];
           } catch (error) {
   
           }
           page.data[idx] = {
             time: item.time,
             asciiValue: item.asciiValue,
             lineIndex: item.lineIndex,
             lines: item.lines,
             formate: item.formate || 'FL',
             isBold: boldVal
           };
           if (index == formattedData.length - 1) {
             page.data[idx]["isBold"] = this.isBolad;
           }
         }*/

      });

      this.needScroll = true;

      try {
        // Process all lines for the last page data
        if (storeData.length) {
          storeData.sort((a, b) => a.page - b.page);

          this.sd.lastPage = storeData.length//update the last page number to the sessions details
          this.sd.lastLineNumber = storeData[storeData.length - 1].data.length; //update the last line number of the last page to the sessions details
          // console.warn('Total LENGTH', this.sd.lastLineNumber, this.sd.lastPage)
        }
      } catch (error) {

      }

      this.feedDataSubject.next(storeData.slice());

    } catch (error) {
      console.error(error);
    }

    /*try {
      const currentArray = this.feedDataSubject.getValue();
      const flatData = currentArray.map((a) => a.data).flat();
      const blankLine = flatData.filter(a => !a.time)
      if (blankLine.length) {
        console.warn('No Line Found',this.cmdCount , blankLine.length);
      }
    } catch (error) {
    }*/

    return true;
    // this.cd.detectChanges();
  }

  checkForBlankPages(storeData, pageIndex) {
    if (storeData.includes(undefined)) {
      const blankPagesData = Array.from(Array(25), (item, index) => ({
        time: '00:00:00',
        asciiValue: [],
        lineIndex: index,
        lines: [''],
        formate: 'FL',
        isBold: false
      }));
      storeData = Array.from(storeData, (item, index) => item === undefined ? {
        page: index + 1,
        msg: "Page 1",
        annotations: [],
        hyperlinks: [],
        data: [...blankPagesData]
      } : item);
    }
  }

  pauseEvent() {
    if (this.pausedState) return;
    console.log('Paused');

    const currentArray = this.feedDataSubject.getValue();
    this.feedDataHoldSubject.next(structuredClone([...currentArray])); //this.feedDataSubject.value

    this.feedData$ = this.feedDataHoldSubject.asObservable();

    this.cm.callFunction({ event: 'RE-INIT-FEED-SUJECT', data: { currentTab: this.currentTab } })
    this.pausedState = true;
    // this.queue.pause();
  }

  resumePause() {
    if (!this.pausedState) return;

    // this.feedDataSubject.next(structuredClone(this.feedDataHoldSubject.value));

    this.feedData$ = this.feedDataSubject.asObservable();

    this.feedDataHoldSubject.next([]) // for clear is it correct ?
    this.cm.callFunction({ event: 'RE-INIT-FEED-SUJECT', data: { currentTab: this.currentTab } })
    this.pausedState = false;

    // console.log('TOTAL PENDING QUEUES', this.queue.length())

    // this.queue.resume();
    this.needScroll = true;

  }

  clearPause() {
    // this.pausedData = [];
    // this.pausedState = false;
    // this.queue.resume();

    if (!this.pausedState) return;

    // this.feedDataSubject.next(structuredClone(this.feedDataHoldSubject.value));

    this.feedData$ = this.feedDataSubject.asObservable();

    this.feedDataHoldSubject.next([]) // for clear is it correct ?
    this.cm.callFunction({ event: 'RE-INIT-FEED-SUJECT', data: { currentTab: this.currentTab } })
    this.pausedState = false;

    // console.log('TOTAL PENDING QUEUES', this.queue.length())
    this.pausedData = [];
    // this.queue.resume();
    this.needScroll = true;

  }

  updateAnnotAndHyperLinksColors(data: any) {

    try {
      const previous = data.previousColor.replace('#', '');
      const currentArray = this.feedDataSubject.getValue();

      for (let x of currentArray) {
        if (x.annotations) {
          x.annotations.filter(a => a.color == previous).map(m => m.color = data.cColor)
          x.annotations = [...x.annotations];
        }

        if (x.hyperlinks) {
          x.hyperlinks.filter(a => a.cColor == previous).map(m => m.cColor = data.cColor)
          x.hyperlinks = [...x.hyperlinks];
        }
      }

      // currentArray = [...currentArray]
      this.feedDataSubject.next(currentArray);
    } catch (error) {

    }



    try {
      const previous = data.previousColor.replace('#', '');
      this.issueDetailAnnots.filter(a => a.color == previous).map(m => m.color = data.cColor)

      // this.highlightsAnnots

    } catch (error) {

    }
    try {
      if (this.pausedState) {

        const previous = data.previousColor.replace('#', '');
        const currentArray = this.feedDataHoldSubject.getValue();

        for (let x of currentArray) {
          if (x.annotations) {
            x.annotations.filter(a => a.color == previous).map(m => m.color = data.cColor)
            x.annotations = [...x.annotations];
          }

          if (x.hyperlinks) {
            x.hyperlinks.filter(a => a.cColor == previous).map(m => m.cColor = data.cColor)
            x.hyperlinks = [...x.hyperlinks];
          }
        }

        // currentArray = [...currentArray]
        this.feedDataHoldSubject.next(currentArray);

      }
    } catch (error) {

    }

  }


  async reFetchAnnotations(cTranscript) {
    try {

      const userid = await this.secureS.getUserId();
      const mdl = {
        cTranscript: cTranscript,
        nCaseid: this.sd?.nCaseid || null,
        nSessionid: this.sd?.nSesid,
        nUserid: userid
      }

      const { ref1, ref2 } = await this.getIssueDetailAnots(this.sd?.nSesid, userid, this.sd?.nCaseid || null, cTranscript);
      this.issueDetailAnnots = ref1;
      this.highlightsAnnots = ref2;

      // this.highlightsAnnots
      // this.issueDetailAnnots


      // const res = await this.getAnnots(mdl);

      // if (res?.ref1?.length) {
      //   res?.ref1.map(a => a.cordinates = JSON.parse(a.cordinates))
      // }


      // if (res?.ref2?.length) {
      //   res?.ref2.map(a => a.cordinates = JSON.parse(a.cordinates))
      // }
      // if (res) {
      // const annots = res.ref1
      // const hyghlights = res.ref2
      try {

        const currentArray = this.feedDataSubject.getValue();



        for (let x of currentArray) {
          x.annotations = [];
          x.hyperlinks = [];


          // if (currentArray[i]["annotations"]){
          const annots = await this.getIssueDetailAnnotsPage(x.page, x["data"]);
          x.annotations = [...annots]; // [...currentArray[i]["annotations"]]
          const hyperlinks = await this.getHighlightAnnotsPage(x.page, x["data"]);
          x.hyperlinks = [...hyperlinks] //currentArray[i]["hyperlinks"];

          // if (annots) {
          // x.annotations = [...annots.filter(a => a.pageIndex == x.page)];
          // }

          // if (hyghlights) {
          // x.hyperlinks = [...hyghlights.filter(a => a.cPageno == x.page)];
          // }

        }
        this.feedDataSubject.next(currentArray);
      } catch (error) {

      }


      try {
        if (this.pausedState) {
          const currentArray = this.feedDataHoldSubject.getValue();

          for (let x of currentArray) {
            x.annotations = [];
            x.hyperlinks = [];

            // if (currentArray[i]["annotations"]){
            const annots = await this.getIssueDetailAnnotsPage(x.page, x["data"]);
            x.annotations = [...annots]; // [...currentArray[i]["annotations"]]
            const hyperlinks = await this.getHighlightAnnotsPage(x.page, x["data"]);
            x.hyperlinks = [...hyperlinks] //currentArray[i]["hyperlinks"];
            // if (annots) {
            // x.annotations = [...annots.filter(a => a.pageIndex == x.page)];
            // }
            // if (hyghlights) {
            // x.hyperlinks = [...hyghlights.filter(a => a.cPageno == x.page)];
            // }

          }
          this.feedDataHoldSubject.next(currentArray);
        }
      } catch (error) {

      }

      // }
    } catch (error) {
      console.error(error)
    }
  }




  async getAnnots(mdl) {

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/getannotationofpages`,
          mdl
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async getIssueDetailAnots(nSessionid: string, nUserid: string, nCaseid: string, cTranscript: string): Promise<any> {

    let params = new HttpParams().set('nSessionid', (nSessionid || 0));
    params = params.set('nUserid', (nUserid || 0));
    params = params.set('nCaseid', (nCaseid || 0));
    params = params.set('cTranscript', (cTranscript || 'N'));
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/issue/issuedetail/annotations`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }



  getActiveFeedData() {
    return this.pausedState ? this.feedDataHoldSubject.getValue() : this.feedDataSubject.getValue();
  }

}