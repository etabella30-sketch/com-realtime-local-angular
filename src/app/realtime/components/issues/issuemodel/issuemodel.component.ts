import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, Optional, Output, ViewChild } from '@angular/core';
import { IssueListComponent } from '../issue-list/issue-list.component';
import { IssueService } from '../../../services/issue/issue.service';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MatMenuModule } from '@angular/material/menu';
import { Annotation, param_highLightIssueIds, param_lastIssue } from '../../../models/annotation.interface';
import { AnnotationService } from '../../../services/annotation/annotation.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TostbarService } from '../../../../core/services/tost/tostbar.service';
// import { FeedDisplayService } from '../../../services/feed-display.service';
import { issueDetailMdL, sessionDataMDL } from '../../../models/issue.interface';
import { CommunicationService } from '../../../../shared/services/communication/communication.service';
import { CreateissueComponent } from '../createissue/createissue.component';
import { SecureStorageService } from '../../../../core/services/storage/secure-storage.service';
import { Subject } from 'rxjs';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { IssuedetailComponent } from '../issuedetail/issuedetail.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnnotVersionComponent } from '../../annot-version/annot-version.component';
import { FeedDisplayService } from '../../../services/feed-display.service';

@Component({
  selector: 'app-issuemodel',
  standalone: true,
  imports: [CommonModule, FormsModule, IssueListComponent, HttpClientModule, MatCheckboxModule,
    MatFormFieldModule, ButtonComponent, MatTooltipModule, MatInputModule, MatMenuModule,
    IconComponent, ToastComponent, IssuedetailComponent, AnnotVersionComponent],
  providers: [IssueService],
  templateUrl: './issuemodel.component.html',
  styleUrl: './issuemodel.component.scss'
})
export class IssuemodelComponent {
  @ViewChild('usernote') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('textnote') textarea1!: ElementRef<HTMLTextAreaElement>;

  @Input() ishilight: boolean = false;
  @Input() isIssuemdl: boolean = false;
  @Input() isToolbar: boolean = false;
  modelType: string = 'N'; // E = edit , V = veiw , N = new
  isNote: boolean = true;
  issueopen: boolean = false;
  issuedetail: boolean = false;
  showalert: boolean = true;
  currentdetail: any = {};
  cNote: string = '';
  cUNote: string;
  cUNote_editable: string = '';
  cPermission: string = 'N'; // N = insert , U = update , D = delete
  selectedIssues = [];
  annotations: Annotation = null;
  // nSessionId: number = 57;
  // nCaseid: number = 22;
  // nUserid: number = 3;
  isLoading: boolean = false;
  issueDetail: issueDetailMdL = {} as issueDetailMdL;
  nUserid: any;
  nIDid: string = null;
  @Input() current_session: sessionDataMDL = {} as sessionDataMDL;
  @Input() isTrasnscript: string = 'N';
  changingValue: Subject<boolean> = new Subject();
  previousIssues: { cClr: string }[] = [];
  @Output() dialogEvent = new EventEmitter<any>();
  private highLightIssueIds: param_highLightIssueIds[] = [];
  private lastIssue: param_lastIssue = { nIid: null, cColor: '' };


  assignedIssuesToHighlight: any[] = [];

  issueFormDilog: any;
  isVersionBox: boolean = false;
  constructor(private annotService: AnnotationService,
    private fds: FeedDisplayService,
    private cdr: ChangeDetectorRef, private issueService: IssueService,
    private cm: CommunicationService, private tost: TostbarService,
    @Optional() private dialogRef: MatDialogRef<IssuemodelComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog, private store: SecureStorageService) {

    this.annotations = this.annotService.getTempAnnotation();

    // this.cNote = this.annotations?.text || '';
    this.cUNote_editable = 'Note : '
    // 
    //[{nid,color,dt}]
  }

  async ngOnInit() {

    debugger;
    this.ishilight;
    this.isIssuemdl;

    this.setupDefault()

    // this.dialogEvent.emit({ message: 'Hello from Dialog', source: this.data.source });
    this.nUserid = await this.store.getUserId();
    if (this.data)
      this.current_session = this.data.current_session;
    if (!this.ishilight && !this.isIssuemdl) {
      this.selectedIssues = [];
    }

    debugger;
    if (!this.current_session.totaIssues && !this.ishilight && !this.isToolbar && !this.data.current_session) {
      this.isseuForm();
    }
    if (this.data && this.data.annotData && this.data.annotData.nIDid) {

      console.log(this.data);

      this.initDetail(this.data.annotData.nIDid)

    } else {
      try {

        if (this.data.annotData.data.issues) {


          this.assignedIssuesToHighlight = this.data.annotData.data.issues;
        }
      } catch (error) {
        this.assignedIssuesToHighlight = [];
      }
      this.isLoading = false;
    }
    this.cdr.detectChanges();
    if (this.ishilight) {
      this.cPermission = 'E';
    }

    if (this.isIssuemdl) {

    }
  }

  setupDefault() {

    this.highLightIssueIds = [];
    if (this.ishilight) {
      this.highLightIssueIds = this.annotService.getHighLightIssueIds();
      this.lastIssue = this.annotService.getLastIssue();
    }

    if (this.isIssuemdl) {
      this.highLightIssueIds = this.annotService.getAnnotsIssueIds();
    }



    if (this.highLightIssueIds)
      this.selectedIssues = [...this.highLightIssueIds]
  }

  async initDetail(id, isEdit?) {

    this.nIDid = id;
    try {
      this.issueDetail = await this.issueService.fetchIssueDetail(id);

      this.selectedIssues = [...this.issueDetail.cIid]
      // this.editIssueDetail()

      if (!this.issueDetail?.cNote) {
        this.editIssueDetail();
      }

    } catch (error) {
      console.error(error);
    }
    this.isLoading = false;

    if (isEdit) {
      this.editIssueDetail();
    }

    try {
      setTimeout(() => {
        if (this.textarea?.nativeElement)
          this.textarea.nativeElement.focus();
        let div: any = this.textarea.nativeElement.parentNode;
        div.scrollTop = div.scrollHeight;
      }, 500);
    } catch (error) {

    }

    this.cdr.detectChanges();
  }


  enableMode(mode) {
    this.modelType = mode;
  }

  reInit(x, flg) {

    if (flg == 'H') {
      this.ishilight = true;
    } else {
      this.ishilight = false;
    }
    if (!this.data.annotData) {
      this.data.annotData = {};
    }
    this.data.annotData = x;
    this.isLoading = true;
    this.ngOnInit();
    this.cdr.detectChanges();
  }


  async updateDefaultHighlightIssueIds(nlastId) {

    //let validIssues = this.selectedIssues.filter(issue => issue.dt);

    // Find nIid where dt is maximum among valid issues
    // let maxDtIssue = this.selectedIssues.reduce((prev, current) =>
    //   (new Date(current.dt) > new Date(prev.dt)) ? current : prev
    // );
    if (!this.selectedIssues?.length) {
      return;
    }
    let maxDtIssue = this.selectedIssues.find(a => a.nIid == nlastId) //this.selectedIssues[this.selectedIssues.length - 1];
    //let maxDtIssue = this.selectedIssues.reduce((prev, current) =>      (new Date(current.dt) > new Date(prev.dt)) ? current : prev  );
    if (!maxDtIssue) {
      this.tost.openSnackBar('Issue not found');
      return;
    }
    console.log('maxDtIssue', maxDtIssue);
    const mappedIssues: any = this.selectedIssues.map(issue => ({ nIid: issue.nIid, serialno: issue.serialno }));

    this.annotService.setHighLightIssueIds(mappedIssues);
    this.annotService.setLastIssue({ nIid: maxDtIssue.nIid, cColor: maxDtIssue.cColor })


    let model: any = {}
    model.nSessionid = this.current_session.nSesid;
    model.nUserid = this.nUserid;
    model.nCaseid = this.current_session.nCaseid;
    model.cDefHIssues = mappedIssues
    model.nLID = nlastId;
    try {
      model.jHids = (this.data.annotData.data.hIds || [])
    } catch (error) {
      model.jHids = [];
    }


    let res: any = await this.issueService.updateHighlightIssueIds(model);
    if (res.length) {
      this.tost.openSnackBar(res[0]["message"]);
      let objs = {};
      try {
        objs = { event: 'HIGHLIGHT-ISSUE-EDITS', jHids: model.jHids, cColor: maxDtIssue.cColor, jIssues: model.cDefHIssues.map(a => a.nIid).join(','), page: (this.data?.annotData?.data.page || 0) };
      } catch (error) {

      }
      this.dialogRef.close(objs);
    } else {
      this.tost.openSnackBar('Error in Updating highlight ids', 'E');
    }

  }

  getDt(no) {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - (no || 1));
    return currentDate;
  }

  async lastID(): Promise<number> {
    let lastId = 0;
    if (this.ishilight) {
      // this.selectedIssues.map(a => a.dt = (!a.dt&&(a.serialno)>=0) ? this.getDt((a.serialno))  : a.dt  );
    }

    let lastdata = await this.issueService.getLastIssue(this.selectedIssues);
    if (lastdata.length) {
      lastId = lastdata[0]["nIid"];


      this.selectedIssues.forEach(a => {
        const obj = lastdata.find(b => b.nIid == a.nIid);
        a.serialno = obj.serialno;
      });

    } else {
      lastId = this.selectedIssues[this.selectedIssues.length - 1]["nIid"] || 0
      this.selectedIssues.forEach((a, i) => {
        a.serialno = i;
      });
    }
    this.selectedIssues = this.selectedIssues.sort((a, b) => a.serialno - b.serialno);
    return lastId ? lastId : 0;
  }

  async submitForm() {
    debugger;
    const nlastId = await this.lastID();
    // return;
    if (this.ishilight) {
      await this.updateDefaultHighlightIssueIds(nlastId)
      return;
    }
    let selIssues = this.selectedIssues.map(({ dt, ...rest }) => rest);
    if (this.isIssuemdl) {
      this.saveDefaultIssues(selIssues, nlastId, 'I');
      return
    }
    // return;
    let mdl: any = {
      cNote: this.cNote || '',
      cUNote: '', //this.cUNote
      cONote: this.annotations.text || '',
      cIidStr: selIssues,
      nSessionid: this.current_session.nSesid,
      nCaseid: this.current_session.nCaseid,
      nLID: nlastId,//this.selectedIssues[this.selectedIssues.length - 1]["nIid"] || 0,
      cPageno: this.annotations && this.annotations.pageIndex ? (this.annotations.pageIndex).toString() : '1',
      jCordinates: this.annotations.cordinates || [{ "x": 100, "y": 200 }],
      nUserid: this.nUserid,
      cTranscript: this.isTrasnscript
    }
    //   {
    //     "msg": 1,
    //     "message": "Inserted",
    //     "nIDid": 212,
    //     "cColor": "05ff07"
    // }
    let res = [];
    if (this.cPermission == 'N') {
      res = await this.issueService.insertIssueDetail(mdl);


      this.saveDefaultIssues(selIssues, nlastId, 'I');

    } else if (this.cPermission == 'E') {

      mdl.nIDid = this.issueDetail.nIDid;
      res = await this.issueService.updateIssueDetail(mdl);
    }
    // return;
    if (res.length) {
      const newAnnotation: Annotation = {
        nIDid: res[0]["nIDid"],
        color: res[0]["cColor"],
        pageIndex: this.annotations.pageIndex,
        text: this.annotations.text,
        cordinates: this.annotations.cordinates,
        nICount: this.selectedIssues.length
      };

      this.dialogEvent.emit({ event: 'ADD-ANNOTATION', data: { pageIndex: Number(this.annotations.pageIndex), newAnnotation: newAnnotation } });
      this.fds.addAnnotation(Number(this.annotations.pageIndex), newAnnotation);
      this.dialogEvent.emit({ event: 'CHECK-TEMP-ANNOT', data: {} });
      this.fds.checkTempAnnotatation(null); // Check if the annotation is temporary 
      this.annotService.clearTempAnnotation();
      this.cPermission = null;
      this.dialogRef.close();
      if (!this.isToolbar)
        this.tost.openSnackBar(res[0]["message"]);
    } else {
      this.tost.openSnackBar('Error in Inserting Issue', 'E');
    }
  }

  onSelectedIssuesChange(selectedIssues: any[]) {

    this.selectedIssues = selectedIssues;
    console.log('Updated selectedIssues in parent:', this.selectedIssues);
  }


  close() {


    try {
      if (this.cPermission == 'E' && this.modelType == 'E' && !this.ishilight) {
        this.dialogEvent.emit({
          event: 'IS-EXISTS', data: {
            pageIndex: Number(this.issueDetail.cPageno || this.issueDetail.cTPageno) - 1,
            nIDid: this.issueDetail.nIDid,
            callback: (res) => {
              if (!res) {
                let icounts;
                try {
                  icounts = typeof this.issueDetail?.cIid == 'object' ? this.issueDetail?.cIid?.length : this.issueDetail.cIid.split(',').map((a: any) => a = String(a)).length
                } catch (error) {

                }
                const newAnnotation: Annotation = {
                  nIDid: this.issueDetail.nIDid,
                  color: this.issueDetail.cColor,
                  pageIndex: Number(this.issueDetail.cPageno || this.issueDetail.cTPageno),
                  text: this.issueDetail.cONote || '',
                  cordinates: this.issueDetail.jCordinates || this.issueDetail.jTCordinates,
                  nICount: icounts
                };
                this.dialogEvent.emit({ event: 'ADD-ANNOTATION', data: { pageIndex: Number(this.issueDetail.cPageno || this.issueDetail.cTPageno) - 1, newAnnotation: newAnnotation } });
                this.dialogRef.close();
              } else {
                this.dialogRef.close();
              }
            }
          }
        });
        /* if (!this.fds.isAnnotationExists(Number(this.issueDetail.cPageno) - 1, this.issueDetail.nIDid)) {
           const newAnnotation: Annotation = {
             nIDid: this.issueDetail.nIDid,
             color: this.issueDetail.cColor,
             pageIndex: Number(this.issueDetail.cPageno),
             text: this.issueDetail.cONote || '',
             cordinates: this.issueDetail.jCordinates,
             nICount: this.issueDetail.cIid.split(',').map((a: any) => a = Number(a)).length
           };
           this.dialogEvent.emit({ event: 'ADD-ANNOTATION', data: { pageIndex: Number(this.issueDetail.cPageno) - 1, newAnnotation: newAnnotation } });
           // this.fds.addAnnotation(Number(this.issueDetail.cPageno) - 1, newAnnotation);
         }*/
      } else {

        this.dialogRef.close();
      }
    } catch (error) {
      console.error(error);
      this.dialogRef.close();
    }
  }

  editIssueDetail() {

    this.cPermission = 'E';
    // this.isNote = this.issueDetail.cNote ? true : false;
    this.cNote = this.issueDetail.cNote;
    if (this.issueDetail.cUNote != null) {
      this.cUNote_editable = this.issueDetail.cUNote;
      this.cUNote = this.cUNote_editable;
    }
    const annotation: Annotation = {
      id: '',
      nIDid: this.issueDetail.nIDid,
      pageIndex: Number(this.issueDetail.cPageno || this.issueDetail.cTPageno),
      text: this.issueDetail.cONote || '',
      color: this.issueDetail.cColor || 'FFFF00',
      cordinates: this.issueDetail.jCordinates || this.issueDetail.jTCordinates
    };
    this.annotService.setTempAnnotation(annotation)
    this.annotations = this.annotService.getTempAnnotation();
    try {
      // this.assignedIssuesToHighlight;
      if (this.ishilight) {

        this.selectedIssues = this.assignedIssuesToHighlight.map((a, index) => ({ nIid: (a), serialno: index }));
      } else {
        this.selectedIssues = this.issueDetail.cIid; //.map(a => ({ nIid: a.nIid })); //this.assignedIssuesToHighlight.map(a => ({ nIid: (a) }));
      }

    } catch (error) {

    }
    this.cm.callFunction({ event: 'ISSUE-EDIT', nIDid: this.issueDetail.nIDid, page: Number(this.issueDetail.cPageno || this.issueDetail.cTPageno) });
    try {
      setTimeout(() => {
        if (this.textarea?.nativeElement)
          this.textarea.nativeElement.focus();
        let div: any = this.textarea.nativeElement.parentNode;
        div.scrollTop = div.scrollHeight;
      }, 500);
    } catch (error) {

    }
    this.cdr.detectChanges();
  }

  async deleteAnnotation() {
    if (this.ishilight) {
      let obj = {};
      try {
        obj = { event: 'HIGHLIGHT-ISSUE-DELETE', jHids: this.data.annotData.data.hIds, page: (this.data?.annotData?.data.page || 0) };
      } catch (error) {

      }
      this.dialogRef.close(obj);
      return;
    }
    let mdl = {
      nIDid: this.issueDetail.nIDid
    }
    let res = await this.issueService.deleteIssueDetail(mdl);
    this.dialogEvent.emit({ event: 'REMOVE-ANNOT', data: { nIDid: this.issueDetail.nIDid, page: Number(this.issueDetail.cPageno || this.issueDetail.cTPageno) } });
    // this.fds.removeAnnotation(this.issueDetail.nIDid, Number(this.issueDetail.cPageno));
    this.dialogEvent.emit({ event: 'CHECK-TEMP-ANNOT', data: {} });
    // this.fds.checkTempAnnotatation(null); // Check if the annotation is temporary 
    this.annotService.clearTempAnnotation();
    this.dialogRef.close();
    this.tost.openSnackBar(res[0]["value"] || res[0]["message"]);
  }


  isseuForm(x?) {
    if (this.issueFormDilog) {
      return;
    }
    this.issueFormDilog = this.dialog.open(CreateissueComponent, {
      width: '519px',
      height: 'calc(100vh - 144px)',
      hasBackdrop: false,
      panelClass: 'issuecreation',
      position: {
        top: `144px`,
        right: `0px`,
      },
      data: { type: x ? 'E' : null, value: x ? x : null, current_session: this.current_session, colorslist: this.previousIssues }, //this.issue.pastIsuueColor
    });

    this.issueFormDilog.afterClosed().subscribe((result) => {
      this.issueFormDilog = null;
      if (result) {

        this.dialogEvent.emit({ event: 'ISSUE-EDITED', data: result });
        this.changingValue.next(true);
      }
      else {
        if (!this.current_session.totaIssues && !this.ishilight) {
          this.dialogRef.close();
        }
      }
    })
  }


  issueDetailEvent(e) {
    if (e.event == 'BACK') {
      this.issuedetail = false;
    }
  }

  issueListEvent(e) {

    if (e.event == 'EDIT-ISSUE-FORM') {
      this.isseuForm(e.data);
    } else if (e.event == 'EDIT-ISSUE-DETAIL') {
      this.modelType = 'E';
      this.cPermission = 'N';
      this.initDetail(e.data.nIDid, true);
    } else if (e.event == 'PREVIOUS-ISSUES') {
      this.previousIssues = e.data;
    } else if (e.event == 'ADVANCE') {
      this.dialogEvent.emit(e);
    } else if (e.event == 'ADD-ISSUE') {
      this.dialogEvent.emit(e);
      this.isseuForm();
    } else if (e.event == 'ISSUE-DETAIL') {
      console.log('issue detail data', e.data);
      this.issuedetail = true;
      this.currentdetail = e.data;
    }
    else if (e.event == 'SELECTED-ISSUES-CHANGE') {

      this.selectedIssues = e.data;
    } else if (e.event == 'ISSUE-DELETED-UPDATE-ANNOTS') {

      // this.dialogRef.close(e);
    } else if (e.event == 'ISSUE-SELECTED') {
      this.submitForm()
    }
  }



  ngOnDestroy(): void {

    if (this.issueFormDilog) {
      this.issueFormDilog.close();
      this.issueFormDilog = null;
    }

  }


  async saveDefaultIssues(jIssues, nLID, flag) {

    const mdl = {
      nSesid: this.current_session.nSesid,
      nUserid: this.nUserid,
      cFlag: flag,
      jDefault: JSON.stringify(jIssues.map(a => ({ nIid: a.nIid, nRelid: a.nRelid || 0, nImpactid: a.nImpactid || 0, serialno: a.serialno })) || []),
      nLID: nLID
    };
    this.selectedIssues.map(({ dt, ...rest }) => rest);
    const res = await this.issueService.setDefault(mdl);
    if (res?.msg == 1) {

      this.annotService.setAnnotsIssueIds(jIssues.map(a => ({ nIid: a.nIid, nRelid: a.nRelid || 0, nImpactid: a.nImpactid || 0 })) || []);
      const color = jIssues.find(a => a.nIid == nLID)?.cColor;
      this.annotService.setAnnoLastIssue({ nIid: nLID, cColor: color });

      this.tost.openSnackBar('Saved');
      this.dialogRef?.close();
      // { event: 'DEFAULT-ISSUES-UPDATED', data: { jDefault: jIssues, nLID: nLID, flag: flag } }
    } else {
      this.tost.openSnackBar('Error in Saving Default Issues', 'E');
    }

  }

  OnUNoteChange(val) {
    this.cUNote = val;
  }

  goonback(event) {
    if (event.key === 'Backspace' || event.keyCode === 8) {
      if (!this.cUNote_editable) {
        this.textarea1.nativeElement.focus();
        this.issueDetail.cUNote = '';
        this.cUNote = '';
      }
    }
  }


  viewVersions() {
    this.isVersionBox = !this.isVersionBox;
    this.cdr.detectChanges();
  }

}