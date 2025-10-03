import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PdfRoutingModule } from './pdf-routing.module';
import { AuthInterceptor } from '../../../core/interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ToolService } from '../../service/tool.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PdfRoutingModule, HttpClientModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, ToolService]
})
export class PdfModule { }
