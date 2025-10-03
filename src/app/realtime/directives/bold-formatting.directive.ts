import { Directive, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { TextFormattingService } from '../services/text-formatting.service';

@Directive({
  selector: '[appBoldFormatting]', standalone: true
})
export class BoldFormattingDirective {
    @Input() textContent: string;
    @Input() currentIndex: number;
    @Input() isFirstLineOfPage: boolean;
  
    constructor(private el: ElementRef, private textFormattingService: TextFormattingService) {}
  
    ngOnInit(): void {
      this.applyBoldFormatting();
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      if (changes['textContent'] || changes['currentIndex']) {
        this.applyBoldFormatting();
      }
    }
  
    private applyBoldFormatting(): void {
        this.textContent = this.textContent.toUpperCase()
      if (this.isFirstLineOfPage) {
        this.textFormattingService.resetBoldState();
      }
  
      if (this.textContent.startsWith('Q.')) {
        this.textFormattingService.setIsBold(true);
      } else if (this.textContent.startsWith('A.')) {
        this.textFormattingService.setIsBold(false);
      }
  
      if (this.textFormattingService.getIsBold()) {
        this.el.nativeElement.style.fontWeight = 'bold';
      } else {
        this.el.nativeElement.style.fontWeight = 'normal';
      }
    }
  }