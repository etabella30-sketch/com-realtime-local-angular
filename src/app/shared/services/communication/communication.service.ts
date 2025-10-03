import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private functionCallSource = new Subject<any>();

  functionCalled$ = this.functionCallSource.asObservable();

  callFunction(data: any) {
    this.functionCallSource.next(data);
  }
}
