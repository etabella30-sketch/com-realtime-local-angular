import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { TextareaComponent } from '../../../shared/components/textarea/textarea.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IssueService } from '../../services/issue/issue.service';
import { issueDetailMdL } from '../../models/issue.interface';

@Component({
  selector: 'notes',
  standalone: true,
  imports: [TextareaComponent, IconComponent],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent {
  notevalue: any;
  noteSAVED: boolean;
  @Input() nIDid: string
  demotext: any = ``;
  issueDetail: issueDetailMdL = {} as issueDetailMdL

  isEdit: boolean = false;
  constructor(private issueService: IssueService,private cdr:ChangeDetectorRef ) {

  }

  async ngOnInit() {
    this.issueDetail = await this.issueService.fetchIssueDetail(this.nIDid);
    this.demotext = this.issueDetail.cNote
    if (!this.issueDetail.cNote) {
      this.demotext = this.issueDetail.cONote
    }

    if (!this.demotext)
      this.isEdit = true;
  }


  async SaveNote() {

    if (this.demotext) {
      await this.issueService.updateIssueNote({ nIDid: this.nIDid, cNote: this.demotext })
      this.isEdit = false;
      this.cdr.detectChanges();
    }
  }


 

}
