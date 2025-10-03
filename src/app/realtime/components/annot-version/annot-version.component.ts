import { Component, Input } from '@angular/core';
import { issueDetailMdL, issueVersions } from '../../models/issue.interface';
import { IssueService } from '../../services/issue/issue.service';

@Component({
  selector: 'annot-version',
  standalone: true,
  imports: [],
  templateUrl: './annot-version.component.html',
  styleUrl: './annot-version.component.scss'
})
export class AnnotVersionComponent {

  @Input() issueDetail: issueDetailMdL = {} as issueDetailMdL;
  versions: issueVersions[] = []
  original: { oL: number, oP: number, t: number, text: string }[] = []
  constructor(private issueService: IssueService) { }

  async ngOnInit() {
    debugger;
    this.issueDetail;
    const versions = await this.issueService.getIssueVersions(this.issueDetail.nIDid);



    // 
    try {
      this.versions = versions.map((e) => ({ nRefresh: e.nRefresh, versions: e.jCordinates.map((a: any) => ({ t: a.t, oL: a.oL, oP: a.oP, text: a.text })) }));
    } catch (error) {

    }

    try {

      this.original = this.issueDetail.jOCordinates.map((a: any) => ({t: a.t, oL: a.oL, oP: a.oP, text: a.text }));
    } catch (error) {

    }


    // Initialization logic can go here
  }

  // Add any additional methods or properties as needed

}
