import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CommunicationService } from '../../../../shared/services/communication/communication.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { IssueService } from '../../../services/issue/issue.service';
import { SecureStorageService } from '../../../../core/services/storage/secure-storage.service';

@Component({
  selector: 'app-issuedetail',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, ButtonComponent, IconComponent],
  templateUrl: './issuedetail.component.html',
  styleUrl: './issuedetail.component.scss'
})
export class IssuedetailComponent {

  @Input() issue: any;
  @Input() current_session: any;
  @Output() OnEvent = new EventEmitter<any>();
  nUserid: string;
  relevences: any = {};
  curruntdetail: any = {};
  imapcts: any = {};
  listMode: any = 'A';//A , H;
  constructor(private cs: CommunicationService, private issueService: IssueService, private cdr: ChangeDetectorRef, private store: SecureStorageService) { }

  async ngOnInit() {
    this.nUserid = await this.store.getUserId();
    this.getrelevence();
    this.fetchDetail(this.issue);
    console.log('issue detail init', this.issue);
  }





  async fetchDetail(x) {
    debugger;
    // if (!x.nTotalID || x.nTotalID == 0) {
    //   return;
    // }
    x.sublist = [];
    x.isLoading = true;
    try {

      const result = await this.issueService.fetchIssueAllDetail({ nCaseid: this.current_session.nCaseid, nSessionid: this.current_session.nSesid, nUserid: this.nUserid, nIid: x.nIid });

      x.sublist = result[0];
      x.hyperlinks = result[1];
      if (x.hyperlinks.length) {
        x.hyperlinks = x.hyperlinks.map(a => {

          return { ...a, fromline: Math.min(...a["highlights"].map(a => Number(a.cLineno))), toline: Math.max(...a["highlights"].map(a => Number(a.cLineno))), cPageno: a["highlights"][0]["cPageno"] }

        })
      }
    } catch (error) {

    }
    x.currentNote = '';
    if (x.sublist.length) {
      try {
        x.sublist = x.sublist.map(a => {
          const pg = a.jCordinates.find(a=>a.p)
          a.cPageno = pg.p || a.cPageno;
          return a;
        });
      } catch (error) {

      }
      x.sublist[0].isCheck = true;
      x.currentNote = x.sublist[0].cNote;
      this.selectIssueDetail(x, x.sublist[0])
    }

    if (!x.sublist.length) {
      this.listMode = 'H';
    }


    x.isLoading = false;

    this.cdr.detectChanges();
  }

  selectIssueDetail(x, y) {

    this.curruntdetail = y;
    x.sublist.map(a => a.isCheck = false);
    y.isCheck = true;
  }

  selectHIssueDetail(x, y) {
    x.hyperlinks.map(a => a.isCheck = false);
    y.isCheck = true;
  }

  OnPage(y) {
    this.cs.callFunction({ event: 'ISSUE-ON-PAGE', page: Number(y.cPageno) - 1 });
  }

  back() {
    this.OnEvent.emit({ event: 'BACK', data: '' });
  }


  async getrelevence() {
    this.relevences = await this.issueService.getDynamicCombo(4);
  }



  findrelevance(nRelid) {
    return this.relevences.find(relevance => relevance.nValue == nRelid);
  }


}
