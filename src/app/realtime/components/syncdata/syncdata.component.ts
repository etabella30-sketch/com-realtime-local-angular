import { Component } from '@angular/core';
import { IssueService } from '../../services/issue/issue.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-syncdata',
  standalone: true,
  imports: [],
  templateUrl: './syncdata.component.html',
  styleUrl: './syncdata.component.scss'
})
export class SyncdataComponent {
  isSyncing: boolean = true;
  isSuccess: boolean = false;
  constructor(private issueService: IssueService, private router: Router) { }

  async ngOnInit() {
    this.isSyncing = true;
    try {
      const res = await this.issueService.syncUsers();
      if (res.msg == 1) {
        this.isSuccess = true;
      }
    } catch (error) {
      this.isSuccess = false;
    }
    this.isSyncing = false;
  }

  GoToHome() {
    this.router.navigate(['/realtime/dashboard']);
  }

}