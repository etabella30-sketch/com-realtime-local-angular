import { Injectable } from '@angular/core';


import * as levenshtein from 'fast-levenshtein';
import Fuse from 'fuse.js';

//import * as levenshtein from 'levenshtein';
//declare var difflib:any
@Injectable({
  providedIn: 'root'
})
export class TextCoordinateService {
  //  private dmp = new diff_match_patch();
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    const oldText = 'This is the old text.';
    const newText = 'This is the new text.';

  }

  calculateTextCoordinates(font: string, data: { search: string, destination: string, isBold: boolean }, curIndex, totalLength): { x: number, y: number, width: number, endX: number } {

    let idx = this.findIndices(data.search.toLowerCase(), data.destination.toLowerCase());
    let line = data.destination;
    ///let index = ((totalLength>1 && (curIndex+1)==totalLength) || totalLength>1 ) ? 0 :  idx.startIndex;
    let index = curIndex == 0 ? idx.startIndex : 0;
    let length = line.length;
    length = (curIndex + 1) == totalLength ? idx.endIndex : length;
    const highlight = line.substring(index, length);
    // console.warn(line,'\n',data.search, '\ncalculateTextCoordinates',index,length)
    const prefix = line.slice(0, index);
    // bold
    font = `${data?.isBold ? 'bold ' : ''}15px ` + font;
    // console.log('new font = ',font)
    // console.log('font',line,'index',index,'length',length,'highlight',highlight,'prefix',prefix,'font',font)

    const xCoordinate = this.measureText(prefix, font);
    const highlightWidth = this.measureText(highlight, font);
    //    console.warn('prefix',prefix,'\nhighlight',highlight,'\nhighlightWidth',highlightWidth,'\n\n')
    // Assuming a fixed y-coordinate for simplicity
    const yCoordinate = 20; // Example y-coordinate
    //console.log('return frm calculateTextCoordinates',{  x: xCoordinate+108,  width: highlightWidth,  })
    return {
      x: xCoordinate + 108,
      y: yCoordinate,
      width: index == -1 ? 0 : highlightWidth,
      endX: xCoordinate + highlightWidth,
    };
  }

  private measureText(text: string, font: string): number {

    this.context.font = font;
    const metrics = this.context.measureText(text);
    // console.log('measureText = ',text,font,metrics.width)
    return metrics.width;
  }




  findStartIndex(data: { search: string, destination: string }): number {
    let searchWords = data.search.split(' ');

    let startIndex = -1;
    let matchedWordIndex = -1;
    let matchedWord = '';

    // Find the first matching whole word in the destination
    for (let word of searchWords) {
      let regex = new RegExp(`\\b${word}\\b`);
      let match = regex.exec(data.destination);
      matchedWordIndex = match ? match.index : -1;
      if (matchedWordIndex !== -1) {
        matchedWord = word;
        break; // Exit the loop once a match is found
      }
    }
    if (matchedWordIndex === -1) {
      //console.log("No whole word match found, searching for substrings...");
      matchedWordIndex = data.destination.indexOf(data.search);
      // console.log(matchedWordIndex)
      matchedWord = data.search;
    }
    if (matchedWordIndex !== -1) {
      // Calculate the prefix length up to the matched word
      let prefix = data.search.slice(0, data.search.indexOf(matchedWord));
      let prefixLength = prefix.length;

      // Calculate final index by adjusting with prefix length
      startIndex = matchedWordIndex - prefixLength;
      return startIndex;
    } else {
      return -1;
    }
  }

  findLastIndex(data: { search: string, destination: string }, startIndex: number): number {
    let searchWords = data.search.split(' ');
    let destinationSubstring = data.destination.slice(startIndex);

    let lastIndex = -1;
    let matchedWordIndex = -1;
    let matchedWord = '';

    // Find the last matching whole word in the destination substring
    for (let word of searchWords.reverse()) {
      let regex = new RegExp(`\\b${word}\\b`);
      let match = regex.exec(destinationSubstring);
      matchedWordIndex = match ? match.index : -1;
      if (matchedWordIndex !== -1) {
        matchedWord = word;
        break; // Exit the loop once a match is found
      }
    }

    if (matchedWordIndex !== -1) {
      // Calculate the suffix length from the matched word to the end
      let suffix = data.search.slice(data.search.indexOf(matchedWord) + matchedWord.length);
      let suffixLength = suffix.length;

      // Calculate final index by adjusting with suffix length
      lastIndex = startIndex + matchedWordIndex + matchedWord.length + suffixLength;
      return lastIndex;
    } else {
      return -1;
    }
  }
  /*
findIndices(searchText: string, destinationText: string): { startIndex: number, endIndex: number } {
  searchText = searchText.trim().toLowerCase()?.replace(/'{2,}/g, "'");;
  destinationText = destinationText.toLowerCase();

  // Exact substring match first
  let exactIndex = destinationText.indexOf(searchText);
  if (exactIndex !== -1) {
    return { startIndex: exactIndex, endIndex: exactIndex + searchText.length };
  }

  // Fuzzy search fallback
  let minDistance = Infinity;
  let bestStart = -1;
  let bestEnd = -1;

  for (let i = 0; i <= destinationText.length - searchText.length; i++) {
    const sub = destinationText.substring(i, i + searchText.length);
    const distance = levenshtein.get(searchText, sub);

    if (distance < minDistance) {
      minDistance = distance;
      bestStart = i;
      bestEnd = i + searchText.length;
    }
  }

  return { startIndex: bestStart, endIndex: bestEnd };
}*/
  findIndices(searchText: string, destinationText: string): { startIndex: number, endIndex: number } {
    // Normalize curly quotes to straight for both sides
    const normQuotes = (s: string) => s.replace(/[\u2018\u2019]/g, "'");
    const destOriginal = normQuotes(destinationText);
    const search = normQuotes(searchText).trim().replace(/'{2,}/g, "'");

    // --- Exact match allowing variable whitespace ---
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const whitespaceFlexible = escaped.replace(/\s+/g, "\\s+");
    const re = new RegExp(whitespaceFlexible, "i"); // i = case-insensitive
    const m = re.exec(destOriginal);
    if (m) {
      return { startIndex: m.index, endIndex: m.index + m[0].length };
    }

    // --- Fuzzy fallback with variable window width ---
    const dest = destOriginal.toLowerCase();
    const query = search.toLowerCase();

    let bestStart = -1, bestEnd = -1, minDistance = Infinity;

    // allow the window to be a bit shorter/longer than the query length
    const L = query.length;
    const slack = Math.max(2, Math.floor(L * 0.3)); // tune as needed

    const minW = Math.max(1, L - slack);
    const maxW = Math.min(dest.length, L + slack);

    for (let w = minW; w <= maxW; w++) {
      for (let i = 0; i + w <= dest.length; i++) {
        const sub = dest.substring(i, i + w);
        const d = levenshtein.get(query, sub);
        if (d < minDistance) {
          minDistance = d;
          bestStart = i;
          bestEnd = i + w;
        }
      }
    }

    return { startIndex: bestStart, endIndex: bestEnd };
  }

  findIndices_Old(searchText: string, destinationText: string): { startIndex: number, endIndex: number } {
    let searchWords: any = searchText.split(' ');
    // const leadingSpaces  = destinationText.match(/^\s*/)?.[0].length || 0;
    const destinationWords = destinationText.split(' ');
    if (destinationWords.length == 1) {
      searchWords = searchText.trim().toLowerCase().replace(/\s+/g, '');
      //   console.error('searchWords = ',searchWords,destinationText)
    }
    let matchedIndices: number[] = [];
    let searchIndices: number[] = [];
    let lastMatchedIndex = -1;

    // for (let i = 0; i < searchWords.length; i++) {
    //   let searchWord = searchWords[i].toLowerCase();
    //   for (let j = lastMatchedIndex + 1; j < destinationWords.length; j++) {
    //     let destinationWord = destinationWords[j].toLowerCase();
    //     if ((searchWord === destinationWord) || searchWord.replace(/[^a-zA-Z0-9\s]/g, '') === destinationWord.replace(/[^a-zA-Z0-9\s]/g, '')) {
    //       searchIndices.push(i);
    //       matchedIndices.push(j);
    //       lastMatchedIndex = j;
    //       break;  // Move to the next search word after finding the first match
    //     }
    //   }
    // }

    const attemptMatch = (searchWords, destinationWords) => {
      for (let i = 0; i < searchWords.length; i++) {
        let searchWord = searchWords[i].toLowerCase();
        if (searchWord.length == 0) {
          continue;
        }
        for (let j = lastMatchedIndex + 1; j < destinationWords.length; j++) {
          let destinationWord = destinationWords[j].toLowerCase();
          if ((searchWord === destinationWord) || searchWord.replace(/[^a-zA-Z0-9\s\^]/g, '') === destinationWord.replace(/[^a-zA-Z0-9\s\^]/g, '')) { //.replace(/[^a-zA-Z0-9\s]/g, '')
            searchIndices.push(i);
            matchedIndices.push(j);
            lastMatchedIndex = j;
            break;  // Move to the next search word after finding the first match
          }
        }
      }
    };
    // Initial match attempt
    attemptMatch(searchWords, destinationWords);

    // If no matches found, attempt with trimmed and lowercase transformation
    if (matchedIndices.length === 0) {
      searchText = searchText.trim().toLowerCase().replace(/\s+/g, '');
      destinationText = destinationText.trim().toLowerCase();
      searchWords = searchText.split(' ');
      const destinationWords = destinationText.split(' ');
      lastMatchedIndex = -1;
      searchIndices = [];
      matchedIndices = [];
      attemptMatch(searchWords, destinationWords);
    }


    let destination_prefix: string[] = [];
    let search_prefix: string[] = [];
    let search_suffix: string[] = [];
    let destination_suffix: string[] = [];

    if (searchIndices.length > 0 && searchIndices[0] !== 0) {
      destination_prefix = destinationWords.slice(0, matchedIndices[0]);
      search_prefix = searchWords.slice(0, searchIndices[0]);
    }
    if (searchIndices.length > 0 && searchIndices[searchIndices.length - 1] !== searchWords.length - 1) {
      destination_suffix = destinationWords.slice(matchedIndices[matchedIndices.length - 1] + 1, destinationWords.length);
      search_suffix = searchWords.slice(searchIndices[searchIndices.length - 1] + 1, searchWords.length);
    }

    let startIndex = -1;
    let endIndex = -1;
    let smallestDistance = Infinity;
    if (matchedIndices.length > 0) {
      // Adjust the start index for the prefix
      if (search_prefix.length > 0 && destination_prefix.length > 0) {
        const prefixText = search_prefix.join(' ');
        const prefixDEST = destination_prefix.join(' ');
        const prefixIndex = prefixDEST.lastIndexOf(prefixText);
        const distance = levenshtein.get(prefixText, prefixDEST);
        if (distance < smallestDistance) {
          startIndex = distance;
        }
      }

      // If no prefix adjustment, use the matched index start
      // if (startIndex === -1) {
      //     startIndex = destinationText.indexOf(destinationWords[matchedIndices[0]]);
      // }

      // If no prefix adjustment, use the matched index start
      if (startIndex === -1) {
        let txt = "";
        for (let i = 0; i < matchedIndices[0]; i++) {
          txt += destinationWords[i] + " ";
        }
        startIndex = txt.length;
        // Adjust to remove trailing space if necessary
        if (startIndex > 0 && destinationText[startIndex - 1] === ' ') {
          startIndex -= 1;
        }
        if (startIndex === -1) {
          startIndex = destinationText.indexOf(destinationWords[matchedIndices[0]]);
        }
        // console.log('\n\n\n', startIndex, matchedIndices[0], destinationWords[matchedIndices[0]], txt, '\n\n\n');
      }

      // If no suffix adjustment, calculate endIndex based on the positions of matched words
      if (endIndex === -1) {
        endIndex = startIndex;
        for (let i = 0; i < matchedIndices.length; i++) {
          const word = destinationWords[matchedIndices[i]];
          endIndex = destinationText.indexOf(word, endIndex) + word.length;
        }

      }

      // Adjust the end index for the suffix
      if (search_suffix.length > 0 && destination_suffix.length > 0) {
        const suffixText = search_suffix.join(' ');
        const suffixDEST = destination_suffix.join(' ');
        const suffixIndex = suffixDEST.indexOf(suffixText, startIndex);
        const res = this.fuzzySearchLevenshtein(suffixText, suffixDEST);
        //  console.log('res = ',res)
        //  console.log('startIndex',startIndex,'endIndex',endIndex,' || suffixIndex', suffixIndex,'suffixDEST = ',suffixDEST,' || suffixText',suffixText,suffixText.length);
        if (res.endIndex !== -1) {
          endIndex = endIndex + 1;
          endIndex = endIndex + res.endIndex + 1;
        }
      }
    } else {
      let distance = levenshtein.get(searchText.toLowerCase(), destinationText.toLowerCase());
      startIndex = destinationText.toLowerCase().lastIndexOf(searchText.toLowerCase());
      if (startIndex !== -1) {
        endIndex = startIndex + searchText.length;
      } else {
        ({ startIndex, endIndex } = this.fuzzySearchLevenshtein(searchText, destinationText));
      }
    }

    return { startIndex, endIndex };
  }

  private fuzzySearchLevenshtein(search: string, destination: string): { startIndex: number, endIndex: number } {
    const substrings = [];
    for (let i = 0; i <= destination.length - search.length; i++) {
      for (let j = i + 2; j <= destination.length; j++) {
        substrings.push(destination.substring(i, j));
      }
    }

    // Use Fuse.js to find potential matches
    const fuse = new Fuse(substrings, {
      includeScore: true,
      minMatchCharLength: 2, // Ensure at least two characters are matched
      threshold: 0.6, // Adjust based on desired fuzziness
      keys: []
    });

    const fuseResults = fuse.search(search);
    let potentialMatches = fuseResults.map(result => result.item);

    let closestMatch = null;
    let minDistance = Infinity;
    let startIndex = -1;
    let endIndex = -1;

    potentialMatches.forEach(substring => {
      const distance = levenshtein.get(search, substring);
      if (distance < minDistance) {
        minDistance = distance;
        closestMatch = substring;
        startIndex = destination.indexOf(substring);
        endIndex = startIndex + substring.length - 1;
      }
    });

    if (minDistance === 0) {
      // console.log(`Found exact match: "${search}"`);
    } else {
      // console.log(`Found closest match: "${closestMatch}" with distance ${minDistance}`);
    }

    // console.log(`Start Index: ${startIndex}, End Index: ${endIndex}`);

    return { startIndex, endIndex };
  }
  private fuzzySearchLevenshtein2(search: string, destination: string): { startIndex: number, endIndex: number } {
    let closestWord = null;
    let minDistance = Infinity;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i <= destination.length - search.length; i++) {
      const substring = destination.substring(i, i + search.length);
      const distance = levenshtein.get(search, substring);
      if (distance < minDistance) {
        minDistance = distance;
        closestWord = substring;
        startIndex = i;
        endIndex = i + search.length - 1;
      }
    }

    if (minDistance === 0) {
      // console.log(`Found exact match: "${search}"`);
    } else {
      // console.log(`Found closest match: "${closestWord}" with distance ${minDistance}`);
    }

    return { startIndex, endIndex };
  }
}