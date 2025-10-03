import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataGenerationService {
  private sessionId: string;
  private userName: string;
  private sd: any;
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userName = 'User_' + Math.floor(Math.random() * 1000);
    this.sd = this.getSessionDetails();
  }

  private generateSessionId(): string {
    return 'session_' + Math.floor(Math.random() * 100000);
  }

  getSessionDetails() {
    return {
      lastPage: 20,
      lastLineNumber: 30, // Random line number between 1 and 25 for the last page
      sessionId: this.sessionId,
      userName: this.userName,
      settings: {
        lineNumber: 40,
        startPage: 1,
      },
    };
  }

  generatePreviousFetchData(pages: number): any[] {

    const previousData = [];
    for (let i = 1; i <= pages; i++) {
      const lines = i === pages ? this.sd.lastLineNumber : this.sd.settings.lineNumber; // Use lastLineNumber for the last page

      const pageData = this.generateMockPreviousPageData(i, lines);
      previousData.push(pageData);
    }
    return previousData;
  }

  generatePreviousFetchDataByPage(pages: number): any[] {
    const previousData = [];
    //for (let i = 1; i <= pages; i++) {
    //    const lines = i === pages ? lastLineNumber : 25; // Use lastLineNumber for the last page
    const pageData = this.generateMockPreviousPageData(pages, 25);
    previousData.push(pageData);
    //   }
    return previousData;
  }

  private generateMockPreviousPageData(pageNumber: number, linesPerPage: number) {
    const lines = [];
    const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?";
    let questionInserted = false;

    for (let i = 1; i < linesPerPage + 1; i++) {
      const timestamp = this.formatTimestamp(new Date());
      let lineText = this.generateRandomSentence();

      if (!questionInserted && Math.random() > 0.8) {
        lineText = `Q. ${lineText}`;
        questionInserted = true;
      } else if (questionInserted && Math.random() > 0.5) {
        lineText = `A. ${lineText}`;
        questionInserted = false;
      } else {
        for (let j = 0; j < 3; j++) {
          const randomIndex = Math.floor(Math.random() * lineText.length);
          const randomChar = specialChars.charAt(Math.floor(Math.random() * specialChars.length));
          lineText = lineText.slice(0, randomIndex) + randomChar + lineText.slice(randomIndex + 1);
        }
      }

      const asciiValues = this.generateAsciiValuesFromText(lineText);
      lines.push([timestamp, asciiValues, i]);
    }
    return {
      msg: pageNumber,
      page: pageNumber,
      data: JSON.stringify(lines),
      nSesid: Math.floor(Math.random() * 1000)
    };
  }

  private generateRandomSentence() {
    const words = ["This", "is", "a", "sample", "sentence", "for", "the", "data", "generation", "service", "to", "simulate", "real", "paragraphs", "and", "conversations", "with", "spaces", "and", "minimal", "special", "characters"];
    const sentenceLength = Math.floor(Math.random() * 10) + 5;
    let sentence = "";
    for (let i = 0; i < sentenceLength; i++) {
      sentence += words[Math.floor(Math.random() * words.length)] + " ";
    }
    return sentence.trim();
  }

  private generateAsciiValuesFromText(text: string): number[] {
    const asciiValues = [];
    for (let i = 0; i < text.length; i++) {
      asciiValues.push(text.charCodeAt(i));
    }
    return asciiValues;
  }

  parsePreviousFetchData(previousData: any): any[] {
    return previousData.map((page: any) => {
      
      const parsedData = JSON.parse(page.data).map((line: any) => (line ? {
        time: line[0],
        asciiValue: line[1],
        lineIndex: line[2],
        lines: [String.fromCharCode(...line[1])]
      } : {
        time: '',
        asciiValue: '',
        lineIndex: '',
        lines: [1]

      }));
      return {
        msg: page.msg,
        page: page.page,
        data: parsedData
      };
    });
  }

  private formatTimestamp(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }




}
