// src/app/store/annotations/annotations.reducer.ts
import { createReducer, on } from '@ngrx/store';
import * as AnnotationsActions from './annotations.actions';

export const initialState: any[] = [];

const _annotationsReducer = createReducer(
  initialState,
  on(AnnotationsActions.addAnnotation, (state, { annotation }) => [
    ...state,
    annotation,
  ]),
  on(AnnotationsActions.annotationsLoaded, (state, { annotations }) => [
    ...annotations,
  ]),

  on(AnnotationsActions.updateAnnotationByIdAndIcon, (state, { id, changes }) =>
    state.map(annotation => 
      annotation.Aid === id && annotation.isIcon
        ? { ...annotation, ...changes }
        : annotation
    )
  ),
  on(AnnotationsActions.updateAnnotation, (state, { annotation }) =>
    state.map(ann => ann.id === annotation.id ? { ...annotation } : ann)
  ),
  on(AnnotationsActions.setAnnotations, (state, { annotations }) => [
    ...annotations
  ]),
  on(AnnotationsActions.removeAnnotationsByAid, (state, { aid }) =>
    state.filter(annotation => annotation.nPenId != aid)
  ),
  on(AnnotationsActions.removeAnnotationsByHid, (state, { hid }) =>
    state.filter(annotation => annotation.Hid != hid)
  )

  
);

export function annotationsReducer(state: any, action: any) {
  return _annotationsReducer(state, action);
}
