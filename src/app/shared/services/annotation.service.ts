// src/app/shared/services/annotation.service.ts
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as AnnotationsActions from '../../store/annotations/annotations.actions';
import { selectAllAnnotations } from '../../store/annotations/annotations.selectors';

@Injectable({
  providedIn: 'root',
})
export class AnnotationService {
  annotations$: Observable<any[]> = this.store.select(selectAllAnnotations);

  constructor(private store: Store) { }

  addAnnotation(annotation: any) {
    console.log('addAnnotation annotation called', annotation);
    this.store.dispatch(AnnotationsActions.addAnnotation({ annotation }));
  }

  getAnnotationsByPage(page: number): Observable<any[]> {
    return this.annotations$.pipe(
      map(annotations => annotations.filter(annotation => annotation.page === page))
    );
  }

  getAnnotationsByid(id: String): Promise<any> {
    return new Promise((resolve, reject) => {
      this.annotations$.pipe(
        map(annotations => annotations.filter(annotation => annotation.Aid === id))
      ).subscribe((data) => {
        resolve(data);
      });
    })
  }
  getAnnotationsByHid1(id: number,page: number): Observable<any[]> {
    return this.annotations$.pipe(
      map(annotations => annotations.filter(annotation => annotation.Hid === id && annotation.page === page))
    );
  }
  getAnnotationsByHid(id: String): Promise<any> {
    return new Promise((resolve, reject) => {
      this.annotations$.pipe(
        map(annotations => annotations.filter(annotation => annotation.Hid === id))
      ).subscribe((data) => {
        resolve(data);
      });
    })
  }
  getAllAnnotations(): Observable<any[]> {
    return this.annotations$;
  }


  setAnnotations(annotations: any[]) {
    this.store.dispatch(AnnotationsActions.setAnnotations({ annotations }));
  }

  updateAnnotationsByAid(aid: string, newAnnotations: any[]) {
    this.annotations$.pipe(take(1)).subscribe(annotations => {
      console.log('each annotations',annotations.length, annotations)
      const updatedAnnotations = [
        ...annotations.filter(annotation => annotation.Aid !== aid),
        ...newAnnotations
      ];
      console.log('updatedAnnotations', updatedAnnotations);
      this.setAnnotations(updatedAnnotations);
    });
  }

  updateAnnotationByIdAndIcon(id: string, changes: any) {
    this.store.dispatch(AnnotationsActions.updateAnnotationByIdAndIcon({ id, changes }));
  }

  removeAnnotationsByAid(aid: string) {
    this.store.dispatch(AnnotationsActions.removeAnnotationsByAid({ aid }));
  }
  removeAnnotationsByHid(hid: string) {
   
    this.store.dispatch(AnnotationsActions.removeAnnotationsByHid({ hid }));
  }
}
