import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Annotation, param_highLightIssueIds, param_lastIssue } from '../../models/annotation.interface';


@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private highLightIssueIds: param_highLightIssueIds[] = [];
  private lastIssue: param_lastIssue = { nIid: null, cColor: '' };
  private annotations: { [pageIndex: number]: Annotation[] } = {};
  private annotationsSubject: BehaviorSubject<{ [pageIndex: number]: Annotation[] }> = new BehaviorSubject(this.annotations);
  private localStorageKey = 'annotations';
  tempAnnotation: Annotation = { nIDid: null, pageIndex: 0, color: '', cordinates: [] };
  private selectedIssuesHighlight: any = [];


  annot_issues: param_highLightIssueIds[] = [];
  annot_lastid: param_lastIssue = { nIid: null, cColor: '' };

  constructor() {
    this.loadAnnotationsFromLocalStorage();
  }
  setHighLightIssueIds(highLightIssueIds: param_highLightIssueIds[]) {
    this.highLightIssueIds = highLightIssueIds;
  }

  getHighLightIssueIds() {
    return this.highLightIssueIds;
  }

  setLastIssue(lastIssue: param_lastIssue) {
    this.lastIssue = lastIssue;
  }

  getLastIssue() {
    return this.lastIssue;
  }
////////////////////////
  setAnnoLastIssue(lastIssue: param_lastIssue) {
    this.annot_lastid = lastIssue;
  }

  getAnnotLastIssue() {
    return this.annot_lastid;
  }


  setAnnotsIssueIds(annot_issues: param_highLightIssueIds[]) {
    this.annot_issues = annot_issues;
  }

  getAnnotsIssueIds() {
    return this.annot_issues;
  }



  getAnnotations(pageIndex: number): Observable<Annotation[]> {
    return new Observable(observer => {
      this.annotationsSubject.subscribe(annotations => {
        observer.next(annotations[pageIndex] || []);
      });
    });
  }

  setTempAnnotation(annotation: Annotation): void {
    if (annotation)
      for (let x of Object.keys(annotation)) {
        this.tempAnnotation[x] = annotation[x];
      }
  }

  getTempAnnotation(): Annotation {
    return this.tempAnnotation;
  }


  clearTempAnnotation(): void {
    this.tempAnnotation["temp"] = false;
    this.tempAnnotation["id"] = '';
    this.tempAnnotation["text"] = '';
    this.tempAnnotation["nIDid"] = null;
    this.tempAnnotation["pageIndex"] = 0;
    this.tempAnnotation["color"] = '';
    this.tempAnnotation["cordinates"] = [];
    this.tempAnnotation["nICount"] = 0;
  }

  addAnnotation(pageIndex: number, annotation: Annotation): void {
    if (!this.annotations[pageIndex]) {
      this.annotations[pageIndex] = [];
    }
    this.annotations[pageIndex].push(annotation);
    this.annotationsSubject.next(this.annotations);
    this.saveAnnotationsToLocalStorage();
  }

  deleteAnnotation(pageIndex: number, annotationId: string): void {
    if (this.annotations[pageIndex]) {
      this.annotations[pageIndex] = this.annotations[pageIndex].filter(annotation => annotation.id !== annotationId);
      this.annotationsSubject.next(this.annotations);
      this.saveAnnotationsToLocalStorage();
    }
  }

  listAnnotations(pageIndex: number): Annotation[] {
    return this.annotations[pageIndex] || [];
  }

  saveAnnotationsToLocalStorage(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.annotations));
  }

  loadAnnotationsFromLocalStorage(): void {
    const savedAnnotations = localStorage.getItem(this.localStorageKey);
    if (savedAnnotations) {
      this.annotations = JSON.parse(savedAnnotations);
      this.annotationsSubject.next(this.annotations);
    }
  }

  clearAnnotations(): void {
    this.annotations = {};
    this.annotationsSubject.next(this.annotations);
    localStorage.removeItem(this.localStorageKey);
  }
}
