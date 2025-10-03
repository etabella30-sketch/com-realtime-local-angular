// src/app/store/annotations/annotations.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as AnnotationsActions from './annotations.actions';
import { AnnotationService } from '../../shared/services/annotation.service';

@Injectable()
export class AnnotationsEffects {
  loadAnnotations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AnnotationsActions.loadAnnotations),
      mergeMap(() =>
        this.annotationService.annotations$.pipe(
          map((annotations) =>
            AnnotationsActions.annotationsLoaded({ annotations })
          ),
          catchError(() => of({ type: '[Annotations] Load Annotations Failed' }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private annotationService: AnnotationService
  ) {}
}
