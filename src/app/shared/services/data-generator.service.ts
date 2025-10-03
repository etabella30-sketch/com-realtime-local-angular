// data-generator.service.ts
import { Injectable } from '@angular/core';

export interface FeedData {
  msg: string;
  page: number;
  data: [number, number[], string[]][];
}

@Injectable({
  providedIn: 'root'
})
export class DataGeneratorService {
  generateRandomLineText(): string {
    const length = Math.floor(Math.random() * 20) + 5; // Random length between 5 and 24
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  generateFeedData(numPages: number): FeedData[] {
    const feedData: FeedData[] = [];

    for (let page = 1; page <= numPages; page++) {
      const numLines = Math.floor(Math.random() * 26); // Random number of lines (0-25)
      const pageData: FeedData = {
        msg: `Page ${page} data`,
        page,
        data: [],
      };

      for (let line = 1; line <= numLines; line++) {
        const lineText = this.generateRandomLineText();
        const asciiValues = lineText.split('').map((char) => char.charCodeAt(0));
        const timestamp = Date.now();

        pageData.data.push([timestamp, asciiValues, [lineText]]);
      }

      feedData.push(pageData);
    }

    return feedData;
  }
}