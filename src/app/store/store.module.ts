// src/app/store/store.module.ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { annotationsReducer } from './annotations/annotations.reducer';
import { AnnotationsEffects } from './annotations/annotations.effects';
import { environment } from '../../environments/environment'; // Adjust the path as necessary

@NgModule({
  imports: [
    StoreModule.forRoot({ annotations: annotationsReducer }),
    EffectsModule.forRoot([AnnotationsEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
  ],
})
export class AppStoreModule {}
