import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService, PdfZoomInComponent, PdfZoomOutComponent } from 'ngx-extended-pdf-viewer';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { DocInfo, highlightModeType, highlightToolType, linkExplorer, paginationRenge, toolEvents, zoomLevels } from '../../interfaces/pdf.interface';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { MatMenu, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { PdfSharedModule } from '../../modules/shared/shared.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ToolService } from '../../service/tool.service';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { AnnotToolsComponent } from '../annot-tools/annot-tools.component';
import { MatRadioModule } from '@angular/material/radio';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PdfDataService } from '../../service/pdf-data.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'pdftool',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, PdfSharedModule, ButtonComponent, IconComponent, MatSelectModule, FormsModule, SearchComponent, MatMenuModule, MatSlideToggleModule, AnnotToolsComponent,  MatTooltipModule, MatCheckboxModule, MatSliderModule, NgSelectModule],
  providers: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0 }),
            animate('150ms cubic-bezier(0.65, 0.01, 0.69, 1)',
              style({ height: 44 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 44 }),
            animate('150ms cubic-bezier(0.65, 0.01, 0.69, 1)',
              style({ height: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ToolbarComponent implements OnInit, OnChanges {
  @ViewChildren('listItem') listItems!: QueryList<ElementRef>;

  @ViewChild('zoomIn') zoomInElement: ElementRef;
  @ViewChild('zoomOut') zoomOutElement: ElementRef;
  @ViewChild('zoomIn') zoomInComponent: PdfZoomInComponent;
  @ViewChild('zoomOut') zoomOutComponent: PdfZoomOutComponent;
  @ViewChild(PdfZoomInComponent) pdfZoomIn: ElementRef;

  @Input() onPdfEvent: Subject<any>;
  showhidetoolbar: boolean = true;

  clickFocusedItem(event: any): void {
    event.preventDefault();
    let element = event.target;
    if (element) {
      const focusedElement = element as HTMLElement;
      if (focusedElement) {
        focusedElement.click();
      }
    }
  }


  @Input() isHavehighlights: boolean = false;
  @Input() pageRotation: any;
  @Input() handTool: boolean;
  @Input() isnavigate: boolean = false;
  @Input() isProperties: boolean = false;
  @Input() isIssue: boolean = false;
  @Input() zoom: string | number;
  @Input() pdfLoaded: boolean = false;
  @Input() totalSearch: number = 0;
  @Input() pageViewMode: string;
  @Input() isConverttopagelevel: boolean = false;
  cSearch: string = '';
  matchCase: boolean = false;
  wholeWords: boolean = false;
  @Input() currentSearch: number = 0;
  @Input() isSearching: boolean = false;
  @Input() docInfo: DocInfo | null = {} as DocInfo;
  @Input() fullMode: boolean = false;
  @Input() currentPage: number = 0;
  @Input() isAnnotTool: boolean = false;
  @Input() pagesCount: number = 0;
  @Input() annotToolMode: highlightToolType;
  @Input() highlightMode: highlightModeType;
  @Input() isLink: highlightModeType;
  @Input() linkExplorerMode: linkExplorer = null;
  @Input() pagginationRenge: paginationRenge[] = [];
  rangeList: paginationRenge[] = [];
  slidervalue: any;
  zoomValue: string | number;
  pageSelected: paginationRenge | null = null;
  @Output() toolEvents = new EventEmitter<toolEvents>();
  zoomlevels: zoomLevels[] = [
    { value: '50%', key: '50%' },
    { value: '100%', key: '100%' },
    { value: '125%', key: '125%' },
    { value: '150%', key: '150%' },
    { value: '200%', key: '200%' },
    { value: '300%', key: '300%' },
    { value: '400%', key: '400%' },
    { value: 'page-width', key: 'Fit Width' },
    { value: 'page-fit', key: 'Fit Height' },
    { value: 'page-actual', key: 'Actual Size' },
  ];
  zoom_ratio: any = 0;
  dialogRef: any = 0;
  searchBox: boolean = false;
  showAll: boolean = false;
  newTab: boolean = (this.store.getStorage('newTab') && this.store.getStorage('newTab') == 'true') && true;
  showzoom: boolean = false;
  isCheckedRotation: boolean = false;
  showsearch: boolean = false;
  annoticontype: highlightToolType = 'F';

  @Input() compareMode: boolean = false;
  // tab changing
  // isNewtabLoading: boolean = false;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  searchValue: any = null;
  @Input() isDisabledNavigate: boolean = false;

  constructor(private store: SecureStorageService, private cdr: ChangeDetectorRef, private pdfDataService: PdfDataService, private dialog: MatDialog) {
  }


  checkForMax(e) {
    if (e.target.value > this.pagesCount) {
      this.currentPage = this.pagesCount;
    } else if (e < 1) {
      this.currentPage = 1;
    }
    this.cdr.detectChanges();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage']) {
      this.updateSelectPage(changes['currentPage'].currentValue);
    } else if (changes['pagginationRenge']) {
      this.rangeList = [...this.pagginationRenge]
      this.updateSelectPage(this.currentPage);
    }
  }

  updateSelectPage(val) {
    const ind = this.rangeList.findIndex(a => a.page == val);
    if (ind > -1) {
      this.pageSelected = this.rangeList[ind];
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {

    this.zoomValue = this.zoom;
    this.showAll = this.pageViewMode == 'multiple';
    this.isCheckedRotation = (this.pageRotation == this.docInfo.nRotate);
    this.rangeList = [...this.pagginationRenge]

    try {

      if (this.onPdfEvent) {
        this.onPdfEvent.subscribe((e: toolEvents) => {

          this.pdfZoomIn;
          this.zoomInElement; //.nativeElement.children[0].click()
          this.zoomInComponent;
          this.zoomOutComponent;
        })
      }
    } catch (error) {

    }

    this.cdr.detectChanges();
  }

  rotate(val) {
    if (val) {
      this.pageRotation = (this.pageRotation + 90) % 360;
    } else {
      this.pageRotation = (this.pageRotation - 90 + 360) % 360;
    }
    this.isCheckedRotation = (this.pageRotation == this.docInfo.nRotate);
    this.cdr.detectChanges();
    this.toolEvents.emit({ event: 'ROTATION', data: this.pageRotation });
  }

  OnPage() {
    this.toolEvents.emit({ event: 'PAGE', data: this.currentPage });
  }

  hand() {
    this.handTool = !this.handTool;
    this.toolEvents.emit({ event: 'HAND', data: this.handTool });
  }

  zoomChange(e: any) {
    this.zoom = e.value;
    this.toolEvents.emit({ event: 'ZOOM', data: this.zoom });
  }


  sliderzoom(ev) {

    this.toolEvents.emit({ event: 'ZOOM', data: ev });
  }
  resetzoom() {
    this.toolEvents.emit({ event: 'ZOOM', data: 'page-width' });
  }

  getZoomValue() {
    const zoom: any = this.zoom
    try {
      return typeof zoom == 'string' ? ((zoom).includes('page') ? (this.zoomlevels.find(a => a.value == zoom)?.key) : zoom) : parseInt(zoom) + '%';
    } catch (error) {
      return zoom;
    }
  }

  onSeach(e: toolEvents) {
    if (e.event == 'close') {
      this.menuTrigger.closeMenu();
    }
    this.toolEvents.emit(e);
  }

  OnShowAllChange() {

    this.showAll = !this.showAll
    this.toolEvents.emit({ event: 'SHOWALL', data: (this.showAll ? 'multiple' : 'single') });
  }

  async changeDoc(flag: string) {
    this.toolEvents.emit({ event: 'CHANGE_DOC', data: { newTab: this.newTab, cFlag: flag } });
    // if (this.isNewtabLoading) return;
    // this.isNewtabLoading = true;
    // this.cdr.detectChanges();
    // let data = await this.toolService.fetchPreNextDocs(this.docInfo.nBundledetailid, flag);
    // if (data) {
    //   this.isNewtabLoading = false;
    //   data.newTab = this.newTab;
    //   this.cdr.detectChanges();
    //   this.toolEvents.emit({ event: 'CHANGE_DOC', data: data });
    // } else {
    //   this.tostService.openSnackBar('No more documents found', 'E');
    // }
  }


  onNewTabChange() {
    this.newTab = !this.newTab;

    this.store.setStorage('newTab', this.newTab);
  }



  OnAnnotToolClose(e: any) {
    this.isAnnotTool = false;
    this.cdr.detectChanges();
  }

  modeChange(e: highlightToolType) {
    this.toolEvents.emit({ event: 'H-MODE', data: e });
    this.annoticontype = e;
  }


  OnLinkEvents(e: toolEvents) {
    if (e.event == 'LINK-EVENT') {
      this.toolEvents.emit(e);
    }
    if (e.event == 'LINK-EVENT-SCROLL') {
      this.currentPage = e.data.start ? e.data.start : 1;
      this.OnPage();
    }
  }

  onRotationUpdate(e: any) {
    this.docInfo.nRotate = this.pageRotation;
    this.pdfDataService.updateRotation({ nBundledetailid: this.docInfo.nBundledetailid, nRotate: this.pageRotation });

  }



  closeRealtimePdf() {

    this.toolEvents.emit({ event: 'CLOSE_REALTIME', data: null });
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }


  async locationshare() {
    this.toolEvents.emit({ event: 'LOCATION_SHARE', data: '' });
  }

  async export() {
    this.toolEvents.emit({ event: 'EXPORT', data: '' });
  }
  async navigate() {

    if (this.dialogRef) {
      return;
    }

    this.toolEvents.emit({ event: 'OPEN_NAVIGATE', data: '' });
    // this.dialogRef = this.dialog.open(NavigateComponent, {
    //   width: '470px',
    //   height: 'calc(100vh - 56px)',
    //   position: { right: '0vh', top: '56px' },
    //   hasBackdrop: false,
    //   panelClass: ['noshadow', 'norounded']
    // });
    // this.dialogRef.afterClosed().subscribe(result => {

    // });
  }


  changeCompareMode() {
    this.compareMode = !this.compareMode;
    this.toolEvents.emit({ event: 'COMPARE_MODE', data: this.compareMode });
    this.cdr.detectChanges();
  }


  linkExplorer() {
    this.toolEvents.emit({ event: 'LINK_EXPLORER', data: '' });
  }


  OnPageSelected() {
    this.toolEvents.emit({ event: 'PDF_PAGE_CHANGE', data: { page: this.currentPage } });
  }

  onPageChange() {
    this.toolEvents.emit({ event: 'PDF_PAGE_CHANGE', data: this.pageSelected });
  }

  issuelist() {
    this.toolEvents.emit({ event: 'OPEN_ISSUEMODEL', data: {} });
  }
  properties(flag) {
    if (flag == 'V') {
      this.toolEvents.emit({ event: 'VIEW_PROPERTIES', data: {} });
    }
    else {
      this.toolEvents.emit({ event: 'ASSIGN_PROPERTIES', data: {} });
    }
  }
  OnRangeSelect(x) {
    this.pageSelected = x;
    this.onPageChange()
    this.clearSearchInPagination()
    this.cdr.detectChanges();
  }

  seachPages(e: any) {

    const value = e.target.value;
    this.rangeList = [...this.pagginationRenge.filter(a => (a.output.toUpperCase()).includes(value.toUpperCase())).sort()]

    this.cdr.detectChanges();
  }

  OnPageEnter(e: any) {

    const value = e.target.value;
    const ind: any = this.pagginationRenge.findIndex(a => (a.output).toUpperCase() == value.toUpperCase())
    if (ind > -1) {
      this.clearSearchInPagination()
      this.OnRangeSelect(this.pagginationRenge[ind]);
    }
  }
  clearSearchInPagination() {
    this.searchValue = null;
    this.rangeList = [...this.pagginationRenge]
  }

  openment(pginput) {
    setTimeout(() => {
      pginput.focus()
    }, 100);
  }



  onKeyDown(event: KeyboardEvent): void {

    if (event.key === 'ArrowDown') {
      console.log('Down arrow key pressed');
      setTimeout(() => {
        if (this.listItems && this.listItems.first) {
          const firstElement = this.listItems.first['_elementRef'].nativeElement;
          if (firstElement) {
            firstElement.focus();
          } else {
            console.log('Native element not found');
          }
        } else {
          console.log('No list items found');
        }
      });

    }
  }
  OnValueUpdate(e) {
    if (e.data) {
      this.cSearch = e.data.cSearch;
      this.matchCase = e.data.options.matchCase;
      this.wholeWords = e.data.options.wholeWords;
      this.cdr.detectChanges();
    }
  }

  changeSearchBox() {

    this.searchBox = !this.searchBox
    if (!this.searchBox) {
      this.toolEvents.next({ event: 'SEARCH', data: { cSearch: this.searchBox ? this.cSearch : '', options: { matchCase: this.matchCase, wholeWords: this.wholeWords, highlightAll: true } } });
    }
  }


  OnPdfNavEvent(val: string) {

    this.toolEvents.emit({ event: 'TOOLBAR-PDF-NAV-EVENTS', data: val });
  }

  openInIndividual() {
    this.toolEvents.emit({ event: 'OPEN-INDIVIDUAL', data: null });

  }
}