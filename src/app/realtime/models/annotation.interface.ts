export interface Annotation {
  temp?: boolean;
  id?: string;
  text?: string;
  nIDid: string;
  pageIndex: number;
  color: string;
  cordinates: { x: number, y: number, width: number, height: number, s?: number, ln?: number, p?: number, t?: string, identity?: string }[];
  orgCordinates?: { x: number, y: number, width: number, height: number, s?: number, ln?: number, p?: number, t?: string, identity?: string }[];
  jCordinates?: { x: number, y: number, width: number, height: number, s?: number, ln?: number, p?: number, t?: string, identity?: string }[];
  nICount?: number;
  isRefrence?: boolean
  bTrf?: boolean;
  highestY?: number,
  // firstrefrence?: boolean,
  pageCount?: number,
}

export interface highlightsAnnot {
  nHid: string;
  cPageno: number;
  cLineno: number;
  cTime: string;
  cNote?: string;
  cColor: string;
  issueids: string; //number[];
  nGroupid?: number;
  oL?: number;
  identity?: string;
  highlights?: any[]
}



export interface annotIndex {
  s: number,
  ln: number,
  color: string,
  nIDid: string
}


export interface param_highLightIssueIds {
  nIid: string;
  nRelid?: number;
  nImpactid?: number;
  serialno?: number;
}

export interface param_lastIssue {
  nIid: string;
  cColor: string;
}


export interface tabmodel {
  cTab: string;
  nPageno: number;
}