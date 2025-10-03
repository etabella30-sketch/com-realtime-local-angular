import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatRadioModule } from '@angular/material/radio';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IssueService } from '../../services/issue/issue.service';
import { sessionDataMDL } from '../../models/issue.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { environment } from '../../../../environments/environment';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import { UserDetail } from '../../../core/interfaces/login.interface';


@Component({
  selector: 'app-export',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCheckboxModule, MatSelectModule, IconComponent, ButtonComponent, MatRadioModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExportComponent {
  isAdvanced: boolean = false;
  frm: any;
  current_session: any;
  nUserid: any;
  issueList: any[] = [];
  gropuIssueList: any = [];
  SelectedQM: any[] = [];
  SelectedQ: any[] = [];

  icons: any[] = [
    // { name: 'Small', icon: 'textF', type: 'S', toolTip: 'Highlighter' },
    // { name: 'Normal', icon: 'textF', type: 'N', toolTip: 'Freehand' },
    // { name: 'Large', icon: 'textF', type: 'L', toolTip: 'Shape' },
  ]
  downloadPath: string = `${environment.cloudUrl}/`; ///assets/realtime-transcripts/exports/
  isLoading: boolean = false;
  cTranscript: string = 'N';
  userdetail: UserDetail;
  constructor(private issueService: IssueService, private store: SecureStorageService, private cdr: ChangeDetectorRef, private tost: TostbarService, public dialogRef: MatDialogRef<ExportComponent>) {

  }

  async ngOnInit() {
    this.fetchIssues();
    this.frm = new FormGroup({
      // nTaskid: new FormControl(null),
      cTranscript: new FormControl(this.cTranscript),
      bPagination: new FormControl(false),
      bTimestamp: new FormControl(false),

      bQmark: new FormControl(false),
      cQMsize: new FormControl('S'),
      jHIssues: new FormControl([]),

      bQfact: new FormControl(false),
      cQFsize: new FormControl('S'),
      jIssues: new FormControl([]),

      bAdvanced: new FormControl(false),
      bCoverpg: new FormControl(true),
      cPages: new FormControl('A'),
      cPagerange: new FormControl(''),

      cOrientation: new FormControl('A'),
      bFitpg: new FormControl(true),
      cPgsize: new FormControl('A4'),
    });

    this.userdetail = await this.store.getUserInfo();
  }

  changeFont(type, key) {
    this.frm.controls[key].setValue(type);
    console.log(this.frm.value);
  }

  async fetchIssues() {
    this.issueList = [];
    this.issueList = await this.issueService.fetchIssueList({ nCaseid: this.current_session.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid, nIDid: 0 });
    this.issueList = this.issueList.filter(a => a.nUserid);
    console.log('issueList', this.issueList);
    const groupedIssueList = Object.values(this.issueList.reduce((acc, item) => {
      const { nICid, cCategory } = item;
      if (!acc[nICid]) {
        acc[nICid] = {
          nICid,
          cCategory,
          sublist: []
        };
      }
      acc[nICid].sublist.push(item);
      return acc;
    }, {}));
    // this.issueList = groupedIssueList;
    this.gropuIssueList = groupedIssueList
    // console.log('grouped issue', this.issueList);
    this.cdr.detectChanges();
  }

  // changeIssue(id, key) {
  //   this.frm.value[key] = [...this.frm.value[key], id];
  // }
  checkAll(key) {

    this.frm.patchValue({ [key]: this.issueList.map((item) => item.nIid) });
    this.cdr.detectChanges();
  }

  async submit() {

    console.log('frm.value', this.frm.value);
    let mdl = this.frm.value;
    // mdl.cTranscript = 'Y';
    mdl.cCasename = this.current_session.cName //this.current_session.cCasename;
    mdl.cUsername = this.userdetail ? (`${this.userdetail.cFname} ${this.userdetail.cLname}`) : '';
    mdl.nCaseid = this.current_session.nCaseid;
    mdl.nSessionid = this.current_session.nSesid; // this.current_session.nSesid;
    mdl.nUserid = this.nUserid;
    mdl.jPages = [];
    mdl.jIssues = mdl.jIssues ? mdl.jIssues.filter(a => a).map(a => (a)) : [];
    mdl.jHIssues = mdl.jHIssues ? mdl.jHIssues.filter(a => a).map(a => (a)) : [];
    if (mdl.cPages === 'R' && mdl.cPagerange) {
      mdl.jPages = this.parsePageRange(this.frm.value.cPagerange);
    }
    delete mdl.cPagerange;
    delete mdl.cPages;
    if (this.isLoading) return;

    this.isLoading = true;
    this.cdr.detectChanges();
    const res: any = await this.issueService.exportAnnotIssueHighlight(this.frm.value);
    this.isLoading = false;
    this.cdr.detectChanges();
    if (res) {
      if (res.msg == 1) {
        this.tost.openSnackBar('File exported successfully');
        this.downloadURI(res.path, res.name);
      }
      else {
        ///   this.tost.error('Failed to export');
      }

    }
  }


  changeIssue(key, key1) {
    this[key] = this.issueList.filter((item) =>
      this.frm.value[key1].includes(item.nIid)
    );
    this.cdr.detectChanges();
  }

  removels(x, key, key1) {
    this[key] = this[key].filter((item) => item.nIid !== x.nIid);
    this.frm.patchValue({ [key1]: this[key].map((item) => item.nIid) });
  }



  parsePageRange(pageRange: string): number[] {
    let result = new Set<number>();
    let ranges = pageRange.split(',');

    ranges.forEach(range => {
      if (range.includes('-')) {
        let [start, end] = range.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            result.add(i);
          }
        }
      } else {
        let num = Number(range);
        if (!isNaN(num)) {
          result.add(num);
        }
      }
    });

    return Array.from(result).sort((a, b) => a - b);
  }




  downloadURI(uri, name) {

    const fileName = `${this.downloadPath}${uri}`; //?id:${Math.random()} // The file name you want to download
    this.issueService.downloadFile(fileName).subscribe(
      (blob) => {
        this.dialogRef.close()
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = name;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      (error) => {
        console.error('Download error:', error);
        ///  this.tost.error('Failed to download');
      }
    );
  }




}
