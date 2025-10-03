// src/app/components/search-bar/search-bar.component.ts
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MatMenuModule } from '@angular/material/menu';
import { InputComponent } from '../../../shared/components/input_old/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SearchService } from '../../services/search.service';
import { FeedDisplayService } from '../../services/feed-display.service';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-search-bar', standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  imports: [CommonModule, FormsModule, IconComponent, MatMenuModule, InputComponent, ButtonComponent, MatCheckboxModule,MatTooltipModule],
})
export class SearchBarComponent {
  @Input() data: any[] = [];
  searchTerm: string = '';
  menustate: string = 'C';
  wholeWord: boolean = false;
  matchCase: boolean = false;
  menushow: boolean = false;
  private dataSubscription: Subscription;
  isSearching: boolean = false;
  constructor(public searchService: SearchService, private cdr: ChangeDetectorRef, private fds: FeedDisplayService) { }

  ngOnInit() {
    //  this.dataSubscription= this.fds.feedData$.subscribe((data)=>{
    //   // console.warn('search bar subscriptiondata',data.length)
    //     this.data=data;
    //   })
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();  // Clean up the subscription
    }
  }

  onSearch() {
    if (this.searchTerm == '') {
      this.searchService.searchTerm = null
      this.searchService.matches$.next([]);
      this.cdr.detectChanges();
      return;
    }
    this.data = this.fds.getData();
    this.isSearching = true;
    this.searchService.search(this.searchTerm, this.data, this.wholeWord,this.matchCase);
    this.isSearching = false;
  }

  onNext() {
    this.searchService.nextMatch();
  }

  onPrevious() {
    this.searchService.previousMatch();
  }

  get totalMatches() {
    return this.searchService.matches$.value.length;
  }

  get currentMatch() {
    return this.searchService.currentMatch$.value + 1;
  }

  get currentPage() {
    const currentMatch = this.searchService.getCurrentMatch();
    return currentMatch ? currentMatch.page + 1 : 1;
  }

  closeMenu() {
    this.menustate = 'C';
  }
  openMenu() {
    this.menustate = 'O';
  }
  focusinput(input) {
    setTimeout(() => {
      input.focus();
    }, 100);
  }

  toggleSearch() {
    this.menushow = !this.menushow;
    if(!this.menushow){
      this.searchTerm = '';
      this.onSearch()
    }
    this.cdr.detectChanges();
  }

  blurinput() {
   
    setTimeout(() => {
      // this.menushow = false;
      if (!this.searchTerm) {
        this.menushow = false;
        this.closeMenu();
        this.cdr.detectChanges();
      }
    }, 200);
  }

}