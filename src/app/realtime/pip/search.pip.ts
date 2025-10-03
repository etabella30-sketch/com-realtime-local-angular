import { Pipe, PipeTransform } from '@angular/core';
import { SearchService } from '../services/search.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private ss: SearchService, private sanitizer: DomSanitizer) { }

  transform(value: string, searchTerm: string, currentMatchPosition: number, currentMatch: boolean, wholeWord: boolean = false, links: any[]): string {
    
    if (!searchTerm) {
      return this.wrapCurlyBraces(value, links); //this.sanitizer.bypassSecurityTrustHtml(this.wrapCurlyBraces(value));
      return value;
    }
    console.log(wholeWord)
    const wordBoundary = wholeWord ? '\\b' : '';
    const regex = new RegExp(`${wordBoundary}(${searchTerm})${wordBoundary}`, 'gi');
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(value)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const currentClass = currentMatch && start === currentMatchPosition ? 'current' : '';
      result += value.substring(lastIndex, start) + `<span class="highlight ${currentClass}">${value.substring(start, end)}</span>`;
      lastIndex = end;
    }

    result += value.substring(lastIndex);
    return this.wrapCurlyBraces(result, links);
    // return this.sanitizer.bypassSecurityTrustHtml(this.wrapCurlyBraces(result));
  }
  /* private wrapCurlyBraces(text: string,links:string[]): string { // links contant value like ["{A1}","{A3}"]
     
     return text.replace(/\{(.*?)\}/g, '<a  class="clickable-word cursor-pointer">{$1}</a>');
   }*/
  // private wrapCurlyBraces(text: string, links: string[]): string {
  //   // Use a Set for faster lookups
  //   const linksSet = new Set(links);

  //   // Replace only if the value exists in the links array
  //   return text.replace(/\{(.*?)\}/g, (match, content) => {
  //     if (linksSet.has(match)) {
  //       return `<a class="clickable-word cursor-pointer">${match}</a>`;
  //     }
  //     return match; // Return the original text if not in the links array
  //   });
  // }

  // private wrapCurlyBraces(text: string, links: string[]): string {
  //   
  //   // Use a Set for faster lookups
  //   const linksSet = new Set(links);
  //   // Replace placeholders and remove unmatched ones
  //   const result = text.replace(/\{(.*?)\}/g, (match, content) => {
  //     if (linksSet.has(content)) {
  //       return `<a class="clickable-word cursor-pointer">${content}</a>`;
  //     }
  //     return ''; // Remove unmatched placeholders
  //   });
  //   // Return the result only if it contains valid content, otherwise return an empty string
  //   return result.trim() === '' ? '' : result;
  // }
  private wrapCurlyBraces(text: string, links: string[]): string {
    
    // Use a Set for faster lookups
    const linksSet = new Set(links);
    // Replace placeholders and remove unmatched ones
    const result = text.replace(/\{(.*?)\}/g, (match, content) => {
      const fullMatch = `{${content}}`;
      if (linksSet.has(fullMatch)) {
        return `<a class="clickable-word cursor-pointer">{${content}}</a>`;
      }
      return ''; // Remove unmatched placeholders
    });
    // Return the result only if it contains valid content, otherwise return an empty string
    return result.trim() === '' ? '' : result;
  }

  // transform(value: string, searchTerm: string, currentMatchPosition: number, currentMatch: boolean, wholeWord: boolean = false, annots: annotIndex[] = []): SafeHtml {
  //   if (!searchTerm && (!annots || !annots?.length)) {
  //     return value;
  //   }

  //   let result = '';


  //   if (annots?.length) {
  //     
  //     value;
  //     // Apply annotations
  //     annots.forEach(annotation => {
  //       const { s, ln, color } = annotation;
  //       const annotationStart = s;
  //       const annotationEnd = annotationStart + ln;

  //       // Wrap the annotated text with a span
  //       // result = value;
  //       result = value.slice(0, annotationStart) +
  //         `<span class="annotation " style="background-color: #${color}a3;"  >${value.slice(annotationStart, annotationEnd)}</span>` +
  //         value.slice(annotationEnd);
  //     });
  //     return this.sanitizer.bypassSecurityTrustHtml(result);

  //   }

  //   const wordBoundary = wholeWord ? '\\b' : '';
  //   const regex = new RegExp(`${wordBoundary}(${searchTerm})${wordBoundary}`, 'gi');
  //   let lastIndex = 0;
  //   let match;

  //   // Highlight search terms
  //   while ((match = regex.exec(value)) !== null) {
  //     const start = match.index;
  //     const end = start + match[0].length;
  //     const currentClass = currentMatch && start === currentMatchPosition ? 'current' : '';
  //     result += value.substring(lastIndex, start) + `<span class="highlight ${currentClass}">${value.substring(start, end)}</span>`;
  //     lastIndex = end;
  //   }

  //   result += value.substring(lastIndex);



  //   return this.sanitizer.bypassSecurityTrustHtml(result); //result;
  // }


  // transform(value: string, searchTerm: string, currentMatchPosition: number, currentMatch: boolean, wholeWord: boolean = false, annots: annotIndex[] = []): SafeHtml {
  //   if (!searchTerm && (!annots || !annots.length)) {
  //     return value;
  //   }

  //   let result = value;

  //   // Apply annotations
  //   if (annots.length) {
  //     
  //     annots.sort((a, b) => b.s - a.s); // Sort annotations by start index in descending order to avoid index issues
  //     annots.forEach(annotation => {
  //       const { s, ln, color } = annotation;
  //       const annotationStart = s;
  //       const annotationEnd = annotationStart + ln;
  //       result = result.slice(0, annotationStart) +
  //         `<span class="annotation" style="background-color: #${color}a3;">${result.slice(annotationStart, annotationEnd)}</span>` +
  //         result.slice(annotationEnd);
  //     });
  //   }

  //   // Highlight search terms
  //   if (searchTerm) {
  //     const wordBoundary = wholeWord ? '\\b' : '';
  //     const regex = new RegExp(`${wordBoundary}(${searchTerm})${wordBoundary}`, 'gi');
  //     let lastIndex = 0;
  //     let match;
  //     let searchResult = '';

  //     while ((match = regex.exec(result)) !== null) {
  //       const start = match.index;
  //       const end = start + match[0].length;
  //       const currentClass = currentMatch && start === currentMatchPosition ? 'current' : '';
  //       searchResult += result.substring(lastIndex, start) + `<span class="highlight ${currentClass}">${result.substring(start, end)}</span>`;
  //       lastIndex = end;
  //     }

  //     searchResult += result.substring(lastIndex);
  //     result = searchResult;
  //   }

  //   return this.sanitizer.bypassSecurityTrustHtml(result);
  // }


}