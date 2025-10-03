import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Annotation } from '../../models/annotation.interface';
import { AnnotationService } from '../../services/annotation/annotation.service';

@Component({
  selector: 'app-annotation-dialog',
  standalone: true,
  imports: [MatFormFieldModule,CommonModule,FormsModule,MatInputModule,MatDialogModule],
  templateUrl: './annotation-dialog.component.html',
  styleUrl: './annotation-dialog.component.scss'
})
export class AnnotationDialogComponent {
  annotation: Annotation;
  uniqueId: string;
  selectedText: string;

  constructor(
    private annotationService: AnnotationService,
    public dialogRef: MatDialogRef<AnnotationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.annotation =data ? data.annotation:[];
    this.uniqueId = this.annotation.id;
    this.selectedText = this.annotation.text;
  }

  ngOnInit(): void {}

  addAnnotation(): void {
    this.annotation.id = this.uniqueId;
    this.annotationService.addAnnotation(this.annotation.pageIndex, this.annotation);
    this.dialogRef.close(this.annotation); // Pass the annotation back when closing the dialog
  }

  closeDialog(): void {
    this.annotationService.clearTempAnnotation();
    this.dialogRef.close();
  }

  onSelectionChange(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.selectedText = selection.toString();
      this.annotation.text = this.selectedText;
    }
  }
}
