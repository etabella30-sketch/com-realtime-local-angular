import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionService } from '../../../shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AssignparticipantComponent } from '../assignparticipant/assignparticipant.component';
import { AssignserversComponent } from '../assignservers/assignservers.component';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-newsession',
  standalone: true,
  providers: [SessionService],
  imports: [CommonModule, MatFormFieldModule, MatDatepickerModule, MatInputModule, ButtonComponent, ReactiveFormsModule, HttpClientModule, MatSelectModule, MatCheckboxModule],
  templateUrl: './newsession.component.html',
  styleUrl: './newsession.component.scss',
})
export class NewsessionComponent {
  sesname;

  frm: FormGroup;
  formsubmit: boolean = false;
  isLoading: boolean = false;

  public value;

  validateWhite(event: number) {

    if (event > 12) {
      this.value = 12;
    } else if (event < 0) {
      this.value = 0;
    } else {
      this.value = event;
    }
  }

  protocols: any[] = [
    { name: 'Case view', value: 'C' },
    { name: 'Bridge view', value: 'B' }
  ];
  nUserid: string = (localStorage.getItem('nUserid'));
  constructor(private formBuilder: FormBuilder, public sessionService: SessionService, private dialog: MatDialog, private dialogRef: MatDialogRef<NewsessionComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.frm = this.formBuilder.group({
      nSesid: [0],
      cCaseno: ['', [Validators.required]],
      cName: ['', [Validators.required]],
      // dStartDt: ['', [Validators.required]],
      date: [new Date(), [Validators.required]],
      timeH: ['', [Validators.required]],
      timeM: ['', [Validators.required]],
      ttype: ['AM', [Validators.required]],
      dD: [''],
      dM: [''],
      dY: [''],
      nDays: [1, [Validators.required]],
      nLines: [25, [Validators.required]],
      nPageno: [1, [Validators.required]],
      cProtocol: ['C', [Validators.required]],
      bRefresh: [true],
      permission: ['N']
      // betweenType: ['all']
    });




    debugger;
    if (data && data.nSesid) {
      this.frm.patchValue({
        nSesid: data.nSesid,
        cCaseno: data.cCaseno,
        cName: data.cName,
        date: new Date(data.dStartDt),
        // time: data.dStartDt.split('T')[1].split(':')[0] + ':' + data.dStartDt.split('T')[1].split(':')[1],
        // ttype: data.dStartDt.split('T')[1].split(':')[2],
        timeH: this.getHour(this.data.dStartDt),
        timeM: this.getMinutes(this.data.dStartDt),
        ttype: this.getAMPM(this.data.dStartDt),
        nDays: data.nDays,
        nLines: data.nLines,
        nPageno: data.nPageno,
        cProtocol: data.cProtocol,
        bRefresh: data.bRefresh,
        permission: 'E',
        // betweenType: data.betweenType
      })
    }

    this.fetchRefreshType();

    this.OndateChange({ value: this.frm.value.date });
  }

  async fetchRefreshType() {
  /*  try {
      let res = await this.sessionService.getRefreshType();
      if (res.msg == 1) {
        this.frm.patchValue({
          betweenType: res.cType
        })
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    }*/
  }

  getHour(dt) {
    return ('00' + Math.abs(new Date(dt).getHours() > 12 ? 12 - new Date(dt).getHours() : new Date(dt).getHours())).substr(-2);
  }


  getMinutes(dt) {
    return ('00' + new Date(dt).getMinutes()).substr(-2)
  }

  getAMPM(dt) {
    return new Date(dt).getHours() >= 12 ? 'PM' : 'AM';
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    if (!this.data || !this.data?.nSesid) {
      this.frm.patchValue({
        ttype: this.getAmPmLocal()
      })
    }

  }


  getAmPmLocal() {

    const date = new Date(); // Creates a date object with the current date and time
    const Toptions: any = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true  // Ensures the time is in 12-hour format to get AM/PM
    };
    const timeString = date.toLocaleTimeString([], Toptions); // Converts time to a string based on local settings
    const amPm = timeString.slice(-2); // Extracts AM or PM
    return amPm;
  }

  OndateChange(e) {
    this.frm.patchValue({
      dD: e.value.getDate(),
      dM: e.value.getMonth() + 1,
      dY: e.value.getFullYear()
    })
  }

  DateChange(type, val) {
    let dt = this.frm.value.date;
    if (type == 'd') {
      dt.setDate(val);
    } else if (type == 'm') {
      dt.setMonth(val - 1);
    } else if (type == 'y') {
      dt.setFullYear(val);
    }
    this.frm.patchValue({
      date: dt
    })
    this.OndateChange({ value: this.frm.value.date });
  }

  async submitForm() {
    debugger;
    this.formsubmit = true;
    console.log(this.frm.value)
    if (this.frm.invalid) {
      return;
    }


    try {
      // if (this.frm.value.permission == 'N') {
      //   this.sessionService.setRefreshType(this.frm.value.betweenType);
      // }
    } catch (error) {

    }

    let x = this.frm.value;
    let mdl = {
      nSesid: x.nSesid,
      cCaseno: x.cCaseno,
      cName: x.cName,
      nDays: x.nDays,
      nLines: x.nLines,
      nPageno: x.nPageno,
      permission: x.permission,
      dStartDt: this.frm.value.date.toISOString().split('T')[0] + 'T' + this.frm.value.timeH + ':' + this.frm.value.timeM + ' ' + this.frm.value.ttype,
      nUserid: this.nUserid,
      cProtocol: x.cProtocol,
      bRefresh: x.bRefresh
    }
    this.isLoading = true;
    this.sessionService.sessionBuilder(mdl).then((res) => {
      this.isLoading = false;
      console.log(res)
      if (res.msg == 1) {
        this.dialogRef.close();
        this.sessionService.show(res["value"]);
      } else {
        this.sessionService.show(res["value"]);
      }
    })


  }
  assign(x) {
    // this.dialog.closeAll();
    // let y = this.frm.value;
    // let mdl = {
    //   nSesid: x.nSesid,
    //   cCaseno: x.cCaseno,
    //   cName: x.cName,
    //   nDays: x.nDays,
    //   nLines: x.nLines,
    //   nPageno: x.nPageno,
    //   permission: x.permission,
    //   dStartDt: this.frm.value.date.toISOString().split('T')[0] + 'T' + this.frm.value.timeH + ':' + this.frm.value.timeM + ' ' + this.frm.value.ttype,
    // }
    // this.dialog.closeAll();
    const dialogRef = this.dialog.open(AssignparticipantComponent,
      {
        width: '630px',
        height: 'fit-content',
        data: { server: { nRTSid: this.data.nRTSid, cUrl: this.data.cUrl, nPort: this.data.nPort }, session: this.data, permission: 'E' }
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'CHANGE-SERVER') {
        this.changeServer();
      }
    });
  }


  validateInput(event: any, type): void {
    let value = event.target.value;
    value = this.onlyNumbers(value);
    event.target.value = value;  // Enforce numeric values
    var length = type == 'H' ? 12 : 59;
    // Correct value if it falls outside the specified range
    if (value !== '') {
      let num = parseInt(value, 10);
      if (num > length) {
        event.target.value = length;
      } else if (num < 0) {
        event.target.value = 0;
      }
    }
  }

  onlyNumbers(value: string): string {
    return value.replace(/[^0-9-]/g, '');  // Allow only numbers and dash (for negative numbers)
  }

  preventNonNumeric(event: KeyboardEvent): void {
    // Allow only backspace, delete, arrow keys, and numerics
    if (![8, 9, 13, 27, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 189].includes(event.keyCode) &&
      !event.ctrlKey && !event.metaKey && !(event.keyCode >= 96 && event.keyCode <= 105)) {
      event.preventDefault();
    }
  }

  handleMinuteInput(event: KeyboardEvent, hourInput: HTMLInputElement) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value.length === 0) {
      hourInput.focus();
    }
  }
  handleHourInput(event: KeyboardEvent, minInput: HTMLInputElement) {
    // if (event.keyCode === 38) {
    //   this.frm.patchValue({
    //     timeH: parseInt(this.frm.value.timeH) + 1
    //   });
    // }else if(event.keyCode === 40){
    //   this.frm.patchValue({
    //     timeH: parseInt(this.frm.value.timeH) - 1
    //   });
    // }
    const input = event.target as HTMLInputElement;
    if (input.value.length === 2) {
      minInput.focus();
    }
  }

  async changeServer() {
    this.data.permission = 'E';
    const dialogRef = this.dialog.open(AssignserversComponent,
      {
        width: '780px',
        height: 'fit-content',
        data: this.data,

      });
    dialogRef.afterClosed().subscribe(result => {
      delete this.data.permission;
    });
  }


  OnValueVarify(tm) {

    if (this.frm.value[tm]) {
      if (this.frm.value[tm].length == 1) {
        this.frm.patchValue({
          [tm]: '0' + this.frm.value[tm]
        })
      }
    }
  }

}
