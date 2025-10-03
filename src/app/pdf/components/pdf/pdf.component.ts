import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, SimpleChange, ViewChild } from '@angular/core';
import { HighlightEditorAnnotation, IPDFViewerApplication, NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { PdfService } from '../../service/pdf.service';
import { DocInfo, ModelType, PDFAnnotation, PDFPageViewport, globAnnot, globalAnnots, highlightModeType, highlightToolType, hyperlinkOption, iconsGroup, itemPosition, linkExplorer, linkExplorerType, myTeamUsers, paginationRenge, pdfToolOptions, slabModeType, temporaryAnnots, toolEvents } from '../../interfaces/pdf.interface';
import { environment } from '../../../../environments/environment';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { PdfSharedModule } from '../../modules/shared/shared.module';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PdfDataService } from '../../service/pdf-data.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { DialogueComponent } from '../../../shared/components/dialogue/dialogue.component';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { linkType } from '../../../shared/interfaces/common.interface';
import { CommonService } from '../../../shared/services/common/common.service';
import { UrlService } from '../../../services/url.service';

// pdfDefaultOptions.workerSrc = '/assets/pdf.worker.min.js';

@Component({
  selector: 'pdf',
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdfSharedModule, ToolbarComponent, IconComponent, SkeletonComponent, CommonModule,
    ButtonComponent, MatCheckboxModule, MatTooltipModule
  ],
  providers: [],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.scss'
})
export class PdfComponent implements OnInit {
  @ViewChild(NgxExtendedPdfViewerComponent) pdfViewer!: NgxExtendedPdfViewerComponent;
  // @ViewChild('pdfViewer', { static: false }) pdfViewer: NgxExtendedPdfViewerComponent;
  // @ViewChild('pdfViewer') pdfViewer!: NgxExtendedPdfViewerComponent;
  // @ViewChild('pdfViewer')
  // pdfViewer!: NgxExtendedPdfViewerComponent;
  // PDFViewerApplication.pdfViewer.scroll
  // Number(getComputedStyle(this.pdfViewerElementRef.nativeElement.querySelector('.page')).getPropertyValue('--scale-factor'))
  @ViewChild('pdfViewer', { static: true })
  pdfViewerComponent!: NgxExtendedPdfViewerComponent;

  @ViewChild('pdfViewer', { read: ElementRef })
  pdfViewerElementRef!: ElementRef<HTMLDivElement>;

  @Input() fullMode: boolean = false;
  @Input() nCaseid: string;
  @Input() path: string | null = null;
  @Input() docInfo: DocInfo | null = null;
  @Input() isLink: highlightModeType;
  @Input() onViewerEvent: Subject<any>;
  @Input() compareMode: boolean = false;
  @Input() textLayer: boolean | undefined = false;
  @Input() compareIndex: number = 0;
  @Output() onEvent = new EventEmitter<any>();

  rendom: string = '?V=' + (Math.floor(1000 + Math.random() * 9999))
  annotToolMode: highlightToolType = 'F';
  highlightMode: highlightModeType = 'F';

  filepath: string = this.urlService.pdfLoadUrl; // environment.documentStorage; // `${environment.cloudUrl}${environment.pdfloadpath}`;
  pdfSrc: string;
  // demoPdfSrc: string = 'http://localhost/doc/case22/big_1gb.pdf';
  // demoPdfSrc: string = 'https://etabella.legal/docs/doc/case297/file_1089891459817.PDF';

  // 200mb
  // demoPdfSrc: string = 'https://etabella.legal/docs/doc/case297/file_821832819730.PDF';
  // demoPdfSrc: string = 'http://localhost/doc/case22/demo.pdf';
  // demoPdfSrc: string = 'http://localhost/doc/case22/big_1gb.pdf';

  // demoPdfSrc: string = 'http://localhost/doc/case22/test4.pdf';

  // demoPdfSrc = {
  //   url: 'https://etabella.legal/docs/doc/case297/file_821832819730.PDF',
  //   range: true
  // };

  // demoPdfSrc: string = 'http://etabella.legal/pdffile/'; https://etabella.sgp1.cdn.digitaloceanspaces.com/case139/dc_01714564036291.pdf
  demoPdfSrc: string = 'https://etabella.sgp1.cdn.digitaloceanspaces.com/doc/case1101/dc_158865675.PDF';// 'https://etabella.sgp1.digitaloceanspaces.com/doc/longtime.pdf';// 'https://etabella.sgp1.digitaloceanspaces.com/case139/dc_01714564036291.pdf'// 'https://etabella.legal:3443/doc/case285/dc_767670475.pdf'// 'https://etabella.legal:3443/doc/case22/file_602878100339.PDF'; // 'http://161.97.153.182:3000/demo.pdf';
  // demoPdfSrc: string = 'http://localhost:3000';

  pageViewMode: 'single' | 'book' | 'multiple' | 'infinite-scroll' = 'multiple';
  pageRotation: any = 0;
  handTool: boolean = false;
  currentPage: number = 1;
  zoom: any = 'page-actual';
  totalSearch: number = 0;
  currentSearch: number = 0;
  isSearching: boolean = false;
  factsheetalert: boolean = false;
  annotaioninstruction: boolean = false;
  searchInterval: any;
  sideBar: boolean = false;
  globannots: PDFAnnotation[] = [];
  @Input() linkExplorerMode: linkExplorer = null;
  @Input() linkExplorerType: linkExplorerType = 'F';
  @Input() nRFSid: number = 0;
  @Input() nRDocid: number = 0;
  @Input() nRWebid: number = 0;
  @Input() nPageno: number;
  public tempAnnots: temporaryAnnots[] = [];
  private pageViewports: Map<number, PDFPageViewport> = new Map<number, PDFPageViewport>();
  public _panEnabled: boolean = false;
  private _canDraw: boolean = true;
  private svg: SVGElement | null = null;
  private lines: any[] = [];
  private svgPageNumber: number = 0;
  private svgViewPort: PDFPageViewport | null = null;


  public spreadMode: "off" | "even" | "odd" = "off";
  isChecked: boolean = false;
  highlightIndex: number = 0;
  // handtools 
  highlightBox: boolean = false;
  highlightBoxOptions: itemPosition = { x: 0, y: 0, position: 0, page: 0 } as itemPosition;
  hyperlinkBoxOptions: itemPosition = { x: 0, y: 0, position: 0, page: 0 } as itemPosition;
  loading: boolean = true;
  loadingProgress: number = 0;
  pdfLoaded: boolean = false;
  pdfFailed: boolean = false;
  linkIds: number[] = [];
  //// RECTBOX


  hyperlinkBox: boolean = false;
  hyperlinkOption: hyperlinkOption = {} as hyperlinkOption;

  public _rectEnabled: boolean = false;
  private isDrawing: boolean = false;
  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private resizeDirection: any = null;
  private rect: HTMLElement | null = null;
  private isMovingReact: boolean = false;
  private isMovingDraw: boolean = false;
  pagesCount: number = 0;

  dialogRef: any;
  modeltype: ModelType = null;
  scale_factor: number = null;
  on_page_change: number = 0;
  selectedlinktype: linkType = {} as linkType;
  annotGlobMode: globAnnot = 'S';
  globalAnnots: globalAnnots[] = [];

  nFSid: number = 0;
  nFSuuid: string | null = null;
  private current_clicked_annot: string | null = null;

  isSlab: boolean = false;
  slabMode: slabModeType = null;
  isEditLoading: boolean = false;
  msgTimeOut: any;
  pagginationRenge: paginationRenge[] = [];
  userList: myTeamUsers[] = [];
  isConverttopagelevel: boolean = false;
  onPdfEvent: Subject<any> = new Subject();
  isHavehighlights: boolean = false;
  hoverTimeout: any;
  hoverUUid: string | null = null;
  constructor(private pdfExtendedService: NgxExtendedPdfViewerService, private pdfService: PdfService, private dialog: MatDialog,
    private cdr: ChangeDetectorRef, private pdfDataService: PdfDataService, private renderer: Renderer2, private tost: TostbarService, private common: CommonService, private urlService: UrlService
  ) {

    this.initData();
  }



  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['zoom'] && !changes['zoom'].firstChange) {
      this.cdr.detectChanges();
    }


    if (changes['path'] && !changes['path'].firstChange) {

      this.pdfSrc = this.filepath + this.path;
      console.log('PDF PATH', this.pdfSrc)
      this.pdfLoaded = false;
      this.pdfFailed = false;
      this.currentPage = this.docInfo?.nPageno || this.currentPage;
      this.loadingProgress = 0;


      this.cdr.detectChanges();
    }


    if (changes['nPageno'] && !changes['nPageno'].firstChange) {
      this.onPage();
    }
  }

  onPage() {

    try {

      if (this.nPageno) {
        if (!this.pagginationRenge?.length) {
          this.currentPage = this.nPageno;
          this.cdr.detectChanges();
          return;
        }
        const pg = this.pagginationRenge.find(a => parseInt(a.output.split('-')[1]) == this.nPageno)
        if (pg)
          this.currentPage = pg?.page || 1;
      }
    } catch (error) {

    }
  }

  onZoomChanged(e: any) {

  }

  async ngOnInit() {
    if (this.fullMode) {
      // this.pageViewMode = 'multiple';
      this.textLayer = true;
    }
    pdfDefaultOptions.disableStream = true;
    pdfDefaultOptions.disableAutoFetch = true;
    // pdfDefaultOptions.textLayerMode = this.textLayer ? 1 : 0;
    // pdfDefaultOptions.annotationMode = this.textLayer ? 1 : 0;
    pdfDefaultOptions.rangeChunkSize = 1024 * 1024 * 2;
    pdfDefaultOptions.removePageBorders = false;
    pdfDefaultOptions.defaultCacheSize = 10;
    if (this.onViewerEvent) {
      this.onViewerEvent.subscribe((e: toolEvents) => {
        if (e.event == 'EDIT-HIGHLIGHT') {
          this.startEditingHighlight(e.data);
          this.annotaioninstruction = true;
        } else if (e.event == 'DELETE-FACT') {
          this.deleteLinksAnnotations(e.data, 'nFSid');
        } else if (e.event == 'COMPARE_INDEX') {
          this.compareIndex = e.data;
          this.cdr.detectChanges();
        } else if (e.event == 'FACT-CONVERT-HIGHLIGHT-TO-FILE') {
          this.convertHighlightToFile(e.data);
        } else if (e.event == 'FACT-CONVERT-HIGHLIGHT-TO-PAGERANGE') {
          this.nFSid = e.data.nFSid;
          this.isConverttopagelevel = true;
          this.reloadPdf();
          this.cdr.detectChanges();
        } else if (e.event == 'TOOL-CHANGE-EVENTS') {
          // this.onPdfEvent.next(e);
          this.pdfViewer["PDFViewerApplication"].eventBus.dispatch(e.data);
        } else if (e.event == 'FETCH-COMPARE-TOOL-DATA') {
          this.sendDataToParent();
        } else if (e.event == 'COMPARE-TOOL-CHANGE-EVENT') {
          this.onToolEvents(e.data);
        }
      })
    }

    if (!this.fullMode) {
      this.zoom = 'page-width';
    }


    if (this.isLink) {
      this.highlightMode = this.isLink;
      this.annotToolMode = this.isLink == 'F' ? 'F' : 'D';
    }



    // this.getPagginations();
    this.globannots = await this.pdfDataService.getAnnotation(this.docInfo.nBundledetailid);

    this.checkForHighlight();
    this.pdfSrc = this.filepath + this.path;
    this.pageRotation = this.docInfo.nRotate || 0;
    console.log('PDF SRC', this.pdfSrc);
    this.currentPage = this.docInfo.nPageno || 1;
    this.loading = false;


    try {
      if (this.nRFSid || this.nRDocid || this.nRWebid) {
        const obj = this.globannots.find(a => (a.id == this.nRFSid && a.linktype == 'F') || (a.id == this.nRDocid && a.linktype == 'D') || (a.id == this.nRWebid && a.linktype == 'W'));
        if (obj) {
          if (obj.page) {
            this.currentPage = obj.page;
          };
        }
      }
    } catch (error) {

    }

    this.cdr.detectChanges();


    this.getGlobalAnnots();

  }
  onToolEvents(e: toolEvents) {

    if (e.event == 'ROTATION')
      this.pageRotation = e.data;
    else if (e.event == 'HAND')
      this.handTool = e.data;
    else if (e.event == 'ZOOM')
      this.zoom = e.data;
    else if (e.event == 'SEARCH') {

      this.totalSearch = 0;
      this.pdfExtendedService.find(e.data.cSearch, e.data.options);
    }
    else if (e.event == 'SEARCH_NEXT') {
      this.pdfExtendedService.findNext();

      // this.pdfViewer["PDFViewerApplication"].eventBus.dispatch('find', {
      //   highlightAll: true,
      //   matchCase: false,
      //   wholeWords: false,
      //   matchDiacritics: false,
      //   matchRegex: true,
      //   query: e.data.cSearch,
      //   type: 'again',
      //   findPrevious: false,
      //   source: undefined
      // });

    }


    else if (e.event == 'SEARCH_PREVIOUS')
      this.pdfExtendedService.findPrevious();
    else if (e.event == 'SHOWALL') {
      console.log('Show all', e.data); //&& this.pageViewMode != e.data
      this.pageViewMode = this.pageViewMode == 'multiple' ? 'single' : 'multiple'; // e.data;
      this.cdr.detectChanges();
      this.pageViewMode = (e.data == 'multiple') ? 'single' : 'multiple'; // e.data;
    }
    else if (e.event == 'CHANGE_DOC')
      this.onEvent.emit(e);
    else if (e.event == 'PAGE')
      this.currentPage = e.data;
    else if (e.event == 'H-MODE')
      this.modeChange(e.data);
    else if (e.event == 'ZOOM') {

    }
    else if (e.event == 'LINK-EVENT') {
      if (this.isConverttopagelevel) {
        this.onEvent.emit({ event: 'ON-CONVERT-TO-PAGE-LEVEL', data: { ...e.data, nFSid: this.nFSid } });
        this.closeEdit();
        return;
      }
      this.manageLinkEvent(e.data);
    }
    else if (e.event == 'CLOSE_REALTIME')
      this.onEvent.emit(e);

    else if (e.event == 'OPEN_NAVIGATE')
      this.modeltype = this.modeltype != 'N' ? 'N' : null;

    else if (e.event == 'LOCATION_SHARE')
      this.modeltype = this.modeltype != 'LS' ? 'LS' : null;

    else if (e.event == 'OPEN_ISSUEMODEL')
      this.modeltype = this.modeltype != 'IL' ? 'IL' : null;
    else if (e.event == 'VIEW_PROPERTIES')
      this.modeltype = this.modeltype != 'VP' ? 'VP' : null;
    else if (e.event == 'ASSIGN_PROPERTIES')
      this.modeltype = this.modeltype != 'AP' ? 'AP' : null;

    else if (e.event == 'COMPARE_MODE' || e.event == 'LINK_EXPLORER')
      this.onEvent.emit(e);

    else if (e.event == 'PDF_PAGE_CHANGE')
      this.currentPage = e.data.page || 1;
    else if (e.event == 'EXPORT')
      this.exportWithAnnot();
    else if (e.event == 'OPEN-INDIVIDUAL')
      this.openInIndividual();
    //   this.changeDoc(e.data);
    // this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  exportWithAnnot() {
    /*
        let dialog = this.dialog.open(ExportFormComponent, {
          width: 'fit-content',
          height: '90vh',
          hasBackdrop: true,
          // position: { right: '0px', top: '0px' },
          panelClass: ['noshadow', 'overflow-hidden'],
          data: {
            jFiles: `{${this.docInfo.nBundledetailid}}`,
            jFolders: '{}',
            nCaseid: this.nCaseid,
          }
        });
        dialog.afterClosed().subscribe(result => {
        });*/
    // this.deselsctAll();
    // this.dialogRef = null;
    this.cdr.detectChanges();
  }


  manageLinkEvent(data: any) {

    if (this.isLink) {
      this.onEvent.emit({ event: 'LINK-ADDED-DOC', data: { ...this.docInfo, ...data } });
    } else {
      this.closeAllTempAnnots();
      this.pdfService.clearSelect();
      this.selectedlinktype = data;
      this.annotGlobMode = 'M';
      this.modeltype = data.linkMode;
      this.cdr.detectChanges();
    }
  }


  initData() {
    /*this.api.get_casual('text_demoannotations', {}, (res: PDFAnnotation[]) => {
      this.loading = false;
      if (res && res.length) {
        this.globannots.push(...res);

      }
      this.cdr.detectChanges();
    })*/
  }


  factsheetalert1(cb) {
    const dialogRef = this.dialog.open(DialogueComponent, {
      width: '623px',
      height: 'fit-content',
      data: {
        'type': 'I',
        'heading': 'Changes made have not been saved, fact sheet has not been updated.',
        // 'desc': 'To access dashboard, upload and make edits.',
        // 'html': `<ul  class="list-disc ps-5"><li class="text-xs">Delete</li><li  class="text-xs">Drag to alter</li><li  class="text-xs [&>img]:inline">Create new highlight by selecting multiple parts of the file, click the <img   src="assets/icons/add-circle.svg" width="12"/> button to update your factsheet. </li></ul>`,
        'button1': 'Back to factsheet',
        'bt1res': true,
        'bt2res': false,
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      cb(result)
    })
  }


  convertHighlightToFile(data: any) {

    // try {
    //   const annots: PDFAnnotation[] = this.globannots.filter(a => a.id == data.nFSid && a.linktype == 'F');
    //   annots.forEach(a => {
    //     this.removeElementByUUID(a.uuid);
    //   }) 
    // } catch (error) {
    // }
    this.globannots = this.globannots.filter(a => a.id != data.nFSid && a.linktype == 'F');

    this.getGlobalAnnots();
    this.reloadPdf();
    this.checkForHighlight();
    this.cdr.detectChanges();
  }


  getPagginations() {

    this.selectedlinktype = { type: 'H', start: 1, end: this.pagesCount, pages: [] };
    this.pagginationRenge = [];
    if (this.docInfo.cRefpage) {
      this.pagesCount;
      const startNo = Number(this.docInfo.cRefpage.split('-')[0] || 0);
      const end = (this.pagesCount + startNo) - 1;
      this.pagginationRenge = Array.from({ length: end - startNo + 1 }, (_, i) => ({ page: i + 1, output: `${this.docInfo.cTab ? `${this.docInfo.cTab}-` : ''}${startNo + i}` }));

    };
    this.cdr.detectChanges();
  }

  async getGlobalAnnots() {

    this.globalAnnots = await this.pdfDataService.getGlobalAnnotats(this.docInfo.nBundledetailid);
    this.checkForHighlight();
    this.cdr.detectChanges();
  }

  enableHighlightBox() {
    this.highlightBox = true;
    this.isChecked = false;
  }
  disableHighlightBox() {
    this.highlightBox = false;
    this.isChecked = false;
    this.highlightIndex = 0;
    this.highlightBoxOptions = { x: 0, y: 0, position: 0, page: 0 };
    this.disableHyperlinkBox();
  }


  enableHyperlinkBox() {
    this.hyperlinkBox = true;
  }
  disableHyperlinkBox() {
    this.hyperlinkBox = false;
    this.hoverUUid = null;
    this.hyperlinkOption = {} as hyperlinkOption;
    this.hyperlinkBoxOptions = { x: 0, y: 0, position: 0, page: 0 };
    document.body.style.cursor = '';
  }
  OnPageLoad(e: any) {

    // console.clear();

    this.pdfExtendedService;
    this.pdfViewer;
    this.pagesCount = e.pagesCount;
    this.pdfLoaded = true;

    this.getPagginations();
    this.onPage();
    if (this.pdfViewer) {
      // let containerElement:any = this.pdfViewerElementRef.nativeElement.querySelector('#viewerContainer');
      // containerElement.addEventListener('scroll', (e:any)=>{
      //   console.log('Scroll event', e.target.scrollTop);
      // });
      this.pdfExtendedService;
      // this.pdfViewer.pdfViewer.eventBus.off('scroll', this.scrollEventHandler);
    }
    this.updateCurrentScaleFactor();
    this.fetchUser()
    this.sendDataToParent();
    this.cdr.detectChanges();
  }
  onPdfLoaded(e: any) {
    console.warn('PDF LOADED')
  }
  async fetchUser() {

    this.userList = await this.common.getMyTeamUsers(this.nCaseid);
  }

  modeChange(type: highlightToolType) {
    this.annotToolMode = type;
    if (this.annotToolMode == 'DR')
      this._panEnabled = true;
    else
      this._panEnabled = false;
    if (this.annotToolMode == 'R')
      this._rectEnabled = true;
    else
      this._rectEnabled = false;

    if (['F', 'DR', 'R'].includes(this.annotToolMode))
      this.highlightMode = 'F';
    else
      this.highlightMode = this.annotToolMode == 'D' ? 'D' : 'W';

    this.resetPane();
    this.cdr.detectChanges();
  }

  OncurrentZoomFactor(e: any) {
    this.updateCurrentScaleFactor()
  }

  updateCurrentScaleFactor() {
    try {
      const sclaeF = Number(getComputedStyle(this.pdfViewerElementRef.nativeElement.querySelector('.page')).getPropertyValue('--scale-factor'))
      if (typeof sclaeF == 'number' && !Number.isNaN(sclaeF)) {
        this.scale_factor = sclaeF;
      }
      this.cdr.detectChanges();
    } catch (error) {

    }
  }

  annotationByPage(pageNumber: number): PDFAnnotation[] {
    if (this.nFSid) {
      return this.tempAnnots.filter(a => a.annots?.page == pageNumber).map(a => a.annots as PDFAnnotation);
    }
    const data: PDFAnnotation[] = this.globannots.filter(a => a.page == pageNumber); // [...this.facts.filter((a: PDFAnnotation) => a.page == pageNumber), ...this.docs.filter((a: PDFAnnotation) => a.page == pageNumber), ...this.webs.filter((a: PDFAnnotation) => a.page == pageNumber), ...this.lines.filter((a: PDFAnnotation) => a.page == pageNumber)];
    if (this.tempAnnots.length)
      data.push(...this.tempAnnots.filter(a => a.annots?.page == pageNumber).map(a => a.annots as PDFAnnotation));
    return data;
  }

  onPageChange(e: any) {
    this.on_page_change = e;
    this.sendDataToParent();
    this.cdr.detectChanges();

  }

  getPageViewPort(page: number): PDFPageViewport {
    return this.pageViewports.get(page) as PDFPageViewport;
  }


  async onPageRendered(e: any) {
    const pageNumber = e.pageNumber;
    const viewport = e.source.viewport;
    this.pageViewports.set(pageNumber, viewport);
    const anotData: PDFAnnotation[] = this.annotationByPage(pageNumber);
    if (anotData.length || this.fullMode) {
      const highlightData = anotData.filter(a => !a.isHyperlink);
      const SVG: HTMLElement = await this.pdfService.buildSVG(viewport, highlightData, this.nFSid);
      e.source.div.insertBefore(SVG, e.source.div.firstChild)

      const hyperlinkData = anotData.filter(a => a.isHyperlink);
      if (hyperlinkData) {
        const SVGs: HTMLElement[] = await this.pdfService.buildHyperlinkSVG(viewport, hyperlinkData);
        if (SVGs.length)
          e.source.div.append(...SVGs)
      }
      if (this.nRFSid || this.nRDocid || this.nRWebid) {
        const obj = anotData.find(a => (a.id == this.nRFSid && a.linktype == 'F') || (a.id == this.nRDocid && a.linktype == 'D') || (a.id == this.nRWebid && a.linktype == 'W'));
        // const obj = anotData.find(a => a.id == this.nRFSid && a.linktype == 'F');
        if (obj) {
          const element: HTMLElement = SVG.querySelector(`[icon-${obj.uuid}]`);
          if (element) {
            this.pdfService.elementScroll(element);
            this.iconClick(element);
          }
        }
      }

    }

    if (this.nFSid) {
      if (anotData.findIndex(a => a.uuid == this.nFSuuid) > -1) {
        const page = e.source.div;
        const element = page.querySelector(`[uuid="${this.nFSuuid}"]`);
        if (element) {
          const bBox = element.getBBox();
          this.annotClicked(element, page, { clientX: bBox.x, clientY: bBox.y });
        }
      }
    }

  }

  async relaodPageAnnots(pageNumber: number): Promise<boolean> {
    const viewport = this.getPageViewPort(pageNumber);
    this.pageViewports.set(pageNumber, viewport);
    const anotData: PDFAnnotation[] = this.annotationByPage(pageNumber);
    const highlightData = anotData.filter(a => !a.isHyperlink);
    const SVG: HTMLElement = await this.pdfService.buildSVG(viewport, highlightData, this.nFSid);
    const PAGE = this.pdfViewerElementRef.nativeElement.querySelector(`#viewer [data-page-number="${pageNumber}"][data-loaded="true"]`);
    if (PAGE) {
      try {
        const svgElement = PAGE.querySelector('svg');
        if (svgElement) {
          this.renderer.removeChild(PAGE, svgElement);
        }
      } catch (error) {
      }
      PAGE.insertBefore(SVG, PAGE.firstChild);


      const hyperlinkData = anotData.filter(a => a.isHyperlink);
      if (hyperlinkData) {
        const SVGs: HTMLElement[] = await this.pdfService.buildHyperlinkSVG(viewport, hyperlinkData);
        if (SVGs.length)
          PAGE.append(...SVGs)
      }

    }
    return true;
  }


  resetPane() {
    this.lines = [];
    // this._panEnabled = false;
    this._canDraw = false;
    this.svg = null;
    this.pdfService.svgPath = null;
    this.pdfService.penAnnot = null;
    this.svgViewPort = null;
    this.isMovingDraw = false;
    this.svgPageNumber = 0;
    this.cdr.detectChanges();
  }

  getSvgElement(pageNumber: number): SVGElement | null {
    return this.pdfViewerElementRef.nativeElement.querySelector(`#viewer [data-page-number="${pageNumber}"] svg`);
  }

  async markHighlight(modeltype: any, color?: any): Promise<temporaryAnnots> {
    const type = this.pdfService.getAnnotationType(modeltype);
    try {
      const selection: any = this.pdfService.getSelectionRects();
      if (!selection.rects.length) {
        return Promise.reject({ msg: 'Nothing is selected' });
      }
      const viewport: PDFPageViewport = this.getPageViewPort(selection.page);

      const svg = this.getSvgElement(selection.page);
      if (!svg) {
        return Promise.reject({ msg: 'SVG not found' })
      }
      const rects = Array.from(selection.rects).map((r: any) => ({ top: r.top, left: r.left, width: r.width, height: r.height }));
      const annotation = await this.pdfService.saveRect(type, selection.page, rects, color, viewport, svg);

      this.pdfService.clearSelect();
      return Promise.resolve({ annots: annotation, text: selection.text });

    } catch (error) {
      return Promise.reject({ msg: 'Annotation failed', error });
    }
  }


  OnMouseDown(e: any) {
    if (this._panEnabled) {

      const page = e.target.closest('[data-page-number]');
      if (!page) return;
      this._canDraw = true;
      this.pdfService.setPen(4, '#3F99FF');
      this.svgPageNumber = Number(page.getAttribute('data-page-number'))
      this.svgViewPort = this.getPageViewPort(this.svgPageNumber);
      this.svg = this.getSvgElement(this.svgPageNumber);
      // this.pdfService.savePoint(e.clientX, e.clientY, this.svg, this.svgViewPort, this.svgPageNumber, this.lines);
    } else {
      this.resetPane();
      this._canDraw = false;
    }



    if (this._rectEnabled) {

      this.manageRectBox(e)
    } else {

    }



  }

  getText(selection) {
    try {
      return selection?.toString().replace(/\s+/g, '');
    } catch (error) {
      return '';
    }
  }

  async annotClicked(element: any, page: any, e: any) {
    if (this.isMovingDraw || this.isMovingReact) return;
    console.log('Element clicked', element);
    const uuid = element.getAttribute('uuid');
    const index = this.tempAnnots.findIndex((a) => a.annots?.uuid == uuid && !a.isNotSaved);
    if (index > -1) {
      this.enableHighlightBox();
      this.isChecked = true;
      this.highlightIndex = index;

      if (this.nFSid) {
        await this.recolorAllOtherHighlights();
        element.setAttribute('fill', '#1990d9');
      }

      this.current_clicked_annot = element.getAttribute('uuid');

      this.highlightBoxOptions = {
        x: (this.nFSid ? (this.getEditXposition(page)) : e.clientX),
        y: e.clientY,
        position: this.highlightBoxOptions.y - (page.getBoundingClientRect().top),
        page: Number(page.getAttribute('data-page-number'))
      };
    }
  }

  async OnMouseUp(e: any) {
    if ((!this.isMovingReact && this.annotToolMode == 'R') && this._rectEnabled) {
      this.resetRectBox();
      return
    };

    if (this._rectEnabled) {
      this.resetRectBox();
    }

    if ((!this.fullMode && !this.isLink) || this.linkExplorerMode || this.compareMode) return;
    try {
      this.disableHighlightBox();
      const selection = window.getSelection();
      if ((!(selection?.rangeCount == 1 && selection?.type == 'Range' && this.getText(selection)) && !this._panEnabled && this.annotToolMode != 'R') || (this._panEnabled && this.lines.length <= 1)) { //selectdion?.toString().length
        this.resetPane();
        return;
      }
      const page: HTMLElement = e.target.closest('[data-page-number]');
      if (page) {

        this.pdfExtendedService;
        this.pdfViewer;
        // viewerPositionTop
        this.enableHighlightBox();
        this.highlightBoxOptions = {
          x: (this.nFSid ? (this.getEditXposition(page)) : e.clientX),
          y: e.clientY,
          position: this.highlightBoxOptions.y - (page.getBoundingClientRect().top),
          page: Number(page.getAttribute('data-page-number'))
        };
      }
      if (this._panEnabled) {
        await this.annotationAdded(this.pdfService.penAnnot);
        this.resetPane();
      }
    } catch (error) {

    }

    this.cdr.detectChanges();
  }

  onMouseMove(e: any) {
    if (this._rectEnabled) {
      if (this.isDrawing)
        this.updateRectSize(e.offsetX, e.offsetY);
      return;
    }
    if (!this._panEnabled) return;
    if (!this._canDraw) return;
    this.isMovingDraw = true;
    this.pdfService.savePoint(e.clientX, e.clientY, this.svg, this.svgViewPort, this.svgPageNumber, this.lines);
  }

  //// RECTBOX
  manageRectBox(e: any) {
    const page = e.target.closest('[data-page-number]');
    if (!page) return;
    this.svgPageNumber = Number(page.getAttribute('data-page-number'));
    const svg = this.getSvgElement(this.svgPageNumber);
    if (!svg) return;
    this.isDrawing = true;
    this.startX = e.offsetX / this.scale_factor;
    this.startY = e.offsetY / this.scale_factor;
    this.rect = this.pdfService.defaultRectNode(); // { x: this.startX, y: this.startY, width: 0, height: 0 };
    this.rect.setAttribute('x', this.startX.toString());
    this.rect.setAttribute('rx', '15');
    this.pdfService.setAttributes(this.rect, { uuid: this.pdfService.generateRandomId(), fill: "transparent", stroke: "#3F99FF", "stroke-width": "2", x: this.startX, y: this.startY, width: 0, height: 0, style: 'scale: calc(var(--scale-factor) * 1)' }); //, style: 'scale: calc(var(--scale-factor) * 1)' 
    svg.appendChild(this.rect);
    this.cdr.detectChanges();
  }

  updateRectSize(mouseX: number, mouseY: number) {
    this.isMovingReact = true;
    this.cdr.detectChanges();
    const width = Math.abs(mouseX / this.scale_factor - this.startX);
    const height = Math.abs(mouseY / this.scale_factor - this.startY);
    const x = Math.min(mouseX / this.scale_factor, this.startX);
    const y = Math.min(mouseY / this.scale_factor, this.startY);
    if (this.rect)
      this.pdfService.setAttributes(this.rect, { x, y, width, height, style: 'scale: calc(var(--scale-factor) * 1)' });
  }

  async resetRectBox() {
    this.isDrawing = false;
    this.isDragging = false;
    this.isResizing = false;
    this.resizeDirection = null;
    if (this.rect && this.isMovingReact) {
      try {
        const annotation: PDFAnnotation = {
          id: 0,
          uuid: String(this.rect.getAttribute('uuid')),
          isTemp: true,
          page: this.svgPageNumber,
          linktype: 'F',
          type: 'area',
          color: this.pdfService.getDefaultColor(),
          rects: [
            {
              x: Number(this.rect?.getAttribute('x')),
              y: Number(this.rect?.getAttribute('y')),
              width: Number(this.rect?.getAttribute('width')),
              height: Number(this.rect?.getAttribute('height'))
            }
          ]
        }
        await this.annotationAdded(annotation);
      } catch (error) {
        console.error('Error in creating annotation', error);
      }
    }
    this.isMovingReact = false;
    this.rect = null;
    this.svgPageNumber = 0;
    this.cdr.detectChanges();
  }

  //// RECT BOX END
  onFind(e: any) {
    if (e.type == '')
      this.isSearching = true;
    this.currentSearch = e.current;
    this.totalSearch = e.total;
    this.sendDataToParent();
    try {
      clearTimeout(this.searchInterval);
      this.searchInterval = setTimeout(() => {
        this.isSearching = false;
        this.sendDataToParent();
        this.cdr.detectChanges()
      }, 200);
    } catch (error) {

    }
  }

  onProgress(e: any) {
    // console.log('Progress', e?.percent);
    this.loadingProgress = parseInt(e.percent);
    this.cdr.detectChanges();
  }

  onPdfLoadingStart(e: any) {
    console.warn('PDF loading start')
    this.pdfLoaded = false;
    this.pdfFailed = false;
    this.cdr.detectChanges();
  }

  onPdfLoadingFailed(e: any) {
    console.error('PDF Failed', e);
    this.pdfFailed = true;
    this.cdr.detectChanges();
  }

  changeSideBar() {
    this.sideBar = !this.sideBar;
    this.cdr.detectChanges();
  }

  changeDocument() {
    this.onEvent.emit({ event: 'SWAP', data: null });
  }

  async OnToolBoxEvent(e: any) {
    if (e.event == 'CHECK-MARK') {
      this.highlightMode = e.mode;
      this.isChecked = true;
      if (this._panEnabled || this._rectEnabled) {
        this.tempAnnots.map(a => a.isNotSaved = false);
        this.tempAnnots = [...this.tempAnnots];
        this.highlightIndex = this.tempAnnots.length - 1;
        if (this.nFSid && this.tempAnnots?.length) {
          const annots = this.tempAnnots[this.tempAnnots.length - 1];
          this.addEditedHighlight(annots.annots, annots.text);
        }
        return;
      }
      if (['D', 'W'].includes(this.highlightMode)) {
        this.annotToolMode = this.highlightMode == 'W' ? 'W' : 'D';
        this.cdr.detectChanges();
      }
      const data = await this.markHighlight(this.annotToolMode);
      await this.annotationAdded(data.annots, data.text);
      if (data.annots) {
        this.highlightIndex = this.tempAnnots.length - 1;
      }
      if (this.nFSid) {
        this.addEditedHighlight(data.annots, data.text);
      }
      this.cdr.detectChanges();
    } else if (e.event == 'CLOSE') {
      this.closeAllTempAnnots();
      this.pdfService.clearSelect();
    } else if (e.event == 'DELETE-SELECTED') {
      this.deleteSelected(e.index);
    } else if (e.event == 'SUBMIT-ANNOT') {
      if (this.isLink) {
        this.disableHighlightBox();
        this.manageLinkEvent({ mode: 'H', start: 1, end: this.pagesCount, highlights: this.tempAnnots.map(a => a.annots), texts: this.tempAnnots.map(a => a.text), pages: this.tempAnnots.map(a => a.annots?.page) });
      } else {
        // this.selectedlinktype = { type: 'H', start: 0, end: 0, pages: this.tempAnnots.map(a => a.annots?.page) };
        this.annotGlobMode = 'S';
        this.modeltype = this.highlightMode == 'QF' ? 'QF' : (this.highlightMode == 'F' ? 'F' : (this.highlightMode == 'D' ? 'D' : 'W')); //(['F', 'DR', 'R'].includes(this.annotToolMode)) ? 'F' : this.annotToolMode == 'D' ? 'D' : 'W';
        this.cdr.detectChanges();
      }
    } else if (e.event == 'ON-DELETE') {
      this.pdfService.clearSelect();
      this.deleteEditedHighlight();
      this.disableHighlightBox();
    } else if (e.event == 'MOVE-TO-INDEX') {
      this.moveBoxToHighlight(e.index);
    }

  }


  async annotationAdded(annotation: PDFAnnotation | null, text?: string | null): Promise<boolean> {

    // if (this._panEnabled || this._rectEnabled) {
    await this.clearNotSavedAnnots();
    // return
    // };
    this.tempAnnots.push({ annots: annotation, text: text, isNotSaved: (this._panEnabled || this._rectEnabled) });
    this.tempAnnots = [...this.tempAnnots];

    if (this._panEnabled || this._rectEnabled)
      this.highlightIndex = this.tempAnnots.length - 1;

    console.log('Annotation Added', annotation);
    this.cdr.detectChanges();
    return Promise.resolve(true);
  }

  closeAllTempAnnots() {
    try {
      this.tempAnnots.forEach((a) => {
        if (a.annots) {
          try {
            const svg: SVGElement | null = this.getSvgElement(a.annots.page);
            this.pdfService.removeByUUID(svg, a.annots.uuid);
          } catch (error) {
            console.error('Error in removing annotation', error);
          }
        }
      })
    } catch (error) {

    }
    this.tempAnnots = [];
    this.disableHighlightBox();
    this.cdr.detectChanges();
  }


  clearNotSavedAnnots(): Promise<boolean> {
    const notSavedAnnotas = this.tempAnnots.filter(a => a.isNotSaved)?.map(a => a.annots) || [];
    if (notSavedAnnotas.length) {


      notSavedAnnotas.forEach((annot: PDFAnnotation) => {
        const svg: SVGElement | null = this.getSvgElement(annot.page);
        this.pdfService.removeByUUID(svg, annot.uuid);
      })

      this.tempAnnots = this.tempAnnots.filter(a => !a.isNotSaved);
      this.cdr.detectChanges();
    }
    return Promise.resolve(true);
  }

  deleteSelected(index: number) {
    if (index >= this.tempAnnots.length) return;
    const annot: PDFAnnotation = this.tempAnnots[index].annots;
    if (annot) {
      const svg: SVGElement | null = this.getSvgElement(annot.page);
      this.pdfService.removeByUUID(svg, annot.uuid);
      this.tempAnnots.splice(index, 1);
      this.moveBoxToHighlight((index - 1) > -1 ? (index - 1) : (index + 1));
    }
  }

  moveBoxToHighlight(index: number) {
    // this.disableHighlightBox();
    if (!this.tempAnnots.length) {
      this.disableHighlightBox();
      return;
    }
    this.highlightIndex = index;
    const annot: PDFAnnotation = this.tempAnnots[index]?.annots || null;
    if (!annot) {
      this.disableHighlightBox();
      return;
    }
    const PAGE = this.pdfViewerElementRef.nativeElement.querySelector(`#viewer [data-page-number="${annot.page}"][data-loaded="true"]`);
    if (PAGE) {
      const element: HTMLElement = PAGE.querySelector(`[uuid="${annot.uuid}"]`);
      if (element) {
        this.pdfService.elementScroll(element);
      }
    } else {
      this.currentPage = annot.page;
      this.disableHighlightBox();
    }
    this.cdr.detectChanges();
  }

  async annotGlobalClick(element: any, page: any, x: any, y: any, isOpen: boolean) {

    if (this.isMovingDraw || this.isMovingReact) return;
    const uuid = element.getAttribute('uuid');
    const index = this.globannots.findIndex((a) => a.uuid == uuid);
    if (index > -1) {
      this.enableHyperlinkBox();

      this.current_clicked_annot = element.getAttribute('uuid');

      this.hyperlinkOption = {
        nBundledetailid: String(element.getAttribute('bundledetailid')),
        redirectpage: Number(element.getAttribute('redirectpage') || 0),
        redirectpage2: Number(element.getAttribute('redirectpage2') || 0),
        nDocid: this.globannots[index].nDocid || null,
        isOpen: isOpen
      }

      this.hyperlinkBoxOptions = {
        // x: e.clientX,
        // y: e.clientY + 10,
        x: x,
        y: y,
        position: this.hyperlinkBoxOptions.y - (page.getBoundingClientRect().top),
        page: Number(page.getAttribute('data-page-number'))
      };
    } else {
      this.hoverUUid = null;
    }
    this.cdr.detectChanges();
  }


  iconClick(icon: any) {
    try {
      this.selectIcon(icon);
      const iconType = icon.getAttribute('icon-type');
      if (iconType) {
        this.linkIds = icon.getAttribute('db-ids').split(',').map(a => Number(a));
        if (!this.linkIds.length) return;
        this.modeltype = iconType == 'F' ? 'RF' : (iconType == 'QF' ? 'RQF' : (iconType == 'D' ? 'RD' : 'RW'));
      }
    } catch (error) {
      this.linkIds = [];
      this.modeltype = null;
      console.error('Error in icon click', error);
    }
    this.cdr.detectChanges();
  }


  async unselectIcons(): Promise<any> {
    const icons = this.pdfViewerElementRef.nativeElement.querySelectorAll('[data-icon]') || [];
    for (let x of Array.from(icons)) {
      x.classList.remove('active-shadow');
    }
    return true;
  }

  async selectIcon(icon: any) {
    await this.unselectIcons();
    icon.classList.add('active-shadow');
  }

  getEditXposition(page) {
    return page.getBoundingClientRect().left + page.clientWidth + 20;
  }


  async OnEventOfLinks(e: any) {

    if (e.event == 'FACT-ADDED') {
      if (this.annotGlobMode == 'M') {
        this.getGlobalAnnots();
      }
      this.factAdded(e);
    } if (e.event == 'QUICK-FACT-ADDED') {
      this.quickfactAdded(e);
    } else if (e.event == 'DOC-ADDED') {
      if (this.annotGlobMode == 'M') {
        this.getGlobalAnnots();
      }
      this.docAdded(e);
    } else if (e.event == 'WEB-ADDED') {
      if (this.annotGlobMode == 'M') {
        this.getGlobalAnnots();
      }
      this.webAdded(e);
    } else if (e.event == 'CLOSE') {
      this.modeltype = null;
      this.unselectIcons();
      this.cdr.detectChanges();
    } else if (e.event == 'DELETE-FACT') {
      this.deleteLinksAnnotations(e.data, 'nFSid');
    } else if (e.event == 'DELETE-DOC') {
      this.deleteLinksAnnotations(e.data, 'nDocid');
    } else if (e.event == 'DELETE-WEB') {
      this.deleteLinksAnnotations(e.data, 'nWebid');
    } else if (e.event == 'BIG-FACT') {
      this.onEvent.emit(e);
      this.modeltype = null;
      this.cdr.detectChanges();
    } else if (e.event == 'VIEW-DETAIL-LINKS') {

      this.openDetailOfLinks(e.data)
    } else if (e.event == 'FILTER-ISSUE-DETAIL') {
      this.modeltype = 'N';
      this.cdr.detectChanges();
    }
    /* else if (e.event == 'CLEAR-TEMP-ANNOT') {
      this.closeAllTempAnnots();
    }*/

  }


  async deleteLinksAnnotations(data: any, column: string) {
    const DeleteArray: any = this.globannots.filter(a => a[column] == data[column]);
    this.globannots = this.globannots.filter(a => a[column] != data[column]);
    this.reloadNewAnnotPages(DeleteArray);
    if (this.globalAnnots.length) {
      const colType = (column == 'nFSid' ? 'F' : (column == 'nDocid' ? 'D' : 'W'));
      const Gfact = this.globalAnnots.find(a => a.type == colType);
      if (Gfact.id.includes(data[column])) {
        Gfact.id = Gfact.id.filter(a => a != data[column]);
        if (!Gfact.id.length) {
          this.globalAnnots = this.globalAnnots.filter(a => a.type != colType);
        }
      }
    }
    this.checkForHighlight();
    this.cdr.detectChanges();
  }

  async quickfactAdded(e: any) {
    this.tempAnnots.forEach((a: temporaryAnnots) => {
      a.annots.nFSid = e.data.nFSid;
      a.annots.id = e.data.nFSid;
      a.annots.color = e.data.color ? e.data.color : a.annots.color;
      a.annots.colorid = e.data.colorid ? e.data.colorid : a.annots.colorid;
      a.annots.isTemp = false;
      a.annots.linktype = 'QF';
      this.globannots.push(a.annots as PDFAnnotation);
    });
    this.reloadNewAnnotPages();
    this.disableHighlightBox();
    this.modeltype = null;
    this.cdr.detectChanges();
  }

  async factAdded(e: any) {
    try {
      if (e.data?.nQFSid) {
        this.globannots = this.globannots.filter(a => a.id != e.data.nQFSid && (['F', 'QF'].includes(a.linktype)));
      }
    } catch (error) {
    }
    this.tempAnnots.forEach((a: temporaryAnnots) => {
      a.annots.nFSid = e.data.nFSid;
      a.annots.id = e.data.nFSid;
      a.annots.color = e.data.color ? e.data.color : a.annots.color;
      a.annots.colorid = e.data.colorid ? e.data.colorid : a.annots.colorid;
      a.annots.isTemp = false;
      a.annots.linktype = 'F';
      this.globannots.push({ ...a.annots } as PDFAnnotation);
    });
    this.reloadNewAnnotPages();
    this.disableHighlightBox();
    this.modeltype = null;
    this.cdr.detectChanges();
  }

  async docAdded(e: any) {
    this.tempAnnots.forEach((a: temporaryAnnots) => {
      a.annots.nDocid = e.data.nDocid;
      a.annots.id = e.data.nDocid;
      a.annots.isTemp = false;
      a.annots.linktype = 'D';
      this.globannots.push(a.annots as PDFAnnotation);
    });
    this.reloadNewAnnotPages();
    this.disableHighlightBox();
    this.modeltype = null;
    this.cdr.detectChanges();
  }


  async webAdded(e: any) {
    this.tempAnnots.forEach((a: temporaryAnnots) => {
      a.annots.nWebid = e.data.nWebid;
      a.annots.id = e.data.nWebid;
      a.annots.isTemp = false;
      a.annots.linktype = 'W';
      this.globannots.push(a.annots as PDFAnnotation);
    });
    this.reloadNewAnnotPages();
    this.disableHighlightBox();
    this.modeltype = null;
    this.cdr.detectChanges();
  }

  async reloadNewAnnotPages(reloadAnnots?: any) {
    const pages: any = [];
    if (reloadAnnots) {
      pages.push(...reloadAnnots.map((a: PDFAnnotation) => a.page).filter((v, i, a) => a.indexOf(v) === i));
    } else {
      pages.push(...this.tempAnnots.map((a: temporaryAnnots) => a.annots?.page).filter((v, i, a) => a.indexOf(v) === i));
    }
    this.tempAnnots = [];
    this.cdr.detectChanges();
    try {
      if (pages && pages.length) {
        for (let x of pages) {
          await this.relaodPageAnnots(x);
        }
      }
    } catch (error) {
    }
    this.checkForHighlight();
  }





  openDetail(x) {
    this.linkIds = x.id;
    this.modeltype = x.type == 'F' ? 'RF' : (x.type == 'D' ? 'RD' : 'RW');
    this.cdr.detectChanges();
  }


  openInIndividual() {
    this.onEvent.emit({ event: 'OPEN-INDIVIDUAL' });
  }


  closeRealtimePdf() {
    this.onEvent.emit({ event: 'CLOSE_REALTIME', data: null });
  }



  startEditingHighlight(e) {

    const annots = this.globannots.filter(a => a.nFSid == e.nFSid);
    this.tempAnnots = [];
    annots.forEach((a: PDFAnnotation, index) => {
      // a.color = '#1990d9'
      this.tempAnnots.push({ annots: a, text: '' });
    });

    this.nFSid = e.nFSid;
    try {
      this.nFSuuid = annots[e.index - 1].uuid;
      this.currentPage = annots[e.index - 1].page;
    } catch (error) {

    }
    this.reloadPdf();

  }
  reloadPdf() {

    this.pdfSrc = `${this.filepath}${this.path}?id=${Math.random()}`;
    this.cdr.detectChanges();
  }

  recolorAllOtherHighlights(): Promise<boolean> {
    this.tempAnnots.forEach((a: temporaryAnnots) => {
      try {
        if (a.annots?.uuid) {
          const svg: SVGElement | null = this.getSvgElement(a.annots?.page);
          if (svg) {
            const element = svg.querySelector(`[uuid="${a.annots?.uuid}"]`);
            if (element) {
              element.setAttribute('fill', `#${a.annots?.color}`);
            }
          }
        }
      } catch (error) {
      }
    })
    return Promise.resolve(true);
  }

  //////EDIT MODE FUNCTIONS 

  enableSlab(mode: slabModeType) {
    this.isSlab = true;
    this.slabMode = mode;
    if (this.slabMode == 'U') {
      clearTimeout(this.msgTimeOut);
      this.msgTimeOut = setTimeout(() => {
        this.slabMode = 'UC';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.disableSlab();
        }, 1000);
      }, 1500);
    }
    this.cdr.detectChanges();
  }

  disableSlab() {
    this.isSlab = false;
    this.slabMode = null;
    this.cdr.detectChanges();
  }



  closeEdit() {
    this.isConverttopagelevel = false;
    this.nFSid = 0;
    this.nFSuuid = null;
    this.currentPage = 1;
    this.tempAnnots = [];
    this.pdfSrc = `${this.filepath}${this.path}`;
    this.getGlobalAnnots()
    this.cdr.detectChanges();
  }



  deleteEditedHighlight() {
    if (this.current_clicked_annot) {
      const element = this.pdfViewerElementRef.nativeElement.querySelector(`[uuid="${this.current_clicked_annot}"]`);
      if (element) {
        element.setAttribute('fill', 'transparent');
      }
      this.enableSlab('CD');
    }
  }

  undoDelete() {
    if (this.current_clicked_annot) {
      const element = this.pdfViewerElementRef.nativeElement.querySelector(`[uuid="${this.current_clicked_annot}"]`);
      if (element) {
        const color = this.tempAnnots.find(a => a.annots?.uuid == this.current_clicked_annot)?.annots?.color;
        element.setAttribute('fill', `#${color}`);
      }
      this.cdr.detectChanges();
    }
    this.disableSlab();
    this.disableHighlightBox();
  }

  async confirmDelete() {
    try {
      const index = this.tempAnnots.findIndex((a) => a.annots?.uuid == this.current_clicked_annot);
      if (index > -1) {
        this.tempAnnots.splice(index, 1);
      }
      const ind = this.globannots.findIndex((a) => a.uuid == this.current_clicked_annot);
      if (ind > -1) {
        this.globannots.splice(ind, 1);
      }
    } catch (error) {
    }
    this.removeElementByUUID(this.current_clicked_annot);
    if (this.isEditLoading) {
      return;
    }
    this.isEditLoading = true;
    const res: any = await this.pdfDataService.deleteAnnoatation({ nFSid: this.nFSid, uuid: this.current_clicked_annot });
    this.isEditLoading = false;
    if (res.msg == 1) {
      this.enableSlab('U');
      this.disableHighlightBox();
      this.current_clicked_annot = null;
    } else {
      this.tost.error('Failed to delete');
    }
  }

  removeElementByUUID(uuid: string) {
    const element = this.pdfViewerElementRef.nativeElement.querySelector(`[uuid="${uuid}"]`);
    if (element) {
      element.remove();
    }
  }

  async addEditedHighlight(annot: PDFAnnotation, text: string) {
    this.disableHighlightBox();
    const pages = this.tempAnnots.map(a => a.annots?.page);
    const linkType = { type: 'H', start: 1, end: this.pagesCount || 0, pages: [...new Set(pages)] };
    const mdl = {
      nFSid: this.nFSid,
      cText: JSON.stringify([text]),
      uuid: annot.uuid,
      type: annot.type,
      rects: JSON.stringify(annot.rects || []),
      lines: JSON.stringify(annot.lines || []),
      width: annot.width || 0,
      page: annot.page,
      jLinktype: JSON.stringify(linkType)
    };
    if (this.isEditLoading) {
      return;
    }
    // return;
    this.isEditLoading = true;
    const res: any = await this.pdfDataService.addAnnotation(mdl);
    this.isEditLoading = false;
    if (res.msg == 1) {
      try {
        const element = this.pdfViewerElementRef.nativeElement.querySelector(`[uuid="${annot.uuid}"]`);
        if (element) {
          const color = this.tempAnnots[0]?.annots?.color;
          element.setAttribute('fill', `#${color}`);
          annot.color = color;
        }
      } catch (error) {
      }
      annot.id = this.nFSid;
      annot.nFSid = this.nFSid;
      annot.linktype = 'F';

      this.globannots.push(annot);
      this.enableSlab('U');
      this.disableHighlightBox();
      this.current_clicked_annot = null;
    } else {
      this.tost.error('Failed to add annotation');
    }
  }

  refreshBigFactSheet() {
    this.onEvent.emit({ event: 'REFRESH-BIGFACT', data: null });
  }

  openDetailOfLinks(e) {
    this.linkIds = [Number(e.id)];
    if (!this.linkIds.length) return;
    this.modeltype = e.type == 'F' ? 'RF' : (e.type == 'QF' ? 'RQF' : (e.type == 'D' ? 'RD' : 'RW'));
    // const annot = this.globalAnnots.find(a => a.id.includes(e.id));
    let annot: any = this.globannots.find(a => a.id == e.id && a.linktype == e.type);
    if (annot) {
      this.currentPage = annot.page;
    }
    this.cdr.detectChanges();
  }


  OnEventLinkExplorer(e: toolEvents) {
    this.onEvent.emit(e);
  }

  OnHyperLinkFile(e: toolEvents) {
    this.disableHyperlinkBox();
    this.onEvent.emit(e);
    this.cdr.detectChanges();
  }

  sendDataToParent() {
    if (this.compareMode) {
      const data: pdfToolOptions = {
        pageRotation: this.pageRotation,
        handTool: this.handTool,
        zoom: this.zoom,
        totalSearch: this.totalSearch,
        currentSearch: this.currentSearch,
        isSearching: this.isSearching,
        pageViewMode: this.pageViewMode,
        docInfo: this.docInfo,
        currentPage: this.currentPage,
        pagesCount: this.pagesCount,
        pdfLoaded: this.pdfLoaded,
        pagginationRenge: this.pagginationRenge
      }
      this.onEvent.emit({ event: 'COMPARE-DATA-UPDATE', data: data });
    }
  }
  checkForHighlight() {
    this.isHavehighlights = false;
    if (this.globalAnnots?.length || this.globannots?.length) {
      this.isHavehighlights = true;
    }
    this.cdr.detectChanges();
  }

  async DocumentClick(e: any) {

    const page = e.target.closest('[data-page-number]');
    if (!page) return;
    const pageNumber = Number(page.getAttribute('data-page-number'));
    const svg = this.getSvgElement(pageNumber);
    const offset = this.pdfService.getOffset(page);
    const x = e.pageX - offset.left;
    const y = e.pageY - offset.top;
    const element = await this.pdfService.findTemporaryAnnot(e.clientX, e.clientY, x, y, svg, this.tempAnnots);
    if (element) {
      this.annotClicked(element, page, e);
      return;
    } else {
      const icon = e.target.closest('[data-icon]');
      if (icon) {
        this.iconClick(icon);
        return;
      }
    }
    try {
      if (e.target.nodeName == 'foreignObject') {
        if (e.target.getAttribute('is-hyperlink') == 'Y') {
          const element = e.target.closest('g');
          if (!element) return;


          const bRect = e.target.getBoundingClientRect();
          const x = bRect.x;
          const y = bRect.y + bRect.height;
          this.annotGlobalClick(element, page, x, y, true);
        }
      }
    } catch (error) {

    }


    // const element2 = await this.pdfService.findAnnotAtPoint(e.clientX, e.clientY, x, y, svg, this.globannots, true, true);

    // if (element2) {
    //   this.annotGlobalClick(element2, page, e, true);
    //   return;
    // } else {
    // }

  }

  OnMouseOver(e) {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.hoverHighlights(e);
    }, 10);
  }


  async hoverHighlights(e) {
    if (e.target.nodeName == 'foreignObject') {

      if (e.target.getAttribute('is-hyperlink') == 'Y') {

        const page = e.target.closest('[data-page-number]');
        if (!page) return;

        const element = e.target.closest('g');
        if (!element) return;

        const uuid = element.getAttribute('uuid');
        if (!this.hoverUUid || this.hoverUUid != uuid) {
          this.hoverUUid = uuid;
          const bRect = e.target.getBoundingClientRect();
          const x = bRect.x;
          const y = bRect.y + bRect.height;
          this.annotGlobalClick(element, page, x, y, false);
        }

      }
    } else {
      // if(this.hoverUUid){
      this.disableHyperlinkBox();
      this.cdr.detectChanges();
      // }
    }

    /* return;
     const page = e.target.closest('[data-page-number]');
     if (!page) {
       if (this.hyperlinkBox) {
         this.disableHyperlinkBox();
         this.cdr.detectChanges();
       }
       return
     };
     const pageNumber = Number(page.getAttribute('data-page-number'));
     const svg = this.getSvgElement(pageNumber);
     const offset = this.pdfService.getOffset(page);
     const x = e.pageX - offset.left;
     const y = e.pageY - offset.top;
 
     const element = await this.pdfService.findAnnotAtPoint(e.clientX, e.clientY, x, y, svg, this.globannots, true, true);
 
     if (element) {
       document.body.style.cursor = 'pointer'
       const uuid = element.getAttribute('uuid');
       if (!this.hoverUUid || this.hoverUUid != uuid) {
         this.hoverUUid = uuid;
         this.annotGlobalClick(element, page, e, false);
       }
     } else {
       this.disableHyperlinkBox();
       this.cdr.detectChanges();
     }*/
  }

}