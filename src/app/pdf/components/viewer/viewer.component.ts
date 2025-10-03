import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocInfo, highlightModeType, linkExplorer, linkExplorerType } from '../../interfaces/pdf.interface';
import { PdfDataService } from '../../service/pdf-data.service';
import { DocViewerComponent } from '../doc-viewer/doc-viewer.component';
import { environment } from '../../../../environments/environment';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { Subject } from 'rxjs';
import { PdfComponent } from '../pdf/pdf.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { NgClass } from '@angular/common';
@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [PdfComponent, DocViewerComponent,IconComponent,NgClass],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class ViewerComponent implements OnInit {
  path: string | null = null;
  docInfo: DocInfo | null = {} as DocInfo;
  nCaseid: string;
  isFullmode: boolean = false;
  isLink: highlightModeType = null;
  filetype: string = '';
  downloadPath: string = `${environment.cloudUrl}${environment.downloadpath}`;
  changingValue: Subject<any> = new Subject();

  nRFSid: number = 0;
  nRDocid: number = 0;
  nRWebid: number = 0;

  linkExplorerMode: linkExplorer = null;
  linkExplorerType: linkExplorerType = 'F';
  compareMode: boolean = false;
  compareIndex: number = 0;
  isMyfile: boolean = false;
  nPageno:number;
  @HostListener('window:message', ['$event'])
  onPdf = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    // 

    if (event.data) {
      if (event.data.event == 'COMPARE_INDEX') {

        this.compareIndex = event.data.data;
      } else if (event.data.event == 'LINK-EXPLORER-TYPE') {
        this.linkExplorerType = event.data.data;
      } else if (event.data.event == 'REALTIME-CHANGE-PDF') {
        this.changePdf(event.data.data);
      }

      this.changingValue.next(event.data);
    }
  }

  constructor(private route: ActivatedRoute, private pdfData: PdfDataService, private tost: TostbarService) {
    const params: any = this.route.snapshot.params;
    if (params) {
      try {
        this.docInfo.nBundledetailid = String(this.route.snapshot.queryParams["nBundledetailid"]);
        this.nCaseid = String(this.route.snapshot.queryParams["nCaseid"]);
        this.docInfo.nPageno = Number(this.route.snapshot.queryParams["page"] || 1);
        this.docInfo.isRealtime = this.route.snapshot.queryParams["isRealtime"] == 'Y' ? true : false;
        this.isMyfile = this.route.snapshot.queryParams["isMyfile"] == 'true' ? true : false;
      } catch (error) {
      }

      try {
        const isFullmode = this.route.snapshot.queryParams["fullmode"];
        if (isFullmode == 'Y') {
          this.isFullmode = true;
        }
        const isLink = this.route.snapshot.queryParams["isLink"];
        if (isLink != 'N') {
          this.isLink = isLink;
        }
        const compareMode = this.route.snapshot.queryParams["compareMode"];
        if (compareMode == 'Y') {
          this.compareMode = true;
          this.compareIndex = Number(this.route.snapshot.queryParams["compareIndex"])
        }


        const linkexplorerMode = this.route.snapshot.queryParams["linkExplorerMode"];
        if (linkexplorerMode) {
          this.linkExplorerMode = linkexplorerMode
          this.linkExplorerType = this.route.snapshot.queryParams["linkExplorerType"] || 'F';
        }


        const nRFSid = this.route.snapshot.queryParams["nRFSid"];
        if (nRFSid) {
          this.nRFSid = Number(nRFSid);
        }

        const nRDocid = this.route.snapshot.queryParams["nRDocid"];
        if (nRDocid) {
          this.nRDocid = Number(nRDocid);
        }

        const nRWebid = this.route.snapshot.queryParams["nRWebid"];
        if (nRWebid) {
          this.nRWebid = Number(nRWebid);
        }
      } catch (error) {

      }
      this.path = atob(params["id"]);
      console.log(this.path)
      this.filetype = this.getFileType(this.path);
      // window["nBundledetailid"] = this.docInfo.nBundledetailid;
    }
  }

  async changePdf(data) {
    this.docInfo.nBundledetailid = data.nBundledetailid;
    this.path = data.cPath
    this.nPageno = data.nPage;
    this.docInfo.nPageno = data.nPage;
    this.filetype = this.getFileType(this.path);
    this.ngOnInit();
  }


  async ngOnInit() {
    const data = await this.pdfData.fetchDocInfo(this.docInfo.nBundledetailid);
    this.docInfo = Object.assign(this.docInfo, data);
  }

  sendMessageToParent(event: any) {
    try {

      const message = { identity: this.docInfo.nBundledetailid, message: event };
      window.parent.postMessage(message, window.location.origin);
    } catch (error) {
      console.error('Failed to send data to parent', error);
    }
  }

  pdfEvent(e: any) {
    if (e.event == 'OPEN-ATTACHMENT') {
      const message = { identity: e.data.nBundledetailid, message: e };
      window.parent.postMessage(message, window.location.origin);
    } else {
      this.sendMessageToParent(e);
    }
  }

  // getFileType() {
  //   const extension = this.path.split('.').pop();
  //   return extension ? extension.toLowerCase() : '';
  // }


  downloadURI(uri, name) {
    const fileName = `${this.downloadPath}${uri}?id:${Math.random()}`; // The file name you want to download
    this.pdfData.downloadFile(fileName).subscribe(
      (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = name;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      (error) => {
        console.error('Download error:', error);
        this.tost.error('Failed to download');
      }
    );
  }


  getFileType(path: string): string {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    const pdfExtensions = ['pdf'];
    const imageExtensions = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'svg'];
    const documentExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const emailExtensions = ['msg'];

    const ext = path.split('.').pop().toLowerCase();

    if (videoExtensions.includes(ext)) {
      return 'video';
    } else if (imageExtensions.includes(ext)) {
      return 'image';
    } else if (documentExtensions.includes(ext)) {
      return 'document';
    } else if (emailExtensions.includes(ext)) {
      return 'msg';
    } else if (pdfExtensions.includes(ext)) {
      return 'pdf';
    } else {
      return 'unknown';
    }
  }

  closeRealtimePdf(){
    this.sendMessageToParent({ event: 'CLOSE_REALTIME', data: null });
  }

}
