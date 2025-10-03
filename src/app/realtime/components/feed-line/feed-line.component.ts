import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, Renderer2, SimpleChange, ViewChild, ViewEncapsulation } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IssueService } from '../../services/issue/issue.service';
import { FeedDisplayService } from '../../services/feed-display.service';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { SearchService } from '../../services/search.service';
import { BoldFormattingDirective } from '../../directives/bold-formatting.directive';
import { Annotation, annotIndex, tabmodel } from '../../models/annotation.interface';
import { AnnotationService } from '../../services/annotation/annotation.service';
import { HighlightPipe } from '../../pip/search.pip';
import { RealtimeService } from '../../services/realtime/realtime.service';
import { hylightMD } from '../../models/issue.interface';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { timestampPipe } from '../../pip/timestamp.pip';

@Component({
  selector: 'app-feed-line',
  standalone: true,
  imports: [CommonModule, IconComponent, HighlightPipe, BoldFormattingDirective,timestampPipe],
  templateUrl: './feed-line.component.html',
  styleUrls: ['./feed-line.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedLineComponent {
  @Input() line: any;
  @Input() lineIndex: number = 0;
  @Input() pageno: any;
  @Input() nEditid: any;
  nUserid: any;
  @Input() highlightmode: hylightMD = false;
  @Input() showTimestamp: boolean = false;
  @Input() annots: annotIndex[] = [];
  @Output() lineSelect = new EventEmitter<{ index: number, element: HTMLElement, color: string, nHid: number, type: string, hyperLinkData: any[] }>();
  @Output() onTabEvent = new EventEmitter<tabmodel>();
  @ViewChild('lineText', { static: true }) lineText!: ElementRef;
  @ViewChild('linediv', { static: true }) linediv: ElementRef;

  @Input() mode: string = 'L';


  @Input() spaceBarOptions: any = {};


  constructor(
    private store: SecureStorageService,
    private issueService: IssueService,
    private fds: FeedDisplayService,
    private cdr: ChangeDetectorRef,
    public searchService: SearchService,
    private annotationService: AnnotationService,
    private renderer: Renderer2,
    private realtimeService: RealtimeService,
    private tost: TostbarService
  ) { }

  async ngOnInit() {
    this.nUserid = await this.store.getUserId();
  }
  ngAfterViewInit(): void {


  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    if (changes['line']) {
      this.cdr.detectChanges();
    }

    if (changes['annots']) {
      this.cdr.detectChanges();
    }


    if (changes['spaceBarOptions'] && !changes['spaceBarOptions'].firstChange) {
      this.onSpaceBarEvent();
    }

  }

  async hilightLine(div) {
    debugger;
    if (this.highlightmode != 'H') {
      return;
    }

    this.line.isHilighted = !this.line.isHilighted;

    this.cdr.detectChanges();
    this.line.cColor = this.annotationService.getLastIssue().cColor;

    if (this.line.isHilighted) {
      const divElement = div;
      const reacts = divElement.getBoundingClientRect();
      let hIDs: any = this.annotationService.getHighLightIssueIds() || [];
      let nLID: any = this.annotationService.getLastIssue()?.nIid || null;
      let mdl: any = {
        nCaseid: this.fds.sd.nCaseid,
        nSessionid: this.fds.demoStream ? 1 : this.fds.sd.nSesid,
        nUserid: this.nUserid,
        cIidStr: hIDs,
        cNote: this.line.lines[0],
        nLID: nLID,
        jCordinates: [{ x: reacts["x"], y: reacts["y"], width: reacts["width"], height: reacts["height"] }],
        cPageno: this.pageno.toString(),
        cLineno: (this.lineIndex).toString(),
        cTime: this.line.time,
        cTranscript: this.mode == 'T' ? 'Y' : 'N',
        oP: this.line.oPage || 0,
        oL: this.line.oLine || 0,
        identity: String(this.line.unicid || ''),
      };
      let res = await this.issueService.insertHyperlink(mdl);
      if (res.length) {
        if (res[0]["msg"] == -1) {
          this.tost.error(res[0]["value"] || res[0]["message"])
          return
        }
        this.line.nHid = res[0].nHid;


        if (!this.line.cColor) {
          this.line.cColor = res[0].color;
          // this.line.cColor = this.annotationService.getLastIssue().cColor;
        }
        try {
          if (res[0].isIssueNotFound) {
            if (res[0].saveIds) {
              this.annotationService.setHighLightIssueIds(res[0].saveIds);
              this.annotationService.setLastIssue({ nIid: res[0].nLID, cColor: res[0].color });
            }
          }
        } catch (error) {

        }
        const issueids = res[0]["pageData"].find(a => a.nHid == res[0].nHid)?.issueids || '';

        this.fds.addHyperlinkToQueue(this.pageno, {
          nHid: res[0].nHid,
          cPageno: this.pageno.toString(),
          cLineno: this.lineIndex.toString(),
          cColor: this.line.cColor,
          cTime: this.line.time,
          issueids,
          // issueids: ([...new Set(issueids.split(',').map(Number))]).toString(),
          oL: this.line.oLine || 0,
          identity: String(this.line.unicid || '')
        }, (res[0]["pageData"] ? res[0]["pageData"] : []));


        // this.lineSelect.emit({ index: this.lineIndex, element: this.linediv.nativeElement, color: this.line.cColor, nHid: res[0].nHid, type: 'A', hyperLinkData: (res[0]["pageData"] ? res[0]["pageData"] : []) });
        this.cdr.detectChanges();
      }
    } else {
      if (!this.line.nHid) return;
      let res = await this.issueService.deleteHyperlink(this.line.nHid, (this.mode == 'T' ? 'Y' : 'N'));
      if (res.length) {
        // this.lineSelect.emit({ index: this.lineIndex, element: this.linediv.nativeElement, color: this.line.cColor, nHid: this.line.nHid, type: 'R', hyperLinkData: (res[0]["pageData"] ? res[0]["pageData"] : []) });
        this.fds.removeHyperlinkToQueue(this.pageno, this.line.nHid, (res[0]["pageData"] ? res[0]["pageData"] : []));
        this.cdr.detectChanges();
      }
    }
  }

  async deletehilight() {
    let res = await this.issueService.deleteHyperlink(this.line.nHid, (this.mode == 'T' ? 'Y' : 'N'));
    if (res.length) {
      this.fds.removeHyperlink(this.pageno, this.line.nHid, (res[0]["pageData"] ? res[0]["pageData"] : []));
      this.line.isHilighted = false;
      this.line.showdelete = false;
      this.cdr.detectChanges();
    }
  }

  deletePopup() {
    this.line.showdelete = true;
  }

  updateHighlights() {
    const searchTerm = this.searchService.searchTerm;
    if (!searchTerm) {
      this.lineText.nativeElement.innerHTML = this.line.lines.join(' ');
      return;
    }
    const matches = this.searchService.matches$.value.filter(
      (match) => match.page === this.pageno - 1 && match.line === this.lineIndex - 1
    );

    let text = this.line.lines.join(' ');
    let offset = 0;

    matches.forEach((match, index) => {
      const start = match.position + offset;
      const end = start + searchTerm.length;
      const beforeMatch = text.substring(0, start);
      const matchText = text.substring(start, end);
      const afterMatch = text.substring(end);
      const currentClass = match === this.searchService.getCurrentMatch() ? 'current' : '';
      text = `${beforeMatch}<span class="highlight ${currentClass}">${matchText}</span>${afterMatch}`;
      offset += `<span class="highlight ${currentClass}">`.length + '</span>'.length;
    });

    this.lineText.nativeElement.innerHTML = text;
  }

  clickOnTabs(e: any) {
    try {
      if (this.realtimeService.compareMode) return;
      if (e.target.classList.contains('clickable-word')) {
        const value = e.target.innerText.replace(/[{}]/g, '');
        const tab = value.split('-')[0];
        let page = 1;
        if (value.includes("-")) {
          page = parseInt(value.split('-')[1]);
        }
        this.onTabEvent.next({ cTab: tab, nPageno: page })
      }
    } catch (error) {
      console.error(error);
    }

  }


  onSpaceBarEvent() {

    if (this.spaceBarOptions && this.spaceBarOptions && this.spaceBarOptions?.line == this.lineIndex && this.spaceBarOptions?.page == this.pageno) {
      console.warn('Line Highlights', this.pageno, this.lineIndex);
      this.hilightLine(this.linediv.nativeElement);

    }

  }

}
