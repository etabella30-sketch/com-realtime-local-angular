import { Component, Inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../shared/services/session.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sharelink',
  standalone: true,
  providers: [SessionService],
  imports: [InputComponent, ButtonComponent,FormsModule,HttpClientModule],
  templateUrl: './sharelink.component.html',
  styleUrl: './sharelink.component.scss'
})
export class SharelinkComponent {
  link:any;
  constructor( private dialogRef: MatDialogRef<SharelinkComponent>,public sessionService:SessionService, @Inject(MAT_DIALOG_DATA) public data: any) { 

    this.link = `https://etabella.legal/realtime/livefeed/` + btoa(`{"nSesid":${this.data.nSesid}}`);
  }

  copyLink() {
    navigator.clipboard.writeText(this.link).then(() => {
      console.log('Text copied successfully!');
      this.sessionService.show('copied!');
    }, (err) => {
      console.error('Failed to copy text: ', err);
    });
  }

}
