import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, SimpleChange } from '@angular/core';
import { IssueService } from '../../../services/issue/issue.service';
import { SessionIssueMDL, issueListMdl, sessionDataMDL } from '../../../models/issue.interface';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CommunicationService } from '../../../../shared/services/communication/communication.service';
import { SecureStorageService } from '../../../../core/services/storage/secure-storage.service';
import { MatSelectModule } from '@angular/material/select';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TostbarService } from '../../../../core/services/tost/tostbar.service';
import { MatMenuModule } from '@angular/material/menu';
import { param_highLightIssueIds, param_lastIssue } from '../../../models/annotation.interface';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-issue-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCheckboxModule, FormsModule, IconComponent, MatSelectModule, ButtonComponent, MatMenuModule],
  providers: [],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent {
  issueList: issueListMdl[] = [];
  // issueData: SessionIssueMDL = { nCaseid: 22, nSessionid: 57, nUserid: 3 };
  @Input() modelType: string;
  @Input() selectedIssues = [];
  @Input() cPermission: string;
  @Input() assignedIssuesToHighlight: any;
  @Input() ishilight: boolean = false;
  @Input() isToolbar: boolean = false;
  @Input() current_session: sessionDataMDL;
  @Input() nIDid: string;
  @Output() OnEvent = new EventEmitter<any>();
  @Input() OnChange: Subject<boolean>;

  isLoading: boolean = true;
  selectedrel: any;
  selectedimpct: any;
  relevences: any = [];
  imapcts: any = [];

  nUserid: string;
  @Input() previousIssues: { cClr: string }[] = [];

  constructor(private issueService: IssueService, private cdr: ChangeDetectorRef, private cs: CommunicationService,
    private store: SecureStorageService, private tost: TostbarService, private dialog: MatDialog) {

  }

  checkIssueId(x) {
    //console.log('selectedIssues',this.selectedIssues,x,!this.selectedIssues.find(a=>a.nIid==x.nIid));

    return !this.selectedIssues.find(a => a.nIid == x.nIid)
  }


  checkIfExistsInAssigns(x) {
    //console.log('selectedIssues',this.selectedIssues,x,!this.selectedIssues.find(a=>a.nIid==x.nIid));

    return !this.assignedIssuesToHighlight.includes(String(x.nIid))
  }

  async ngOnInit() {
    if (this.OnChange) {
      this.OnChange.subscribe((data: any) => {
        if (data) {
          this.isLoading = true;
          this.fetchIssues();
        }
      })
    }
    this.getrelevence();
    this.getimpact();
    this.nUserid = await this.store.getUserId();
    this.fetchIssues();
  }

  getCKey(nRelid: number, type): string {

    if (type == 'R') {
      const relevance = this.relevences.find(item => item.nRelid === nRelid);
      return relevance ? relevance.cKey : 'Select...';
    } else {
      const impact = this.imapcts.find(item => item.nImpactid === nRelid);
      return impact ? impact.cKey : 'Select...';
    }
  }

  async getrelevence() {
    this.relevences = await this.issueService.getDynamicCombo(4);
    this.relevences = this.relevences.map(relevance => ({
      nRelid: relevance.nValue,
      cKey: relevance.cKey,
      nSerialno: relevance.nSerialno
    }));
    this.relevences.sort((a, b) => a.nSerialno - b.nSerialno);
  }
  async getimpact() {
    this.imapcts = await this.issueService.getDynamicCombo(5);
    this.imapcts = this.imapcts.map(impact => ({
      nImpactid: impact.nValue,
      cKey: impact.cKey,
      nSerialno: impact.nSerialno
    }));
    this.relevences.sort((a, b) => a.nSerialno - b.nSerialno);
  }

  getSerialNo(id, array, key) {
    const item = array.find(element => element[key] == id);
    return item ? item.nSerialno : Number.MIN_SAFE_INTEGER; //Number.MAX_SAFE_INTEGER; // Use MAX_SAFE_INTEGER for items not found
  }

  getPreviousDt(cnt) {
    return new Date(new Date().setDate(new Date().getDate() - cnt));
  }

  setPriorities(currentIssues) {



    let sortData = currentIssues.sort((a, b) => {
      // let aRelSerial = a.nRelid ? this.getSerialNo(a.nRelid, this.relevences, 'nRelid') | 0 : 0;
      // let bRelSerial = b.nRelid ? this.getSerialNo(b.nRelid, this.relevences, 'nRelid') | 0 : 0;

      // let aImpactSerial = a.nImpactid ? this.getSerialNo(a.nImpactid, this.imapcts, 'nImpactid') | 0 : 0;
      // let bImpactSerial = b.nImpactid ? this.getSerialNo(b.nImpactid, this.imapcts, 'nImpactid') | 0 : 0;

      // if (aRelSerial !== bRelSerial) {
      //   return aRelSerial - bRelSerial;
      // }

      // if (aImpactSerial !== bImpactSerial) {
      //   return aImpactSerial - bImpactSerial;
      // }
      let dateA: any = new Date(a.dt ? a.dt : this.getPreviousDt(2));
      let dateB: any = new Date(b.dt ? b.dt : this.getPreviousDt(2));
      return dateA - dateB;
    });

    return sortData;
    // Create mapping for nRelid to nSerialno
    const relevanceMap = this.relevences.reduce((acc, item) => {
      acc[item.nRelid] = item.nSerialno;
      return acc;
    }, {});

    // Create mapping for nImpactid to nSerialno
    const impactMap = this.imapcts.reduce((acc, item) => {
      acc[item.nImpactid] = item.nSerialno;
      return acc;
    }, {});

    // Sort selectedIssue based on the mapped priorities and date
    return currentIssues.sort((a: any, b: any) => {
      const relPriorityA = relevanceMap[a.nRelid] | 0;
      const relPriorityB = relevanceMap[b.nRelid] | 0;
      const impactPriorityA = impactMap[a.nImpactid] | 0;
      const impactPriorityB = impactMap[b.nImpactid] | 0;

      if (relPriorityA === relPriorityB) {
        if (impactPriorityA === impactPriorityB) {
          return new Date(a.dt).getTime() - new Date(b.dt).getTime();// Compare dates if both priorities are the same
        }
        return impactPriorityB - impactPriorityA; // Compare impact priority if relevance priority is the same
      }
      return relPriorityA - relPriorityB; // Compare relevance priority
    });
  }


  async fetchIssues() {

    this.issueList = [];
    this.issueList = await this.issueService.fetchIssueList({ nCaseid: this.current_session.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid, nIDid: this.nIDid });
    this.isLoading = false;
    console.log('issueList', this.issueList);

    try {
      this.previousIssues = this.issueList.map(issue => ({ cClr: issue.cColor })); // Combine sort and map //.sort((a, b) => b.nIid - a.nIid)
      this.OnEvent.emit({ event: 'PREVIOUS-ISSUES', data: this.previousIssues });
    } catch (error) {
    }
    this.reBindList();
    this.cdr.detectChanges();
  }

  OnPage(y) {
    this.cs.callFunction({ event: 'ISSUE-ON-PAGE', page: Number(y.cPageno) - 1 });
  }

  async fetchDetail(x) {

    // if (!x.nTotalID || x.nTotalID == 0) {
    //   return;
    // }
    x.isExpanded = !x.isExpanded;
    if (x.isExpanded) {
      x.sublist = [];
      x.isLoading = true;
      x.sublist = await this.issueService.fetchIssueAllDetail({ nCaseid: this.current_session.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid, nIid: x.nIid });
      x.currentNote = '';
      if (x.sublist.length) {
        x.sublist[0].isCheck = true;
        x.currentNote = x.sublist[0].cNote;
      }
      x.isLoading = false;
    }
    this.cdr.detectChanges();
  }

  selectIssueDetail(x, y) {
    x.currentNote = y.cNote;
    x.sublist.map(a => a.isCheck = false);
    y.isCheck = true;
  }

  advanceissue(x) {
    this.issueList.map(a => a.nIid != x.nIid ? a.isExpanded = false : '');
    x.isExpanded = !x.isExpanded;
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes['selectedIssues'] && !changes['selectedIssues'].firstChange) {
      if (this.modelType == 'E') {
        this.reBindList();
      }
    }
  }

  reBindList() {
    if (this.selectedIssues) {
      //   this.issueList.forEach(a => {
      //     a.isChecked = this.selectedIssues.some(issue => issue.nIid === a.nIid);
      // });
      this.selectedIssues.forEach(issue => {
        const matchedIssue = this.issueList.find(item => item.nIid === issue.nIid);
        if (matchedIssue && matchedIssue.cColor && !issue.cColor) {
          console.log('matchedIssue', matchedIssue);
          issue.cColor = matchedIssue.cColor;
        }
      });
      this.issueList.forEach(issue => {
        const selectedIssue = this.selectedIssues.find(selected => selected.nIid === issue.nIid);
        if (selectedIssue) {
          issue.isChecked = true;
          issue.nRelid = selectedIssue.nRelid;
          issue.nImpactid = selectedIssue.nImpactid;
          issue.serialno = (selectedIssue.serialno >= 0 && !Number.isNaN(selectedIssue.serialno)) ? selectedIssue.serialno : 0;
        }
        else {
          issue.isChecked = false;
        }


      });

      //this.issueList.map(a => a.isChecked = this.selectedIssues.includes(a.nIid));
      console.log('issueList = ', this.issueList);
    }
  }




  getSelectedIssues() {

    let currentIssues: any = this.issueList
      .filter(issue => issue.isChecked)
      .map(issue => ({
        nIid: issue.nIid,
        nRelid: issue.nRelid,
        nImpactid: issue.nImpactid,
        dt: issue.dt, cColor: issue.cColor,
        serialno: issue.serialno
      }));
    // console.clear();
    console.table(currentIssues);
    currentIssues = this.setPriorities(currentIssues)
    console.table(currentIssues);
    return currentIssues;
  }


  async OnSelected(x: any) {

    this.issueList.map(a => a.nIid != x.nIid ? a.isExpanded = false : '');
    x.dt = new Date();
    x.cColor = x.cColor;

    this.issueList.map(a => a.serialno = a.serialno + 1)
    if (x.isChecked) {
      x.serialno = 0;
    }
    // this.selectedIssues = this.getSelectedIssues();

    this.selectedIssues.map(a => a.serialno = a.serialno + 1)



    this.selectedIssues.splice(0, this.selectedIssues.length);
    this.selectedIssues.push(...this.getSelectedIssues());

    if (this.isToolbar) {
      this.OnEvent.emit({ event: 'ISSUE-SELECTED', data: this.selectedIssues });
    }

    console.log('selectedIssues', this.selectedIssues);
    this.cdr.detectChanges();

  }



  edit(x) {
    this.OnEvent.emit({ event: 'EDIT-ISSUE-FORM', data: x });
  }
  detail(x) {
    this.OnEvent.emit({ event: 'ISSUE-DETAIL', data: x });
  }


  editIssueDetail(x) {
    if (x.sublist && x.sublist.length) {
      let obj = x.sublist.find(a => a.isCheck);
      this.OnPage(obj);
      this.OnEvent.emit({ event: 'EDIT-ISSUE-DETAIL', data: obj });
    }
  }


  isIssueSelected(selectedIssues, issue): boolean {
    return selectedIssues.some(selectedIssue => selectedIssue.nIid == issue);
  }


  async deleteIssue(x, index) {
    debugger;
    try {
      const res = await this.issueService.issueDelete(x.nIid);
      if (res[0]["msg"] == 1) {
        this.OnEvent.emit({ event: 'ISSUE-DELETE-REFRESH-DATA', data: {} });
        this.tost.openSnackBar('Issue deleted successfully', '');
        this.issueList.splice(index, 1);
        // await this.fetchIssues();
        this.OnEvent.emit({ event: 'ISSUE-DELETED-UPDATE-ANNOTS', data: {} });
        if (!this.issueList.length) { //&& this.issueList[0].nIid == 80
          this.dialog.closeAll();
        }
      } else {
        this.tost.openSnackBar(res[0]["message"], 'E');
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      this.tost.openSnackBar('An error occurred while deleting the issue', 'E');
    }
  }

  isseuForm() {
    this.OnEvent.emit({ event: 'ADD-ISSUE', data: {} });
  }


  advance() {
    this.OnEvent.emit({ event: 'ADVANCE', data: {} });
  }

  checkwidth(x) {
    let wth
    if (this.isToolbar) {
      wth = '28px'
      if (x.isChecked) {
        wth = '48px'
      }
      if (x.nImpactid) {
        wth = '78px'
      }
      if (x.nRelid) {
        wth = '148px'
      }
    }
    else {
      if (x.nRelid) {
        wth = '180px'
      }
    }
    this.cdr.detectChanges();

    
    return wth;

  }

}