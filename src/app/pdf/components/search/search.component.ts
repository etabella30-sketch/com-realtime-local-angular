import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toolEvents } from '../../interfaces/pdf.interface';
import { PdfSharedModule } from '../../modules/shared/shared.module';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pdfsearch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdfSharedModule, FormsModule, ButtonComponent, MatCheckboxModule, IconComponent, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnChanges {
  @Input() cSearch: string = '';
  @Input() matchCase: boolean = false;
  @Input() wholeWords: boolean = false;
  @Input() totalSearch: number = 0;
  @Input() currentSearch: number = 0;
  @Input() isSearching: boolean = false;
  @Input() isfullmode: boolean = false;
  @Output() searchEvents = new EventEmitter<toolEvents>();
  @Output() ValueUpdate = new EventEmitter<toolEvents>();
  searching_value: string = '';
  constructor(private cdr: ChangeDetectorRef) { }
  find() {
    this.OnKeyUp(null);
    if (this.searching_value == this.cSearch) {
      this.findNext();
      return
    }
    this.searching_value = this.cSearch;
    this.cdr.detectChanges();
    this.searchEvents.next({ event: 'SEARCH', data: { cSearch: this.cSearch, options: { matchCase: this.matchCase, wholeWords: this.wholeWords, highlightAll: true } } });
  }

  findPrevious() {
    this.searchEvents.next({ event: 'SEARCH_PREVIOUS', data: { cSearch: this.cSearch, options: { matchCase: this.matchCase, wholeWords: this.wholeWords, highlightAll: true } } });
  }

  findNext() {
    this.searchEvents.next({ event: 'SEARCH_NEXT', data: { cSearch: this.cSearch, options: { matchCase: this.matchCase, wholeWords: this.wholeWords, highlightAll: true } } });
  }
  OnKeyUp(e) {
    this.ValueUpdate.next({ event: 'VALUE_UPDATE', data: { cSearch: this.cSearch, options: { matchCase: this.matchCase, wholeWords: this.wholeWords, highlightAll: true } } });
  }

  ngOnInit(): void {
    
    if (this.cSearch) {
      this.find();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (changes["totalSearch"]) {
      this.cdr.detectChanges();
    }
    if (changes["isSearching"]) {
      this.cdr.detectChanges();
    }
  }

  close() {
    let close: any = { event: 'close' };
    this.searchEvents.next(close);
  }

}
