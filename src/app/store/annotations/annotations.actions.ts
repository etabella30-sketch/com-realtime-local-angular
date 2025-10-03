// src/app/store/annotations/annotations.actions.ts
import { createAction, props } from '@ngrx/store';

export const addAnnotation = createAction(
  '[Annotations] Add Annotation',
  props<{ annotation: any }>()
);

export const loadAnnotations = createAction('[Annotations] Load Annotations');
export const annotationsLoaded = createAction(
  '[Annotations] Annotations Loaded',
  props<{ annotations: any[] }>()
);

export const removeAnnotationsByAid = createAction(
  '[Annotations] Remove Annotations By Aid',
  props<{ aid: string }>()
);

export const removeAnnotationsByHid = createAction(
  '[Annotations] Remove Annotations By Hid',
  props<{ hid: string }>()
);


export const updateAnnotationByIdAndIcon = createAction(
  '[Annotations] Update Annotation By ID and Icon',
  props<{ id: string; changes: any }>()
);

export const updateAnnotation = createAction(
  '[Annotations] Update Annotation',
  props<{ annotation: any }>()
);

export const setAnnotations = createAction(
  '[Annotations] Set Annotations',
  props<{ annotations: any[] }>()
);