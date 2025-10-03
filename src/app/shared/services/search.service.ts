// src/app/shared/services/search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public searchTerm: string = '';
  private matches: { page: number, line: number, position: number }[] = [];
  private currentMatchIndex: number = 0;

  isSearching: boolean = false;
  matches$ = new BehaviorSubject<{ page: number, line: number, position: number }[]>([]);
  currentMatch$ = new BehaviorSubject<{ index: number, flag: boolean }>({ index: 0, flag: true });

  constructor() { }

  search(term: string, data: any[], wholeWord: boolean) {
    let matchCase: boolean = !wholeWord;
    this.searchTerm = matchCase ? term : term.toLowerCase();
    if (term === '') {
      this.reset();
      return;
    }
    this.matches = [];
    const regexFlags = matchCase ? 'g' : 'gi';
    let regexTerm = term;
    if (wholeWord) {
      regexTerm = `\\b${term}\\b`;
    }
    const regex = new RegExp(regexTerm, regexFlags);

    data.forEach((page, pageIndex) => {
      page.data.forEach((line, lineIndex) => {
        let text = line.lines.join(' ');
        if (!matchCase) {
          text = text.toLowerCase();
        }
        let match;
        while ((match = regex.exec(text)) !== null) {
          this.matches.push({ page: pageIndex, line: lineIndex, position: match.index });
        }
      });
    });

    this.matches$.next(this.matches);
    this.currentMatchIndex = 0;

    this.currentMatch$.next({ index: this.currentMatchIndex, flag: true });
  }

  private reset() {
    this.searchTerm = '';
    this.matches = [];
    this.currentMatchIndex = 0;
    this.matches$.next(this.matches);
    this.currentMatch$.next({ index: this.currentMatchIndex, flag: true });
    this.isSearching = false;
  }

  nextMatch() {
    if (this.matches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
    this.currentMatch$.next({ index: this.currentMatchIndex, flag: true });
  }

  previousMatch() {
    if (this.matches.length === 0) return;
    this.currentMatchIndex =
      (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length;
    this.currentMatch$.next({ index: this.currentMatchIndex, flag: false });
  }

  getCurrentMatch() {
    return this.matches[this.currentMatchIndex];
  }
  

}
