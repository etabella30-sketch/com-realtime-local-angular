import { Component, Inject, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeedData } from '../../models/data.interface';

@Component({
  selector: 'app-live-feed-dialog',standalone: true,imports:[MatFormFieldModule],
  templateUrl: './live-feed-dialog.component.html',
  styleUrls: ['./live-feed-dialog.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LiveFeedDialogComponent {
  @ViewChild('textArea') textArea!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<LiveFeedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { updateFeedData: (data: FeedData) => void,
       baseLineNumber: number, 
      previousInputText: string }
  ) {}

  onInput(event: Event): void {
    const textArea = this.textArea.nativeElement;
    textArea.scrollTop = textArea.scrollHeight;

    const inputText = (event.target as HTMLTextAreaElement).value;
    const lines = inputText.split('\n');
    const lineData = lines.map((line, index) => {
      const asciiValue = line.split('').map(char => char.charCodeAt(0));
      return { time: new Date().toLocaleTimeString(), asciiValue, inCommingLineNo: this.data.baseLineNumber + index };
    });

    const feedData: FeedData = {
      i: this.data.baseLineNumber + lineData.length,
      d: lineData.slice(-2),
      date: new Date().getTime()
    };

    this.data.updateFeedData(feedData);
    this.data.previousInputText = inputText;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
