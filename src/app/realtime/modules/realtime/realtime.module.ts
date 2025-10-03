import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { realtimeRoutingModule } from './realtime-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { IssueService } from '../../services/issue/issue.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,realtimeRoutingModule,HttpClientModule
  ],
  providers:[IssueService]
})
export class RealtimeModule { }
