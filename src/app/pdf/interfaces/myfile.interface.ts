
export class BundleCommonRes {
  msg: Number;
  value: string;
  error?: any;
  data?: any;
}


export interface bundleReq {
  nSectionid: string;
  nBundleid: string;
  pageNumber: number;
}

export interface bundleRes {
  nBundleid: string;
  nParentBundleid: string;
  cBundlename: string;
  cBundletag?: string;
  level?: number;
  children?: bundleRes[];
  parent?: bundleRes;
}


export interface selectedbundleRes {
  nBundleid: string;
  bundle: string[];
}


export interface bundleDetailReq {
  nSectionid: string;
  nBundleid: string;
  pageNumber: number;
  cSearch?: string;
  cFiletype?: string;
  searchName?: string;
  cSortby?: string;
  cSorttype?: string;
}



export interface bundelTypeReq {
  nSectionid: string;
  nBundleid: string;
  nCaseid: string;
  cSearch?: string;
  searchName?: string;
}

export interface bundleTypeRes {
  cFiletype: string;
  nTotal: number;
  active?: boolean;
}


export interface filedataRes {
  nBundledetailid?: string;
  cPath?: string;
  cPage?: string;
  cRefpage?: string;
  cFiletype?: string;
  nPage?:any
}


export interface filedataReq {
  nBundledetailid?: string;
  cTab?: string;
  nCaseid?: string;
}

export interface bundleDetailRes {
  nBundledetailid: string;
  nBundleid: string;
  cBundletag?: string;
  cName: string;
  cTab: string;
  cExhibitno: string;
  cPage: string;
  cFilename?: string;
  cRefpage: string;
  cFilesize?: string;
  cFiletype: string;
  isfolder?: boolean;
  dIntrestDt?: string;
  cDescription?: string;
  cIscheck?: boolean;
  ischeckforblink?: boolean;
  cIsPaginate?: boolean;
  cRelevence?: string;
  cImpact?: string;
  cLink?: string;
  isChecked?: boolean;
  fact?: boolean;
  web?: boolean;
  doc?: boolean;
  share?: boolean;
  flink?: boolean;
  bIsconvert?: boolean;
  cCStatus?: 'S' | 'F' | 'I' | 'P' | 'V' | 'VS';
  nProgress?: number;
}

export interface bundleBuilder {
  nBundleid: string;
  nSectionid: string;
  cBundlename: string;
  nParentBundleid: string;
  nCaseid: string;
  permission: string;
}

export class bundleBuilderRes {
  msg: number;
  value: string;
  nBundleid?: string;
  error?: any;
}


export interface fileRename {
  nBundleid: string;
  nSectionid: string;
  nBundledetailid: string;
  cFilename: string;
  nCaseid: string;
}

export interface fileUpdateDetail {
  nBundledetailid: string,
  cExhibitno: string;
  cFilename: string;
  cDescription: string;
  dIntrestDt: string;
  cTab?: string;
}

export interface bundlePermission {
  nBundleid: string;
  nBundledetailid: string;
  nUserid?: string;
  nTeamid?: string;
  bPermit: boolean;
  nCaseid: string;
}

export interface deleteBundleReq {
  nCaseid: string,
  jFolders: string;
  jFiles: string;
}


export interface selectBundle {
  jFolders: string;
  jFiles: string;
  nFSectionid?: string;
  jBnode?: any;
  jBDnode?: any;
}

export interface pasteBundleReq {
  jFolders: string;
  jFiles: string;
  nSectionid?: string;
  nBundleid?: string;
  type?: string;
}



export interface assignCustomBundleReq {
  jFiles: string;
  nSectionid?: string;
  nBundleid?: string;
  type?: string;
}

export class copyCommonRes {
  data?: any;
  msg: Number;
  value: string;
  error?: any;
}


export class clearRecentRes {
  data?: any;
  msg: Number;
  value: string;
  error?: any;
}



export interface undoBundleReq {
  jFolders: any;
  jFiles: any;
  nSectionid?: string;
  nBundleid?: string;
  type?: string;
}


export interface updateBundletag {
  nBundleid: number;
  cBundletag: string;
  bisAutoassign?: boolean;
}


export interface updateFiletab {
  nBundledetailid: string;
  cTab: string;
  nBundleid: string;
  nSectionid: string;
  bundle?: any;
  bisAutoassign?: boolean;
}


export interface brdcrumb {
  nBundleid: string;
  cBundlename: string;
}

export interface TeamUsersRes {
  nTeamid?: string;
  cTeamname?: string;
  cFlag?: string;
  cClr?: string;
  users?: any;
}

export class BundlesPermissionReq {
  nBundleid: string;
  nBundledetailid: string;
}


export class recentfileReq {
  nCaseid: string;
  nSectionid: string;
}

export class recentfileRes {
  nBundleid: string;
  nBundledetailid: string;
  cName: string;
}


export class bundleTagReq {
  nSectionid: string;
}

export class bundleTagRes {
  nBundleid: string;
  cBundletag: string;
  msg: number;
  error: any;
}


export class bundleTabReq {
  nSectionid: string;
  nBundleid: string;
}

export class bundleTabRes {
  nBundledetailid?: string;
  cTab?: string;
  cPage?: string;
  msg?: number;
  error?: any;
}





export class viewBundlesRes {
  msg: Number;
  value: string;
  error?: any;
  nBundleid?: string;
  cBundlename?: string;
  nSectionid?: string;
}

export class viewContact {
  jBDids: string;
}



export class assignContact {
  jFiles: string;
  nContactid: number;
}


export class assignTag {
  jFiles: string;
  nTagid: number;
}


export class assignTask {
  jFiles: string;
  nTaskid: number;
}


export class displayRes {
  isIssue: boolean;
  isContact: boolean;
  isTag: boolean;
}


export class BundleLinksReq {
  nBundleid: string;
  nSectionid: string;
}


export interface BundleLinksRes {
  nBDid?: string;
  f?: boolean;
  d?: boolean;
  w?: boolean;
  fl?: boolean;
  sh?: boolean;
  msg?: Number;
  value?: string;
  error?: any;
}


