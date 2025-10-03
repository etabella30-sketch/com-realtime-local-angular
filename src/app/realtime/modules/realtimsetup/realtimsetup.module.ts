import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RealtimsetupRoutingModule } from './realtimsetup-routing.module';
import { IssuesService } from '../../../shared/services/issues.service';
import { HttpClientModule } from '@angular/common/http';
import { annotationsReducer } from '../../../store/annotations/annotations.reducer';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AnnotationsEffects } from '../../../store/annotations/annotations.effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RealtimsetupRoutingModule,
    HttpClientModule,
   
  ],
  providers: [IssuesService],


})
export class RealtimsetupModule { }
