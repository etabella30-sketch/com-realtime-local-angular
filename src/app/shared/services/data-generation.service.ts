// src/app/shared/services/data-generation.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataGenerationService {
  private dataSubject = new Subject<any>();
  data$ = this.dataSubject.asObservable();

  private totalPages: number;
  private data: any[] = [];

  constructor() {
    this.totalPages = 0;
  }

  generateFeedData(page: number): any {
    const data = {
      msg: `Page ${page}`,
      page: page,
      data: Array.from({ length: 25 }, (_, i) => ({
        time: Date.now(),
        asciiValue: Array.from({ length: 20 }, () => Math.floor(Math.random() * 128)),
        lines: [`Line text ${i + 1}`],
      })),
    };
    return data;
  }
  sendData(data: any) {
    this.dataSubject.next(data);
  }
}
