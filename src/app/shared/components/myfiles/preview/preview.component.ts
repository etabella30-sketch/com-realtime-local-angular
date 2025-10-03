import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { IconComponent } from '../../icon/icon.component';
import { CommonModule } from '@angular/common';
import { PdfComponent } from '../../../../pdf/components/pdf/pdf.component';
import { MatMenuModule } from '@angular/material/menu';
import { CommonfunctionService } from '../../../../core/utility/commonfunction.service';
import { DocInfo, highlightModeType, toolEvents } from '../../../../pdf/interfaces/pdf.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { tabmodel } from '../../../../realtime/models/annotation.interface';
import { environment } from '../../../../../environments/environment';
import { bundleDetailRes, filedataReq, filedataRes } from '../../../../pdf/interfaces/myfile.interface';
import { MyfileService } from '../../../services/myfile/myfile.service';
import { UrlService } from '../../../../services/url.service';
@Component({
  selector: 'preview',
  standalone: true,
  imports: [CommonModule, PdfComponent, ButtonComponent, IconComponent, MatMenuModule, MatTooltipModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss'
})
export class PreviewComponent {
  @ViewChildren('embeddedIframe') embeddedIframes: QueryList<ElementRef>;
  @Input() isMyfile: boolean = false;
  @Input() viewlist: bundleDetailRes[] = [];
  @Input() changeP: boolean = false;
  @Input() nCaseid: string;
  @Input() rightpanelwidth: number;
  @Input() isLink: highlightModeType = null;
  @Input() selectedDocuments: any[] = [];
  @Input() isChooser: boolean = false;
  @Input() nPage: number = 1;
  @Input() previewMode: boolean = false;
  @Output() OnFileSelected = new EventEmitter<any>();
  @Output() changePreview = new EventEmitter<boolean>();
  @Output() OnEvent = new EventEmitter<any>();
  @Input() isRealtime: boolean = false;
  @Input() tabBox: tabmodel | null = null;
  @Input() isadmin: boolean = false;
  @Input() isIndividual: boolean = false;
  activeFile: filedataRes;
  cPath: any;
  currentFiletype: any;
  viewSelection: boolean = false;
  confirmcancel: boolean = false;
  nonsupport: boolean = false;
  hidemsg: boolean = false;
  isSaving: boolean = false;

  viewChoosen: boolean = false;
  isLoaded: boolean = false;
  @HostListener('window:message', ['$event'])
  onPdf = (event: MessageEvent) => {
    try {
      if (event.origin !== window.location.origin || !event.data.identity) {
        return;
      }
      try {

        if (event.data?.message?.event == 'CLOSE_REALTIME') {
          this.OnEvent.emit(event.data?.message)
          return;
        }
      } catch (error) {

      }
      try {
        if (this.isRealtime) {
          const data: toolEvents = event.data.message;
          if (data.event == 'OPEN-INDIVIDUAL') {
            this.openIndividual({ nBundledetailid: event.data.identity });
          }
        }
      } catch (error) {

      }

      const index: number = this.viewlist.findIndex(a => a.nBundledetailid == event.data.identity);
      if (index == -1) return;

      let x: bundleDetailRes = this.viewlist[index];
      if (x) {
        const data: toolEvents = event.data.message;
        if (data.event == 'LINK-ADDED-DOC') {
          this.addDataToSelectedDocs(data.data);
        } else if (data.event == 'OPEN-INDIVIDUAL') {
          // if (!this.isLink && !this.isChooser) {
          if (this.isMyfile) {
            this.openIndividual(x)
          }
          if (this.isChooser && !this.isLink) {
            this.openDocumentInChooser(x);
          }
        }
      }
    } catch (error) {
      console.error('error in data of parent', error);
    }

    // alert(4)
  }

  constructor(
    private myfileS: MyfileService,
    // private individualService: IndividualService,
    private cdr: ChangeDetectorRef, private cf: CommonfunctionService, private urlService: UrlService) {

  }

  async ngOnInit() {
    if (this.isRealtime) {
      this.activeFiledata()
    }
    this.updatePath();
  }


  async openDocumentInChooser(x) {
    /* const files: any[] = await this.individualService.getTabinfo([x.nBundledetailid]);
     this.OnFileSelected.emit(files);*/
  }

  ngOnDestroy(): void {
    this.activeFile = null;
  }

  ngAfterViewInit(): void {
  }

  async changePdfFile(tabBox) {
    if (this.tabBox && this.tabBox.cTab) {
      
      this.activeFile = await this.myfileS.getFiledata({ cTab: this.tabBox.cTab, nCaseid: this.nCaseid });
      this.activeFile.nPage = this.tabBox.nPageno || 0;
      this.sendMessageToIframe({ event: 'REALTIME-CHANGE-PDF', data: this.activeFile })
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['tabBox']) {

      this.changePdfFile(this.tabBox)
      return;
    }
    // if (changes['nPage']) {
    //   this.tabBox = { cTab: null, nPageno: this.nPage };
    //   this.updatePath();
    // } else {
    this.activeFile = null;
    this.activeFiledata();
    // }
  }

  async activeFiledata() {
    console.warn('ACTIVE PATH CHANGE');
    var ind = this.viewlist.findIndex(e => e["active"]);
    if (ind > -1) {
    
      try {
        this.currentFiletype = this.viewlist[ind];
        if (this.tabBox && this.tabBox.cTab) {
          this.activeFile = await this.myfileS.getFiledata({ cTab: this.tabBox.cTab, nCaseid: this.nCaseid });
        } else {
          var mdl: filedataReq = { nBundledetailid: this.viewlist[ind].nBundledetailid };
          const res: filedataRes = await this.myfileS.getFiledata(mdl);
          // res.cPath = res.cPath + '?id=' + Math.random();
          res.nBundledetailid = this.viewlist[ind].nBundledetailid;
          this.activeFile = res;
        }



        this.updatePath();
        this.cdr.detectChanges();

      } catch (error) {
        // this.closeRealtimePdf();
      }

    }

  }

  changeFile(el, x) {
    var ind = this.viewlist.findIndex(e => e["active"]);
    if (ind > -1) {
      this.viewlist[ind]["active"] = false;
    }
    this.viewlist[el]["active"] = true;
    this.currentFiletype = x;
    this.nonsupport = this.isActiveFileSupported();
    this.activeFiledata();
    this.hidemsg = true;
  }


  closeView(i) {
    this.viewlist.splice(i, 1);
    this.activeFile = null;
    if (this.viewlist.length) {
      this.activeFile = this.viewlist[0];
      this.viewlist[0]["active"] = true;
      this.currentFiletype = this.viewlist[0];
    }
    this.hidemsg = true;
  }

  ClsoePreview() {
    this.OnEvent.emit({ event: 'CLOSE', data: null });
  }

  openmodal(flag) {
    if (flag) {
      this.changePreview.emit(flag);
    }
  }


  OnSelected(e: any) {

    this.OnFileSelected.emit(e);

    if (this.isMyfile) {
      let ids = e.map(x => [x['nBundledetailid'], 1])
      window.open(`${location.origin}/individual/doc/${encodeURIComponent(JSON.stringify([ids, this.nCaseid]))}`);
    }

  }


  updatePath() {
    if (this.activeFile) {
      let page = 1;
      if (this.tabBox) {
        page = this.tabBox.nPageno || 1;
      }
      const path: any = this.cf.senitizeUrl(this.activeFile.cPath, this.activeFile.nBundledetailid, this.nCaseid, false, this.isLink, page, this.isRealtime,
        null, null, null, null, null, null, null, this.isMyfile);
      if (path != this.cPath) {
        this.cPath = path
      }
    } else {
      // const path: any = this.cf.notfoundUrl();
      // this.cPath = path;
    }
    if (this.cPath) {
      this.isLoaded = true;
    }
    this.cdr.detectChanges();
  }


  addDataToSelectedDocs(data: any) {
    data.jLinktype = { type: (data.mode ? data.mode : 'F'), start: (data.start ? data.start : 0), end: (data.end ? data.end : 0), pages: ((data.pages ? [...new Set(data.pages)] : [])) };
    const ind = this.selectedDocuments.findIndex(a => a.nBundledetailid == data.nBundledetailid && (a.mode != 'P' ? a.mode == data.mode : (a.mode == data.mode && a.start == data.start && a.end == data.end)))
    if (ind == -1) {
      this.selectedDocuments.unshift(data);
    } else {
      this.selectedDocuments[ind] = { ...this.selectedDocuments[ind], ...data };
    }

  }
  openIndividual(x) {
    const url =  this.urlService.pdfLoadUrl.split(':')[1].replace('//', '');
    window.open(`https://${url}/individual/doc/${encodeURIComponent(JSON.stringify([[[x.nBundledetailid, 1]], this.nCaseid]))}`);
  }


  closeRealtimePdf() {
    let e: any = { event: 'CLOSE_REALTIME', data: null };
    this.OnEvent.emit(e);
  }



  isActiveFileSupported(): boolean {
    if (!this.activeFile || !this.activeFile.cFiletype) {
      return false;
    }

    const fileType = this.activeFile.cFiletype.trim().toLowerCase();
    // console.log('File type:', fileType);

    // Define a set of supported file extensions
    const supportedExtensions = new Set([
      'jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg',
      'mp4', 'avi', 'mov', 'wmv', 'flv',
      'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'msg'
    ]);

    // Check if the file extension is in the set of supported extensions
    const isSupported = supportedExtensions.has(fileType);
    // console.log('Is file type supported?', isSupported);

    return isSupported;
  }

  downloadFile1(cPath, filename) {
    var cFilename = filename //!bundles.length && files.length && filelist.length == 1 ? filelist[0]["cFilename"] : this.activebundle.cFolder;
    const parts = cPath.split('.');
    var extension = parts[parts.length - 1];
    cFilename = filename.toString();
    cFilename = this.ensureFileExtension(cFilename, ('.' + extension.toLocaleUpperCase()));
    var mdl: any = { "jFiles": { nBundledetailid: [] } };
    mdl["jFiles"]["nBundledetailid"] = [this.activeFile.nBundledetailid]
    mdl.jFiles = JSON.stringify(mdl.jFiles);
    // this.api.download_file(mdl, cFilename);
    // (click)="downloadFile(mfs.current_pdf.cPath)"  *ngIf="!api.isPDF(mfs.current_pdf)"
    // window.open(environment.cloudurl + '/' + cPath);
    // return this.api.http.get(`${environment.cloudurl}/${cPath}`, { responseType: 'blob' });
  }



  async downloadFile(cPath: string, filenames: string) {
    /* try {
       const groupFileName = this.createGroupFileName(filenames);
       const sanitizedFileName = this.sanitizeFileName(groupFileName);
       const shortenedFileName = this.shortenFileName(sanitizedFileName, 50, cPath);
 
       const downloadUrl = `${environment.downloadservice}/download?cPath=${encodeURIComponent(cPath)}&cFilename=${encodeURIComponent(shortenedFileName)}`;
 
       const link = document.createElement('a');
       link.href = downloadUrl;
 
       // Add event listeners
       link.addEventListener('load', () => {
         console.log('Download started');
       });
 
       link.addEventListener('error', () => {
         console.error('Error downloading file');
       });
 
       // Append the link to the body
       document.body.appendChild(link);
 
       // Trigger the click event
       link.click();
 
       // Remove the link from the document
       document.body.removeChild(link);
 
     } catch (error) {
       console.error('Error initiating download:', error);
     }*/
  }

  createGroupFileName(fileNames: string): string {
    const fileList = fileNames.split(',').map(f => f.trim());

    if (fileList.length === 1) {
      return fileList[0];
    }

    const firstFileName = fileList[0].split('.')[0]; // Get name without extension
    const extension = fileList[0].split('.').pop();
    const otherFilesCount = fileList.length - 1;

    let groupName = `${firstFileName} and ${otherFilesCount} other${otherFilesCount > 1 ? 's' : ''}`;

    // Shorten if too long
    if (groupName.length > 50) {
      groupName = groupName.substring(0, 47) + '...';
    }

    return `${groupName}.${extension}`;
  }

  sanitizeFileName(fileName: string): string {
    // Remove or replace characters that might cause issues
    return fileName.replace(/[<>:"/\\|?*]/g, '_');
  }

  ensureFileExtension(path: string, extension: string): string {
    if (!(path.toLocaleUpperCase()).endsWith(extension)) {
      return path + extension;
    }
    return path;
  }


  shortenFileName(fileName: string, maxLength: number = 50, cPath: string): string {
    let extension = fileName.split('.').pop();

    // If no extension in filename, extract it from the path
    const pathExtension = cPath.split('.').pop();
    if (fileName.toUpperCase() != pathExtension.toUpperCase()) {
      if (pathExtension) {
        extension = pathExtension;
        fileName += `.${extension}`;
      }
    } else if (fileName.split('.').length > 2) {
      // Handle multiple dots in filename
      const parts = fileName.split('.');
      extension = parts.pop();
      fileName = parts.join('.') + '.' + extension;
    } else {
      extension = extension || '';
    }

    const name = fileName.substring(0, fileName.length - extension.length - 1);

    if (name.length + extension.length + 1 <= maxLength) {
      return fileName;
    }

    const halfMax = Math.floor((maxLength - extension.length - 4) / 2);
    const firstHalf = name.slice(0, halfMax);
    const secondHalf = name.slice(-halfMax);

    return `${firstHalf}...${secondHalf}.${extension}`;
  }

  openInOfficeViewer(url: string): void {

    if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(this.activeFile.cPath.toLowerCase())) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${this.urlService.pdfLoadUrl}${encodeURIComponent(url)}`;
      window.open(officeViewerUrl, '_blank');
    } else {
      window.open(this.urlService.pdfLoadUrl + url, '_blank');
    }
  }


  sendMessageToIframe(data: any) {

    const iframeElement = this.embeddedIframes.find((iframeRef: ElementRef) => {
      return iframeRef.nativeElement.id === `embedded`;
    });
    if (iframeElement) {
      const iframe = iframeElement.nativeElement;
      iframe.contentWindow.postMessage(data, '*'); // Replace '*' with the specific origin if needed
    }
  }

  async directlink() {

    try {
      let selectedFiles: any[] = [];
      selectedFiles.push(this.selectedDocuments[0]);
      if (!selectedFiles.length) return;
      this.OnFileSelected.emit(selectedFiles);
    } catch (error) {
    }
  }

}


