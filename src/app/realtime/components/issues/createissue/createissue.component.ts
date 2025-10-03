import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, ElementRef, Inject, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { CommonfunctionService } from '../../../../core/utility/commonfunction.service';
import { MatMenuModule } from '@angular/material/menu';
import { IssueListComponent } from '../issue-list/issue-list.component';
import { IssueService } from '../../../services/issue/issue.service';
import { TostbarService } from '../../../../core/services/tost/tostbar.service';
import { SecureStorageService } from '../../../../core/services/storage/secure-storage.service';
import { sessionDataMDL } from '../../../models/issue.interface';
import { ColorpickerComponent } from '../../../../shared/components/colorpicker2/colorpicker/colorpicker.component';



@Component({
  selector: 'app-createissue',
  standalone: true,
  providers: [IssueService],
  imports: [ColorpickerComponent, IconComponent, MatFormFieldModule, MatChipsModule, MatAutocompleteModule, ReactiveFormsModule, AsyncPipe, FormsModule, CommonModule, ButtonComponent, MatMenuModule, HttpClientModule],
  templateUrl: './createissue.component.html',
  styleUrl: './createissue.component.scss',
})
export class CreateissueComponent {
  // cClr: string = '#ff9163ff';
  cClr: string = '#ff9163';
  colorslist: any;
  selecteditem: any = '';
  tempitem: any;
  isLoading: boolean = false;

  issue_frm: FormGroup;

  fruitCtrl = new FormControl('');
  filteredFruits: Observable<string[]>;
  // categories: string[] = ['Claim 1', 'Claim 2'];
  categories: any = [];
  tempCat: any = [];
  current_session: sessionDataMDL = {} as sessionDataMDL;
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('colorPicker') colorPicker: ColorpickerComponent;
  announcer = inject(LiveAnnouncer);
  nUserid: any;
  isLoaded: boolean = true;
  previousIssue: any;
  constructor(private cs: CommonfunctionService, private cdr: ChangeDetectorRef, private store: SecureStorageService, public dialog: MatDialogRef<CreateissueComponent>, public issue: IssueService, private openDialog: MatDialog, public formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, private tost: TostbarService) {
    this.issue_frm = this.formBuilder.group({
      nIid: [0],
      cIName: ['', [Validators.required]],
      cCategory: new FormControl(''),
      nICid: new FormControl(''),
      permission: ['N'],
      cColor: [''],
    });
  }

  async ngOnInit() {
    this.nUserid = await this.store.getUserId();
    this.colorslist = [
      { cClr: '#ff8f63' },
    ];
    if (this.data) {
      this.current_session = this.data.current_session
      if (this.data.colorslist) {
        this.colorslist = this.data.colorslist.reverse()
      }
    };

    this.getCategory();
    if (this.data && this.data.type == 'E') {

      this.issue_frm.patchValue({
        cIName: this.data.value.cIName,
        nIid: this.data.value.nIid,
        nICid: this.data.value.nICid,
        permission: 'E',
        cColor: this.data.value.cColor,
      })
      this.cClr = '#' + this.data.value.cColor;
      // setTimeout(() => {
      //   this.colorPicker.onclr(this.hexToRGBA('#'+data.value.cColor));
      // }, 100);
      this.selecteditem = this.data.value.cCategory == 'Unassigned' ? '' : this.data.value.cCategory;
      this.cdr.detectChanges();
    }
    this.previousIssue = this.cClr;
    this.isLoaded = false;
  }

  async getCategory() {
    let cat = await this.issue.getCategory(this.current_session.nCaseid, this.nUserid);
    this.categories = cat;
    this.tempCat = this.categories;
  }

  add(event: any): void {

    const value = event.value;
    if (value) {
      this.selecteditem = value;
    }
  }


  selected(event: MatAutocompleteSelectedEvent): void {

    if (event.option.value.cCategory) {
      this.selecteditem = event.option.value.cCategory;
      this.issue_frm.patchValue({
        nICid: event.option.value.nICid
      })
    } else {
      this.selecteditem = event.option.value;
    }
    this.tempitem = '';
    // if (!this.categories.includes(this.selecteditem)) {
    if (!this.categories.filter(e => e.cCategory == this.selecteditem).length) {
      let mdl = {
        nICid: 0,
        nCaseid: this.current_session.nCaseid,
        cCategory: this.selecteditem,
        dCreateDt: this.cs.getCurrentTime(),
        nUserid: this.nUserid
      }
      this.issue.categoryCreation(mdl).then((res) => {
        if (res[0]["msg"] == 1) {
          this.isLoading = false;
          this.tost.openSnackBar('Category created successfully', '');
          this.categories.push({
            cCategory: this.selecteditem,
            nICid: res[0]["nICid"]
          });
          this.issue_frm.patchValue({
            nICid: res[0]["nICid"]
          })
        } else {
          this.isLoading = false;
          this.tost.openSnackBar(res[0]['message'], 'E');
        }
      });
    }
    setTimeout(() => {
      this.tempCat = this.categories;
    });
  }

  filterOptions(event) {
    let filterValue = event.target.value.toLowerCase();
    if (filterValue) {
      this.tempCat = this.categories.filter(category => category.cCategory.toLowerCase().includes(filterValue));
    } else {
      this.tempCat = this.categories;
    }
  }

  private _filter(value: string): string[] {

    const filterValue = value.toLowerCase();
    return this.categories.filter(fruit => fruit.cCategory.toLowerCase().includes(filterValue));
  }

  tempadd(ev) {
    this.tempitem = ev.target.value;
  }

  checktemp() {
    try {
      return this.categories.filter(e => e.cCategory == this.tempitem).length ? true : false;
    } catch (error) {
      return false;
    }
  }

  close() {
    this.dialog.close(false);
  }



  removeHash(colorCode: string): string {
    if (colorCode.startsWith('#')) {
      return colorCode.substring(1); // Remove the '#' character
    }
    return colorCode; // Return the original color code if it doesn't contain '#'
  }

  async submitForm() {

    this.isLoading = true;
    if (this.issue_frm.invalid) {
      this.isLoading = false;
      return;
    }
    let x = this.issue_frm.value;
    let nIDcatid = x.nICid;
    if (!nIDcatid) {
      let dts = this.categories.filter(e => e.cICtype == 'U');
      if (dts.length) {
        nIDcatid = dts[0].nICid
      } else {
        if (this.categories.find(a => a.cCategory == 'Unassigned')) {
          nIDcatid = this.categories.find(a => a.cCategory == 'Unassigned').nICid;
        } else {
          this.tost.openSnackBar('Please create category', 'E');
          return;
        }
      }
    }


    this.cClr = this.removeHash(this.cClr);

    let mdl = {
      nIid: x.nIid,
      cIName: x.cIName,
      cColor: this.cClr !== 'ff8f63' ? this.cClr : (x.cColor ? x.cColor : 'ff8f63'),
      nICid: nIDcatid,
      nCaseid: this.current_session.nCaseid,
    }

    if (x.permission == 'N') {
      mdl['dCreatedt'] = this.cs.getCurrentTime();
      mdl['nIid'] = 0;
      mdl['nUserid'] = this.nUserid;
      this.issue.issueCreation(mdl).then((res) => {
        if (res[0]["msg"] == 1) {
          this.isLoading = false;
          this.tost.openSnackBar('Issue created successfully', '');
          // this.issuelist();
          this.dialog.close(true);
        } else {
          this.isLoading = false;
          this.tost.openSnackBar(res[0]['message'], 'E');
        }
      });
    } else {
      mdl['dUpdatedt'] = this.cs.getCurrentTime();
      mdl['nUserid'] = this.nUserid;
      this.issue.issueUpdate(mdl).then((res) => {
        if (res[0]["msg"] == 1) {
          this.isLoading = false;
          this.tost.openSnackBar('Issue updated successfully', '');
          this.dialog.close({ type: 'E', nIid: x.nIid, cColor: (this.cClr !== 'ff8f63' ? this.cClr : (x.cColor ? x.cColor : 'ff8f63')), previousColor: this.previousIssue });
          // this.issuelist();
        } else {
          this.isLoading = false;
          this.tost.openSnackBar(res[0]['message'], 'E');
        }
      });
    }
  }

  // issuelist() {
  //   this.openDialog.open(IssueListComponent, {
  //     width: '519px',
  //     height: 'calc(100vh - 181px)',
  //     hasBackdrop: false,
  //     panelClass: ['issuemodel', 'noshadow'],
  //     position: {
  //       top: `151px`,
  //       right: `0px`,
  //     },
  //     data: {
  //       type: 'A',
  //       current_session: this.current_session,
  //     },
  //   });
  // }

  deleteIssue() {
    this.issue.issueDelete(this.data.value.nIid).then((res) => {
      if (res[0]["msg"] == 1) {
        this.tost.openSnackBar('Issue deleted successfully', '');

        this.dialog.close(true);
        // this.issuelist();
      } else {
        this.tost.openSnackBar(res[0]["message"], 'E');
      }
    })
  }


}
