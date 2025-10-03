import { Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PdfDataService } from '../../service/pdf-data.service';
import { ViewerModule } from '../../modules/shared/imageShared.moduls';
import { Email, EmailRes } from '../../interfaces/pdf.interface';
import { EmailService } from '../../service/email.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { ImgComponent } from '../../../shared/components/img/img.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UrlService } from '../../../services/url.service';

@Component({
  selector: 'doc-viewer',
  standalone: true,
  imports: [CommonModule, ViewerModule, IconComponent, ImgComponent],
  templateUrl: './doc-viewer.component.html',
  styleUrl: './doc-viewer.component.scss'
})
export class DocViewerComponent {
  sanitizedBody: SafeHtml;
  // docUrl: string;
  isSmall_pdf: boolean;
  @Input() path: string;
  @Input() nBundledetailid: string;
  @Input() filetype: string;
  @Input() isMyfile: boolean;
  // url = environment.documentStorage;
  downloadpath = '';// environment.downloadpath;
  newPath: string;
  docUrl: string;
  @Output() onEvent = new EventEmitter<any>();
  isLoading = true;
  email: Email = null





  constructor(private pdfDataService: PdfDataService, private emailservice: EmailService, private sanitizer: DomSanitizer,private urlService:UrlService) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.


    this.docUrl = this.urlService.pdfLoadUrl + this.downloadpath + this.path;
    console.log('docUrl', this.docUrl)
    if (this.path.toUpperCase().includes('.MP3')) {
      this.filetype = 'M'
      this.isLoading = false;
    } else if (/\.(jpeg|jpg|png|gif|bmp|svg)$/i.test(this.path.toLowerCase())) {
      this.filetype = 'I';
      this.isLoading = false;
    } else if (/\.(mp4|avi|mov|wmv|flv)$/i.test(this.path.toLowerCase())) {
      this.filetype = 'V';
      this.isLoading = false;
    } else if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(this.path.toLowerCase())) {
      this.filetype = 'D';
      setTimeout(() => {
        let iframe: any = document.getElementById("excel-viewer");
        iframe.src = "https://view.officeapps.live.com/op/embed.aspx?src=" + this.docUrl;
        this.isLoading = false;
      }, 10);
      //  new ExcelViewer("#excel-view",'https://etabella.com/doc/case36/dc_101689935882720.xlsx');
    } else if (/\.(msg)$/i.test(this.path.toLowerCase())) {
      this.getEmail();
    }
  }

  async getEmail() {
    let res: EmailRes = await this.emailservice.getEmailparser(this.path, this.nBundledetailid)
    if (res && res.msg == 1) {
      this.email = res.email;
      this.sanitizedEmailbody()
    }
    this.filetype = 'E';
    this.isLoading = false;
  }


  async downloadAttachment(id: number, filename: string) {
    const res: Blob = await this.emailservice.getAttechment(this.path, id)
    const url = window.URL.createObjectURL(res);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }


  onButtonClick(event: any) {
    // Stop the event propagation to prevent it from reaching the container's dblclick
    event.stopPropagation();
    return true; // Return true to allow the default button action to proceed
  }

  onImageDoubleClick(event: MouseEvent) {
    event.preventDefault(); // Prevent the default fullscreen behavior
    const target = event.target as HTMLElement;

    // Check if the double-clicked element is an image
    if (target.tagName.toLowerCase() === 'img' || target.tagName.toLowerCase() === 'video') {
      const imageUrl = target.getAttribute('src');
      if (imageUrl) {
        window.open(imageUrl, '_blank');
      }
    }
  }


  getFileExtension(fileName: string): string {
    if (!fileName || fileName.lastIndexOf('.') === -1) {
      return 'other'; // Return '.other' if there is no extension
    }

    const extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(); // Extract and normalize the extension
    const validExtensions = ['doc', 'docx', 'jpeg', 'jpg', 'mp3', 'msg', 'pdf', 'png', 'ppt', 'pptx', 'tiff', 'xls', 'xlsm', 'xlsx'];

    return validExtensions.includes(extension) ? extension.toUpperCase() : 'other'; // Return the extension or '.other'
  }

  newtab(attachemnt?, index?) {
    if (!attachemnt) {
      this.onEvent.emit({ event: 'OPEN-INDIVIDUAL' });
    } else {
      // if (!(/\.(pdf)$/i.test(attachemnt.filename.toLowerCase())))
      this.onEvent.emit({ event: 'OPEN-ATTACHMENT', data: { nBundledetailid: index == 0 ? -1 : index - (index + 1), cFilename: attachemnt.filename, cPath: attachemnt.cPath } });
    }

  }


  isShowView(path) {
    var flg = false;
    if (path && path) {
      if (/\.(jpeg|jpg|png|gif|bmp|svg|doc|docx|xls|xlsx|xlsm|ppt|pptx|msg|pdf)$/i.test(path.toLowerCase())) {
        flg = true;
      }
    }
    return flg
  }


  OnEventOfImg(event: any) {
    this.onEvent.emit({ event: 'OPEN-INDIVIDUAL', data: { nBundledetailid: this.nBundledetailid } });
  }

  sanitizedEmailbody() {
    this.sanitizedBody = this.sanitizer.bypassSecurityTrustHtml(this.email.body.replaceAll('\n', ''));
  }

  closeRealtimePdf() {
    this.onEvent.emit({ event: 'CLOSE_REALTIME', data: null });
  }

}
