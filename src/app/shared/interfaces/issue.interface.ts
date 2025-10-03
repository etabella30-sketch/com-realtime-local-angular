export interface issueList {
  nIid: string;
  cIName: string;
  cCategory: string;
  cColor: string;
  nICid: string;
  isChecked?: boolean;
  isExpanded?: boolean;
  nImpactid?: number;
  nRelid?: number;
  nRelevanceid?: number;
}

export interface selectedIssues {
  nIid: string;
  nIssueid?: string;
  nImpactid: number;
  nRelid: number;
  nRelevanceid?: number;
  dt: string;
}

export interface selectedContactList {
  nContactid: number;
  cFname: string;
  cLname: string;
  cProfile: string;
  cEmail: string;
  cRole: string;
  cCompany: string;
  avatar: any;
}


export interface ContactDetail {
  nContactid?: number;
  nCaseid?: string;
  cFname?: string;
  cLname?: string;
  cProfile?: string;
  cAlias?: string;
  cLinkedin?: string;
  cEmail?: string;
  cCountrycode?: string;
  cMobile?: string;
  nTZid?: number;
  cTimezone?: string;
  nRoleid?: number;
  cRole?: string;
  nCompanyid?: number;
  cNote?: string;
  cCompany?: string;
  cIso?: string;
}


export interface ContactFileRes {
  nBundledetailid?: string;
  nBundleid?: string;
  cFilename?: string;
  cName?: string;
  cTab?: string;
  cExhibitno?: string;
  cPage?: string;
  cRefpage?: string;
  cFilesize?: string;
  cFiletype?: string;
  dIntrestDt?: string;
  cDescription?: string;
  msg?: number;
  value?: string;
  error?: any;
}

export interface contactlistRes {
  nContactid?: number;
  cProfile?: string;
  cFname?: string;
  cLname?: string;
  cEmail?: string;
  nCompanyid?: number;
  cCompany?: string;
  tablelist?: any[];
  isopened?: boolean;
}


export interface contactCategory {
  nCompanyid?: number;
  cCompany?: string;
  contactls?: contactlistRes[];
  isopened?: boolean;
}


export interface selectedTaskList {
  nTaskid: number | null;
  permission: string;
  cSubject: string;
  cDesc: string;
  jEmailnotify: {
    cAssign: boolean;
    cRemind: boolean;
    cStatus: boolean;
  };
  nPriority: number | null;
  nProgress: number;
  jTimeline: {
    dStart: Date;
    dEnd: Date;
    time_prges: number;
    show_tm: string;
  };
  cTasktype: string;
  jUsers: string;
  bemail: boolean;
  binapp: boolean;
  nCaseid: string;
}