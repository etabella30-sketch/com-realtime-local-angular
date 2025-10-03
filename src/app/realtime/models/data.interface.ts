export interface LineData {
    time: string;
    asciiValue: number[];
    inCommingLineNo: number;
  }
  
  export interface FeedData {
    i: number;
    d: LineData[];
    date: number;
  }
  