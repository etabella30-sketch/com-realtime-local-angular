

export interface caseDetailMDL {
    nCaseid: number;
    cCasename: string;
    cCaseno: string;
    dUpdateDt: string;
    cTeamname: string;
}

export interface sectionDetailMDL {
    nSectionid: number;
    cFolder: string;
}


export interface bundleMDL {
    nBundleid: number;
    cBundlename: string;
}

export interface selectedfileMDL {
    id: number;
    isFolder: boolean;
    name: string;
    parentId: number;
    file: File;
    level: number;
    isExpanded?: boolean;
}


export interface checkDuplicacyMDL {
    nCaseid: number;
    nSectionid: number;
    nBundleid: number;
    // d: number[][];
    d: string;

}


export interface chunkUploadMDL {
    identifier: string;
    name: string;
    file: File;
    totalChunks: number;
    chunkNumber: number;
    nBundleid: number;
    nBundledetailid: number;
}



export interface sendChunkreq {
    identifier: string;
    file: Blob;
    chunkNumber: number;
    nUPid: number;
}

export interface ChunkStatusRes {
    max: number;
    msg: number;
}

export interface UploadResponse {
    m: number;
    i: number;
}


export interface completeReq {
    nUPid: number;
    nUDid: number;
    identifier: string;
    totalChunks: number;
    nCaseid: number;
    filetype: string;
    filesize: number;
    name: string;
    nSectionid: number;
    nBundleid: number;
    nBundledetailid: number;
    cFilename: string;
    cPath?: string;
    nMasterid?: number;
}


export interface fileUploadMDL {
    identifier: string;
    name: string;
    file: File;
    cFilename: string;
    filetype: string;
    totalChunks: number;
    nBundleid: number;
    nBundledetailid: number;
    cStatus?: string | 'P';
    nProgress?: number | 0;
    nTotal?: number | 0;
    nComplete?: number | 0;
    cPath?: string;
    nCaseid?: number;
}



export interface uploadingFilesMDL {
    session: sectionDetailMDL;
    files: fileUploadMDL[];
}


export interface eventStatus {
    cStatus: string;
}


export interface reportDetailMDL {
    nUDid: number;
    cUnicid: string;
    cName: string;
    cSize: string;
    cType: string;
    cStatus: string;
}


export interface reportSummaryMDL {
    nUPid: number;
    cBundlename: string;
    cFolder: string;
    dCreateDt: string;
    isExpanded?: boolean;
    totalfiles: number;
    files: reportDetailMDL[]
}


