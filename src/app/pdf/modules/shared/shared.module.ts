import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';



@NgModule({
  declarations: [],
  imports: [
    CommonModule, NgxExtendedPdfViewerModule
  ], 
  exports: [NgxExtendedPdfViewerModule]
})
export class PdfSharedModule { }
