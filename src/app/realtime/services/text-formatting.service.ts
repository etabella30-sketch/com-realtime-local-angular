import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextFormattingService {
  private isBold: boolean = false;

  setIsBold(value: boolean): void {
    this.isBold = value;
  }

  getIsBold(): boolean {
    return this.isBold;
  }

  resetBoldState(): void {
    this.isBold = false;
  }
}
