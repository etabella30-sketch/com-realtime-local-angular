import { Component, Inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../shared/services/session.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-assignparticipant',
  standalone: true,
  providers: [SessionService],
  imports: [ButtonComponent, InputComponent, AvatarComponent, FormsModule, MatTooltipModule, MatCheckboxModule, CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './assignparticipant.component.html',
  styleUrl: './assignparticipant.component.scss'
})
export class AssignparticipantComponent {
  isconfirm: boolean = false;
  allSelected: boolean = false;
  teams: any = [
    // {
    //   "userlist": [
    //     {
    //       "cFname": "Paul ",
    //       "cLname": "Taylor",
    //       "nTeamid": 328,
    //       "nUserid": 218,
    //       "cProfile": "",
    //       "nMasterid": 218
    //     },
    //     {
    //       "cFname": "Adriaan",
    //       "cLname": " Hoeben",
    //       "nTeamid": 328,
    //       "nUserid": 219,
    //       "cProfile": "",
    //       "nMasterid": 219
    //     }
    //   ],
    //   "cTeamname": "Respondent"
    // },
    // {
    //   "userlist": [
    //     {
    //       "cFname": "Josias ",
    //       "cLname": "De Salles",
    //       "nTeamid": 329,
    //       "nUserid": 214,
    //       "cProfile": "",
    //       "nMasterid": 214
    //     },
    //     {
    //       "cFname": "Sarah ",
    //       "cLname": "Nehme",
    //       "nTeamid": 329,
    //       "nUserid": 215,
    //       "cProfile": "",
    //       "nMasterid": 215
    //     }
    //   ],
    //   "cTeamname": "Claimant"
    // }
  ]

  otherUserrs: any = [];
  cSearch: string = '';
  isOndate: boolean = true;
  isSendNow: boolean = false;
  constructor(public sessionService: SessionService, private dialogRef: MatDialogRef<AssignparticipantComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.getTeams();
    console.log(data);//permission
   

  }

  async getTeams() {
    let teams = await this.sessionService.getTeams(this.data.session.nCaseid);
    if (teams.length > 0) {
      this.teams = teams;
   
    
    }
    if (this.data.permission == 'E') {
      this.getAssignedUsers();
    }else{
      
      this.selectAllUsers({ checked: true });
    }
  }

  async seachUser(event: any) {

    this.otherUserrs = this.otherUserrs.filter(a => a.isSelected);
    let data: any = await this.sessionService.getSeachedUsers(this.data.session.nCaseid, this.cSearch);
    if (data.length > 0) {
      data = data.filter(a => this.otherUserrs.findIndex(b => b.nUserid == a.nUserid) == -1);
      this.otherUserrs = [... this.otherUserrs, ...data];
    }
  }

  changeServer() {
    this.dialogRef.close('CHANGE-SERVER');
  }

  async assignUsersToServer() {
    
    let assignUsers = this.otherUserrs.filter((x: any) => x.isSelected).map(a => { return { u: a.nUserid, t: 'O' } });
    assignUsers = [...assignUsers, ...this.teams.map(a => a.userlist.filter(m => m.isSelected)).flat(2).map(a => { return { u: a.nUserid, t: 'T' } })]
    // if (!assignUsers.length) {
    //   this.sessionService.show('Please select atleast one user');
    //   return;
    // }
    let mdl: any = {
      nCaseid: this.data.session.nCaseid,
      nSesid: this.data.session.nSesid,
      nRTSid: this.data.server.nRTSid,
      cNotifytype: this.isOndate ? 'O' : 'N',
      jUserid: JSON.stringify(assignUsers)
    }
    let res = await this.sessionService.assignUser(mdl);
    if (res) {
      this.dialogRef.close(true);
    }
  }

  selectAllUsers(event) {
    const isChecked = event.checked;
    this.teams.forEach(team => team.userlist.forEach(user => user.isSelected = isChecked));
    this.updateMasterCheckbox();
  }

  toggleUserSelection(user, event) {
    event.stopPropagation();
    user.isSelected = !user.isSelected;
    this.updateMasterCheckbox();
  }

  updateMasterCheckbox() {
    const allSelected = this.teams.every(team => team.userlist.every(user => user.isSelected));
    this.allSelected = allSelected;
  }

  async getAssignedUsers() {
   
    let res: any = await this.sessionService.getAssigned(this.data.session.nSesid);
    if (res.length > 0) {
      for(let x of res){
        let user = this.teams.map(a => a.userlist.find(b => b.nUserid == x.nUserid)).find(a => a);
        if (user) {
          user.isSelected = true;
        } else {
          this.otherUserrs.push(x);
          // user = this.otherUserrs.find(a => a.nUserid == x.nUserid);
          // if (user) {
          //   user.isSelected = true;
          // }
        }
      }
      // this.teams.forEach(team => {
      //   team.userlist.forEach(user => {
      //     user.isSelected = res.findIndex(a => a.nUserid == user.nUserid) > -1;
      //   });
      // });
    }
  }

}
