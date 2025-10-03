// src/app/store/annotations/annotations.selectors.ts
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectAnnotationsState = createFeatureSelector<any[]>('annotations');

export const selectAllAnnotations = createSelector(
  selectAnnotationsState,
  (state: any[]) => state
);
