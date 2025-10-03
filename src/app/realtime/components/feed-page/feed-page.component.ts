import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, ElementRef, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { AnnotationService } from '../../services/annotation/annotation.service';
import { Annotation, tabmodel } from '../../models/annotation.interface';
import { TextLayerComponent } from '../layers/text-layer/text-layer.component';
import { AnnotationLayerComponent } from '../layers/annotation-layer/annotation-layer.component';
import { FeedDisplayService } from '../../services/feed-display.service';
import { hylightMD, hyperLinksMDL } from '../../models/issue.interface';
import { RealtimeService } from '../../services/realtime/realtime.service';
import { identity, Subject } from 'rxjs';
import { IssueService } from '../../services/issue/issue.service';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
// import { AnnotationDialogService } from '../../services/annotation-dialog.service';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TextLayerComponent, AnnotationLayerComponent],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.scss'
})
export class FeedPageComponent {
  highlightedLines: { index: number, element: HTMLElement }[] = [];
  @Input() page: any;
  @Input() selectedFont: any;
  @Input() itemSize: number = 0;
  @Input() maxWidth: number = 0;
  @Input() currentIsseuDetailId: string;
  @Input() currentPage: number;
  @Input() pageIndex: number;
  @Input() zoomLevel: number = 1;
  @Input() showTimestamp: boolean = false;
  @Input() current_session: any = {};
  @Input() highlightmode: hylightMD = false;
  @Input() isSetupscreen: boolean = false;
  @Input() annotationdata: Annotation[] = [];
  @Input() nEditid: string;
  annotations: Annotation[] = [];
  @Output() itemRendered = new EventEmitter<ElementRef>();
  @Output() OnEvent = new EventEmitter<any>();
  isChecked: boolean = false;
  lastPageInd: number = 0;
  hyperlinks: hyperLinksMDL[] = [];
  @Output() onTabEvent = new EventEmitter<tabmodel>();
  @Input() mode: string = 'L';
  @Input() onReceiveEvent: Subject<any>;
  sendEvents: Subject<any> = new Subject();



  @Input() spaceBarOptions: any = {};
  @Input() nUserid: string;
  constructor(private realtimeService: RealtimeService, private issueService: IssueService,
    private annotationService: AnnotationService,
    // private annotationDialogService: AnnotationDialogService,
    private cdr: ChangeDetectorRef, private fds: FeedDisplayService,
    private tost: TostbarService
  ) { }




  ngOnInit(): void {

    try {
      if (this.onReceiveEvent) {
        this.onReceiveEvent.subscribe((e) => {

        });
      }
    } catch (error) {

    }

    if (!this.page?.annotations) {
      // this.page.annotations = [];
    }


    // console.warn('CALLING ANNOTATION PAGE',this.page.page,'DATA',this.annotationdata.length)
    // this.annotationService.getAnnotations(this.page.page).subscribe(annotations => {
    //   this.annotations = annotations;
    //   this.page.annotations = annotations;
    //   this.cdr.detectChanges(); // Trigger change detection
    // });
  }

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }

  ngAfterViewInit() {
  }

  onMouseUp() {
    if (this.highlightmode == 'I') { // || !this.highlightmode
      this.performAnnotation();
    }
  }

  /*performAnnotation() {
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const rects: any = range.getClientRects();
      if (!rects.length || selectedText === '') {
        selection.removeAllRanges();
        return;
      }
  
      let annotationList = [];
  
      for (let rect of rects) {
        const container:any = document.elementFromPoint(rect.left, rect.top)?.closest('.line-text');
        if (container) {
          const lineElement: any = container.closest('.line');
          const lineRect = lineElement.getBoundingClientRect();
          const pageElement = container.closest('.page');
          const timeElement = lineElement.querySelector('.timestamp');
          let timewidth = 0;
          if (pageElement) {
            if (timeElement) {
              timewidth = (timeElement.getBoundingClientRect().width);
            }
  
            // Extract the line number attribute value
            const linetimestamp = lineElement.getAttribute('timestamp');
            const lno = lineElement.getAttribute('lno');
  
            // Calculate the start index and length of the selected text in the current line
            const lineText = container.innerText || '';
            const selectedRangeText = range.toString();
            const startContainerText = range.startContainer.textContent || '';
            const endContainerText = range.endContainer.textContent || '';
  
            // Calculate the start index
            let startIndex = lineText.indexOf(selectedRangeText);
            if (startIndex === -1) {
              startIndex = 0;
            }
  
            const length = selectedText.length;
  
            const adjustedY = rect.top - lineRect.top + lineElement.offsetTop - (this.zoomLevel === 1 ? 0 : this.zoomLevel);
            let coordinates = {
              x: (rect.left - timewidth) / this.zoomLevel,
              y: adjustedY,
              width: rect.width / this.zoomLevel,
              height: rect.height / this.zoomLevel,
              t: linetimestamp,
              l: lno ? parseInt(lno) : null,
              s: startIndex,
              ln: length
            };
            annotationList.push(coordinates);
          }
        }
      }
  
      selection.removeAllRanges();
      if (annotationList.length > 0) {
        const annotation: Annotation = {
          temp: true,
          nIDid: null,
          id: this.generateUniqueId(),
          pageIndex: this.page.page,
          text: selectedText,
          color: 'FFFF00', // Set your desired color here
          cordinates: annotationList
        };
        this.OnEvent.emit({ event: 'ANNOTATED', annotation: annotation });
      }
    }
  }*/


  /* performAnnotation() {
     
     const selection = window.getSelection();
     if (selection && selection.rangeCount > 0) {
       const selectedText = selection.toString();
       const range = selection.getRangeAt(0);
       const rects: any = range.getClientRects();
       if (!rects.length || selectedText == '') {
         selection.removeAllRanges();
         return;
       }
   
       let annotationList = [];
       let alltimestamps = new Set<number>(); // Use a set to avoid duplicate line numbers
   
       for (let rect of rects) {
         const container = document.elementFromPoint(rect.left, rect.top)?.closest('.line-text');
         if (container) {
           const containerRect = container.getBoundingClientRect();
           const lineElement: any = container.closest('.line');
           const lineRect = lineElement.getBoundingClientRect();
           const pageElement = container.closest('.page');
           const lineNumberElement = lineElement.querySelector('.line-number');
           const timeElement = lineElement.querySelector('.timestamp');
           let timewidth = 0;
           if (pageElement) {
             if (timeElement) {
               timewidth = (timeElement.getBoundingClientRect().width);
             }
   
             // Extract the line number attribute value
             const linetimestamp = lineElement.getAttribute('timestamp');
             if (linetimestamp !== null) {
               // alltimestamps.add(linetimestamp);
             }
             const lno = lineElement.getAttribute('lno');
   
             // Calculate the start index and length of the selected text in the current line
             const lineText = container.textContent || '';
             const rangeStart = range.startOffset;
             const rangeEnd = range.endOffset;
             let startIndex = 0;
             let length = 0;
   
             if (range.startContainer === range.endContainer) {
               // If the selection is within the same container
               startIndex = rangeStart;
               length = rangeEnd - rangeStart;
             } else {
               // If the selection spans multiple containers, calculate accordingly
               const startContainerText = range.startContainer.textContent || '';
               const endContainerText = range.endContainer.textContent || '';
   
               startIndex = startContainerText.length - (lineText.length - startContainerText.length);
               length = selectedText.length;
             }
   
             const adjustedY = rect.top - lineRect.top + lineElement.offsetTop - (this.zoomLevel == 1 ? 0 : this.zoomLevel);
             let coordinates = {
               x: (rect.left - timewidth) / this.zoomLevel,
               y: adjustedY,
               width: rect.width / this.zoomLevel,
               height: rect.height / this.zoomLevel,
               t: linetimestamp,
               l: lno ? parseInt(lno) : null,
               s: startIndex,
               ln: length
             };
             annotationList.push(coordinates);
           }
         }
       }
   
       selection.removeAllRanges();
       if (annotationList.length > 0) {
         // const annotation: Annotation = {
         //   temp: true,
         //   nIDid: null,
         //   id: this.generateUniqueId(),
         //   pageIndex: this.page.page,
         //   text: selectedText,
         //   color: 'FFFF00', // Set your desired color here
         //   coordinates: annotationList
         // };
 
         const annotation: Annotation = {
           temp: true,
           nIDid: null,
           id: this.generateUniqueId(),
           pageIndex: this.page.page,
           text: selectedText,
           color: 'FFFF00', // Set your desired color here
           cordinates: annotationList
 
         };
         this.OnEvent.emit({ event: 'ANNOTATED', annotation: annotation });
       }
     }
   }*/

  performAnnotation() {
    
    return;
    debugger;
    this.highlightmode;
    this.page;
    if (this.realtimeService.compareMode) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString()
        .split('\n')
        .filter(line => line.trim() !== '') // Remove blank lines
        .join('\n'); // Join remaining lines with preserved breaks
      const range = selection.getRangeAt(0);
      const rects: any = range.getClientRects();
      if (!rects.length || selectedText == '') {
        selection.removeAllRanges();
        return;
      }

      let annotationList = [];
      let alltimestamps = new Set<number>(); // Use a set to avoid duplicate line numbers
      let inds = -1;
      for (let [index, xs] of Array.from(rects).entries()) {
        let rect: any = xs;
        const container = document.elementFromPoint(rect.left, rect.top)?.closest('.line-text');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const lineElement: any = container.closest('.line');
          const lineRect = lineElement.getBoundingClientRect();
          const pageElement = container.closest('.page');
          const lineNumberElement = lineElement.querySelector('.line-number');
          const timeElement = lineElement.querySelector('.timestamp');
          let timewidth = 0;
          if (pageElement) {
            if (timeElement) {
              // timewidth = (timeElement.getBoundingClientRect().width);
              timewidth = 108
            }
            // alert(timewidth)
            const pageNo = Number(pageElement.getAttribute('pg')) || this.page.page;
            // Extract the line number attribute value
            const linetimestamp = lineElement.getAttribute('timestamp');
            if (linetimestamp !== null) {
              // alltimestamps.add(linetimestamp);
            }
            const lno = lineElement.getAttribute('lno');

            const oPage = lineElement.getAttribute('oPage') || "0";
            const oLine = lineElement.getAttribute('oLine') || "0";
            const identity = lineElement.getAttribute('identity') || "0";
            inds++
            const adjustedY = rect.top - lineRect.top + lineElement.offsetTop - (this.zoomLevel == 1 ? 0 : this.zoomLevel);

            console.log('ADJUSTED Y', adjustedY, 'RECT TOP', rect.top, 'LINE RECT TOP', lineRect.top, 'LINE OFFSET TOP', lineElement.offsetTop, 'ZOOM LEVEL', this.zoomLevel);




            let cordinates: any = {
              x: (rect.left - timewidth) / this.zoomLevel,
              y: adjustedY + (this.fds.sd.cProtocol == 'C' ? 60 : 0),
              width: rect.width / this.zoomLevel,
              height: rect.height / this.zoomLevel,
              t: linetimestamp,
              l: lno ? parseInt(lno) : null,
              p: pageNo,//this.page.page,
              text: this.getTextByIndex(selectedText, inds),
              oP: oPage ? parseInt(oPage) : 0,
              oL: oLine ? parseInt(oLine) : 0,
              identity: identity
            };



            try {
              if (!annotationList?.length && lno > 1) {
                const previousLine = lineElement.closest(`[pg="${pageNo}"]`)?.querySelector(`[lno="${lno - 1}"]`);
                if (previousLine) {
                  const timestamp = previousLine.getAttribute('timestamp');
                  if (this.fds.convertToFrameWithoutFram(linetimestamp) == this.fds.convertToFrameWithoutFram(timestamp)) {
                    cordinates.preIdentity = previousLine.getAttribute('identity');
                  }


                }
              }
            } catch (error) {
            }


            annotationList.push(cordinates);
          }
        }
      }



      try {

        if (annotationList?.length) {
          const lastAnnot = annotationList[annotationList.length - 1];
          const nextLine = document.querySelector(`[pg="${lastAnnot.p}"]`).querySelector(`[lno="${lastAnnot.l + 1}"]`);
          if (nextLine) {
            const timestamp = nextLine.getAttribute('timestamp');
            if (this.fds.convertToFrameWithoutFram(lastAnnot.t) == this.fds.convertToFrameWithoutFram(timestamp)) {
              lastAnnot.nxtIdentity = nextLine.getAttribute('identity');
            }
          }
        }

      } catch (error) {

      }

      selection.removeAllRanges();
      if (annotationList.length > 0) {
        debugger;


        const annotation: Annotation = {
          temp: true,
          nIDid: null,
          id: this.generateUniqueId(),
          pageIndex: this.page.page,
          text: selectedText,
          color: '5c9dff', // Set your desired color here
          cordinates: annotationList
        };

        this.openAnnotationDialog(annotation);
      }
    }
  }

  openAnnotationDialog(annotation: Annotation) {

    // this.annotationDialogService.openDialog(annotation);
    const lastIsid = this.annotationService.getAnnotLastIssue();
    if (!lastIsid?.nIid) {
      this.OnEvent.emit({ event: 'ANNOTATED', annotation: annotation, });
    } else {
      this.saveAnnotations(annotation);
    }
  }

  async saveAnnotations(annotation: Annotation) {

    const selectedIssues = this.annotationService.getAnnotsIssueIds();
    const lastIsid = this.annotationService.getAnnotLastIssue();

    const mdl: any = {
      cNote: '',
      cONote: annotation.text || '',
      cIidStr: selectedIssues,
      nSessionid: this.current_session.nSesid,
      nCaseid: this.current_session.nCaseid,
      nLID: lastIsid?.nIid,//this.selectedIssues[this.selectedIssues.length - 1]["nIid"] || 0,
      cPageno: annotation?.pageIndex?.toString() || '1',
      jCordinates: annotation.cordinates || [],
      nUserid: this.nUserid,
      cTranscript: this.mode == 'T' ? 'Y' : 'N'
    }

    const res = await this.issueService.insertIssueDetail(mdl);
    if (res.length) {
      const newAnnotation: Annotation = {
        nIDid: res[0]["nIDid"],
        color: res[0]["cColor"],
        pageIndex: annotation.pageIndex,
        text: annotation.text,
        cordinates: annotation.cordinates,
        nICount: selectedIssues.length
      };

      // this.dialogEvent.emit({ event: 'ADD-ANNOTATION', data: { pageIndex: Number(this.annotations.pageIndex), newAnnotation: newAnnotation } });

      this.fds.addAnnotationToQueue(Number(annotation.pageIndex), newAnnotation);
      this.fds.checkTempAnnotatation(null);
      // this.dialogEvent.emit({ event: 'CHECK-TEMP-ANNOT', data: {} });
      this.annotationService.clearTempAnnotation();
    } else {
      this.tost.openSnackBar('Error in Inserting Issue', 'E');
    }


  }

  getTextByIndex(selecteText, index) {
    try {
      selecteText = selecteText || '';
      return selecteText.split('\n')[index]
    } catch (error) {
      return '';
    }
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  OnIconClick(e, type) {
    this.OnEvent.emit({ event: 'ICON-CLICK-' + type, annotation: e });
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // if (changes['currentPage']) {
    // console.warn('CAHNGE', this.page.page, 'DATA', this.annotationdata.length, ' PAGE', this.currentPage, changes)
    // if (this.page.page == changes['currentPage'].currentValue) {
    //   if(this.page.page==18){

    //   }
    // if(this.lastPageInd!=changes['currentPage'].currentValue){
    //   this.lastPageInd = changes['currentPage'].currentValue;
    // console.warn('CALLING ANNOTATION PAGE', this.page.page, 'DATA', this.annotationdata.length, ' PAGE', this.currentPage, changes)
    // this.page.annotations = this.fds.fetchAnnotation(this.page.page);

    //   this.hyperlinks = this.fds.fetchHyperlinks(this.page.page);

    //   this.cdr.detectChanges();
    // }
    // }

    if (changes['hyperlinks']) {
      this.cdr.detectChanges();
    }

    if (changes['hyperlinksicons']) {
      this.cdr.detectChanges();
    }

    if (changes['annotations']) {
      this.cdr.detectChanges();
    }
    if (changes['page']) {
      // this.page.hyperlinks = [];
      // console.log('PAGE CHANGE',this.page.page)
      this.cdr.detectChanges();
    }
    if (changes['itemSize']) {
      // this.page.hyperlinks = [];

      this.cdr.detectChanges();
    }
  }



  ngOnDestroy(): void {
    // console.error('PAGE DESTROYED', this.page.page)

  }

  /*private showTemporaryAnnotation(annotation: Annotation) {
    
    if (!this.page.annotations) {
      this.page.annotations = [];
    }

    // let ind = this.page.annotations.findIndex(a => a.temp)
    // if (ind > -1) {
    //   this.page.annotations.splice(ind, 1)
    // }
    this.page.annotations = [...this.page.annotations, ...[annotation]]; // Show only the current temporary annotation
    this.annotationService.setTempAnnotation(annotation, this.pageIndex);
    this.cdr.detectChanges(); // Trigger change detection
  }*/

  OnTabEvent(e) {
    this.onTabEvent.next(e);
  }


}
