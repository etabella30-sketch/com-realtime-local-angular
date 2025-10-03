import { Directive, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[init]',            // ← any element with the `init` attribute
  standalone:true
})
export class InitDirective implements AfterViewInit {
  // Alias the output so you still write `(init)="…"` in templates:
  @Output('init') init = new EventEmitter<HTMLElement>();

  constructor(private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    // emit the native element once it's in the DOM
    this.init.emit(this.host.nativeElement);
  }
}
