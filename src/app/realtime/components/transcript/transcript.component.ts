import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { sectionDetailMDL, selectedfileMDL, uploadingFilesMDL } from '../../../core/interfaces/upload.interface';
import { FileSelectionService } from '../../../core/services/upload/file-selection/file-selection.service';
import { UploadService } from '../../../core/services/upload/upload.service';
import { FileStorageService } from '../../../core/services/upload/file-storage/file-storage.service';
import { HttpClientModule } from '@angular/common/http';
import { UploadManagementService } from '../../../core/services/upload/upload-management/upload-management.service';
import { CheckDuplicacyService } from '../../../core/services/upload/check-duplicacy/check-duplicacy.service';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';
import { Subscription } from 'rxjs';
import { CommunicationService } from '../../../shared/services/communication/communication.service';
import { SessionService } from '../../../shared/services/session.service';
import { SocketService } from '../../../shared/services/socket.service';
import { UpldService } from '../../../services/upld.service';

export interface CASE_LIST {
  nCaseid?: number;
  cCasename?: string;
  nSectionid?: number;
  dUploadDt?: string;
  isexpand?: boolean;
  cStatus?: string;
  nProgress?: number;
  files?: any;
};

@Component({
  selector: 'app-transcript',
  standalone: true,
  providers: [UploadService, FileSelectionService, FileStorageService, UploadManagementService, CheckDuplicacyService],
  imports: [CommonModule, IconComponent, BadgeComponent, ButtonComponent, MatTooltipModule, NgxFileDropModule, HttpClientModule],
  templateUrl: './transcript.component.html',
  styleUrl: './transcript.component.scss'
})



export class TranscriptComponent {
  currentSession: any = {};
  current_case: CASE_LIST = { nCaseid: 0, cCasename: '', nSectionid: 0, dUploadDt: '', isexpand: false, cStatus: '', nProgress: 0, files: [] };
  isDragging: boolean = false;
  transcript: any = [
    {
      'case': 'MEREINE CO. LTD vs CHINA GEZHOUBA GROUP CO. LTD - ICC 26800/MDY/OSI  | Case ID',
      'date': 'DD/MM/YYY [00:00:00]',
    },
    {
      'case': 'Heaney Graham vs O’Conner Inc. | Case ID',
      'date': 'DD/MM/YYY [00:00:00]'
    },
    {
      'case': 'MEREINE CO. LTD v CHINA GEZHOUBA GROUP CO. LTD - ICC 26800/MDY/OSI',
      'date': 'DD/MM/YYY [00:00:00]'
    },
  ]

  @Output() dataRecieved = new EventEmitter<any>();


  private evsubscription: Subscription;
  private evsubscription_socket: Subscription;

  finalUpload: any = [];


  current_job: uploadingFilesMDL = { session: null, files: [] };
  caselist: CASE_LIST[] = [];

  isReplace: boolean = false;
  replaceIdentifier: string;




  selectedFile: File | null = null;
  uploadedFilePath: string | null = null;
  constructor(private sessionS: SessionService, public us: UploadService, private selection: FileSelectionService, private store: FileStorageService, private checkfile: CheckDuplicacyService,
    private uploadManage: UploadManagementService, private cs: CommunicationService, private tst: TostbarService, private crd: ChangeDetectorRef,
    private checkDup: CheckDuplicacyService, private ss: SocketService, private uploadService: UpldService) {

  }



  ngOnInit(): void {
    this.getCaseList();
    this.current_case.nCaseid = this.store.nCaseid ? this.store.nCaseid : 0;
    this.current_case.nSectionid = this.store.nSectionid ? this.store.nSectionid : 0;

    this.evsubscription = this.cs.functionCalled$.subscribe(async (data: any) => { //{ event: string, files: fileUploadMDL[] }
      console.log('call data', data);
      if (data && data.event == 'UPLOAD-PROGRESS') {

        this.caselist.forEach(e => {
          if (e.files) {

            let obj = e.files.find(a => a.identifier == data.data.identifier);
            if (obj) {
              obj.cUploadstatus = 'U';
              obj.nProgress = data.data.nProgress
              if (obj.nProgress >= 100) {
                if (obj.cUploadstatus != 'C') {
                  obj.cUploadstatus = 'C';

                  this.uploadComplete(obj);

                }


              }
            }
          }
        });


        /* this.caselist.forEach(element => {
           if (element.files && element.files.length) {
             let obj = element.files.find(a => a.identifier == data.data.identifier && a.cStatus != 'PSD')
             if (obj) {
               obj.nProgress = data.data.nProgress;
               obj.cStatus = data.data.nProgress >= 100 ? 'T' : 'I';
               this.current_case = element
             }
           }
         });*/

      }
    });


    this.evsubscription_socket = this.ss.getUploades().subscribe(data => {
      console.log('uploades', data);
      if (data && data.event == 'FILE-INSERT-COMPLETE') {
        /* this.caselist.forEach(element => {
           if (element.files && element.files.length) {
             let obj = element.files.find(a => a.identifier == data.data.identifier && a.cStatus != 'PSD')
             if (obj) {
               obj.nBundledetailid = data.data.nBundledetailid;
             }
           }
         });*/
      }
    })
  }


  async uploadComplete(obj) {
    debugger;
    obj.isUploaded = true;
    obj.isTranscript = false;
    const nUserid = window.localStorage.getItem('nUserid') ? (window.localStorage.getItem('nUserid')) : null;
    await this.sessionS.transsciptUpdate(obj.nSesid, nUserid, this.current_case.nCaseid, 'C', obj.cProtocol);
  }


  async publishComplete(obj, x) {
    debugger;
    delete obj.cUploadstatus;
    const nUserid = window.localStorage.getItem('nUserid') ? (window.localStorage.getItem('nUserid')) : null;
    await this.sessionS.transsciptUpdate(obj.nSesid, nUserid, x.nCaseid, 'P', obj.cProtocol);
    obj.isUploaded = true;
    obj.isTranscript = true;
    // setTimeout(() => {
    const data = await this.sessionS.transcriptSync({ nCaseid: x.nCaseid, nSesid: obj.nSesid, nUserid: x.nUserid });
    // }, 3000);
  }

  /*
    updateId(x) {
      this.isReplace = false;
      this.current_case = x;
      this.store.nCaseid = x.nCaseid;
      this.store.nSectionid = x.nSectionid;
    }*/

  updateIds(x, y) {
    debugger;


    this.isReplace = false;
    this.current_case = x;
    this.store.nCaseid = x.nCaseid;
    this.store.nSectionid = x.nSectionid;
    this.currentSession = y;



    document.getElementById('UploadData').click()

  }
  async onFileDrop(event: NgxFileDropEntry[]) {

    this.isDragging = true;
    let listData: selectedfileMDL[] = await this.selection.fetchFiles(event);

    console.log('listData', listData);

    this.isDragging = false;
    // console.log('listData', JSON.stringify(listData));
    if (listData.length) {
      this.store.setSelectedFileStorage(listData)
      // this.dataRecieved.emit('DATA-RECIEVED');

      this.finalUpload = await this.checkfile.uploadStructure(this.currentSession.nSesid, 'A');


      this.currentSession.identifier = this.finalUpload[0]['identifier'];
      this.currentSession.cUploadstatus = 'U';
      this.currentSession.nProgress = 0

      // Object.assign(this.currentSession,this.finalUpload[0])
      this.uploadManage.startUpload(this.finalUpload, this.current_case);
      return;


      console.log('finalUpload', this.finalUpload);
      // this.checkDup.checkDuplicacy().then(async (res) => {
      //   let duplicated = await this.checkDup.isDuplicated(res);
      //   if (duplicated.length) {

      //     this.store.setSelectedFileStorage([])
      //     this.tst.openSnackBar('Duplicate file found', 'E')
      //     // this.tst.openSnackBar('Duplicate file found', 'E')
      //   } else {
      this.uploadFiles();
      //   }
      // })
    }
  }

  uploadFiles() {

    if (this.finalUpload.length) {
      // this.currentSession.push()
      // this.finalUpload.map(e => e.date = new Date());

      this.currentSession
      var file = this.currentSession

      this.uploadManage.startUpload(this.finalUpload, this.current_case);
      this.currentSession = Object.assign(this.currentSession, this.finalUpload[0]);
      // this.current_case.files = [...this.current_case.files, ...this.finalUpload];

      /* if (this.current_case) {
         if (!this.current_case.files) {
           this.current_case.files = [];
         }
        
         if (this.isReplace && this.replaceIdentifier) {
           var file = this.current_case.files.filter(a => a.identifier == this.replaceIdentifier);
           var newFile = this.finalUpload[this.finalUpload.length - 1];
           file.map(a => { a.filetype = newFile.filetype; a.cStatus = newFile.cStatus; a.nProgress = 0; a.date = newFile.date; a.identifier = newFile.identifier; a.cFilename = newFile.cFilename; a.name = newFile.name; a.file = newFile.file; });
           this.isReplace = false;
           this.replaceIdentifier = null;
           newFile.nBundledetailid = file[0].nBundledetailid;
           this.uploadManage.startUpload(this.finalUpload);
         } else {
           this.uploadManage.startUpload(this.finalUpload);
           this.current_case.files = [...this.current_case.files, ...this.finalUpload];
         }
       }*/
    } else {
      this.tst.openSnackBar('No file for upload', 'E')
      // upload failed
    }
  }


  async getCaseList() {
    let list = await this.sessionS.getCaseList(1);
    this.caselist = list;
  }

  async getTranscriptFiles(x) {
    if (x.files && x.files.length) return;
    let list = await this.sessionS.getCaseFiles(x.nCaseid);
    x["files"] = x["files"] ? x["files"] : [];
    x.files = list;
  }

  async getCaseSessions(x) {

    if (x.files && x.files.length) return;
    let list = await this.sessionS.getPreviousSessions(x.nCaseid);
    x.files = [];
    x.files = list;
  }


  downloadFile(x, file) {
    if ((file.cPath == null || file.cPath == '' || file.cPath == undefined) && file.name) {
      file.cPath = 'doc/case' + x.nCaseid.toString() + '/' + file.name + '.' + file.filetype;
    }

    // let url = 'D:/apiportal/etabella-nestjs/assets/' + file.cPath;

    // const link = document.createElement('a');
    // link.setAttribute('target', '_blank');
    // link.setAttribute('href', url);
    // link.setAttribute('download', url);
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    this.sessionS.downloadFile(file.cPath).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.cFilename; // You can set the default file name here
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, error => {
      console.error('Download error:', error);
    });

    // this.sessionS.downloadFile(file);
  }

  replaceFile(x, file) {
    this.isReplace = true;
    this.replaceIdentifier = file.identifier;

    this.current_case = x;
    this.store.nCaseid = x.nCaseid;
    this.store.nSectionid = x.nSectionid;
    // this.sessionS.replaceFile(file);
  }

  async publishFile(file) {
    if (file.cStatus != 'T') return;
    let res = await this.sessionS.publishFile(file.nBundledetailid, 'C');
    if (res) {
      file.cStatus = 'C';
    }
  }
  //////////////////////////////////////////// NEW UPLOAD
  async onFileSelected(event: Event) {
    debugger;
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      try {

        this.currentSession.cUploadstatus = 'U';
        await this.uploadFile();
        this.tst.openSnackBar('Upload successful')


        this.currentSession.cUploadstatus = 'C';
        this.currentSession.nProgress = 100;
        this.uploadComplete(this.currentSession);


      } catch (error) {
        this.currentSession.cUploadstatus = 'F';

        this.tst.openSnackBar('Upload Failed', 'E')
      }
    }
  }

  async uploadFile(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      debugger;
      if (this.selectedFile) {
        this.store.uploading = true;
        this.uploadService.uploadFile(this.selectedFile, `s_${this.currentSession.nSesid}`, String(this.store.nCaseid)).subscribe({
          next: (response) => {
            this.store.uploading = false;
            resolve(true);
            this.uploadedFilePath = response.path;
          },
          error: (err) => {
            resolve(false);
            this.store.uploading = false;
            console.error(err)
          },
        });
      }
    })

  }

}