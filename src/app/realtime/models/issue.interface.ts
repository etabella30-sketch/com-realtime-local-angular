export interface issueListMdl {
    nIid: string;
    cIName: string;
    cColor: string;
    cCategory: string;
    nTotalID?: number;
    nTotalHID?: number;
    isChecked?: boolean;
    isExpanded?: boolean;
    isLoading?: boolean;
    sublist?: issuesMdl[];
    nRelid?: number;
    nImpactid?: number;
    currentNote?: string;
    dt?: string;
    nUserid: string;
    serialno?: number;
}


export interface impactMdl {
    cKey: string;
    nValue: number;
}
export interface relevenceMdl {
    cKey: string;
    nValue: number;
}



export interface issuesMdl {
    nIDid: string;
    cONote: string;
    cNote: string;
    cPageno: string;
    isCheck: boolean;
}


export interface SessionIssueMDL {
    nCaseid: string;
    nSessionid: string;
    nUserid: string;
}

export interface issueDetailMdL {
    cColor: string;
    cIid: any;
    cNote: string;
    cUNote: string;
    cONote: string;
    cPageno: string;
    jCordinates: any;
    jOCordinates: any;
    cTPageno: string;
    jTCordinates: any;
    nICount: string
    nIDid: string;
}

export interface hyperLinksMDL {
    nHid: string;
    cPageno: string;
    cLineno: string;
    cColor?: string;
    nGroupid?: number;
    issueids?: string;
}
export interface dynamicComboMDL {
    nCategoryid: number;
}

export interface sessionDataMDL {
    cCasename: string;
    cName: string;
    cStatus: string;
    maxNumber: number;
    pageRes?: string;
    secondLastRes?: string,
    lastPage?: number;
    lastLineNumber?: number; // Random line number between 1 and 25 for the last page
    nSesid: string;
    nCaseid: string;
    settings: sessionUserSettingsMDL;
    totaIssues?: number;
    isTrans?: boolean;
    nDemoid?: number;
    dStartDt?: string;
    nLSesid: number;
    cProtocol?: string;
}



interface sessionUserSettingsMDL {
    lineNumber: number,
    startPage: number,
}



export interface sessionDetailResponce {
    cName: string;
    nSesid: string;
    isTranscript: boolean;
}

export type hylightMD = 'H' | 'I' | false;


export interface issueVersions {

    nRefresh: number;
    versions: { oL: number,oP: number, t: number, text: string }[];

}