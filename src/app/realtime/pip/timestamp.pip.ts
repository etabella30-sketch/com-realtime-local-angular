import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp',
  standalone: true
})
export class timestampPipe implements PipeTransform {
  constructor() { }

  transform(value: string): string {
    if (!value) return value;
    try {

      // split on “:”, take only the first three segments (hh, mm, ss)
      const parts = value.split(':');
      const trimmed = parts.slice(0, 3).join(':');
      // if you still need to sanitize / wrap, do it here:
      // return this.sanitizer.bypassSecurityTrustHtml(this.wrapCurlyBraces(trimmed)) as string; 
      return trimmed;
    } catch (error) {
      return value;
    }
    
  }



}
