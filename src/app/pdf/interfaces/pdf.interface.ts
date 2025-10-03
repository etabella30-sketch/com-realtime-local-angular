import { linkType } from "../../shared/interfaces/common.interface";
import { selectedContactList, selectedIssues } from "../../shared/interfaces/issue.interface";

export type ModelType = 'QF' | 'F' | 'D' | 'W' | 'RQF' | 'RF' | 'RD' | 'RW' | 'VP' | 'AP' | 'N' | 'LS' | 'IL' | null;
export type highlightToolType = 'F' | 'D' | 'W' | 'DR' | 'R';
export type highlightModeType = 'QF' | 'F' | 'W' | 'D' | null;
export type factAssigneeType = 'C' | 'T' | null;

export type globAnnot = 'M' | 'S';

export type slabModeType = 'CD' | 'U' | 'UC' | null;

export type linkExplorer = 'I' | 'O' | null;
export type linkExplorerType = 'F' | 'D';

export interface PDFAnnotation {
    id: number;
    linktype: string;
    uuid: string;
    type: string;
    rects?: PDFrects[];
    lines?: [string, string][];
    width?: number;
    colorid?: number;
    color: string;
    page: number;
    nFSid?: number;
    nDocid?: number;
    nWebid?: number;
    isTemp?: boolean;
    isHyperlink?: boolean;
}

export interface PDFrects {
    x: number;
    y: number;
    width: number;
    height: number;
    index?: number;
    fill?: string;
    bundledetailid?: number;
    redirectpage?: number;
    redirectpage2?: number;
}

export interface PDFPageViewport {
    height: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
    transform: number[];
    viewBox: number[];
    width: number;
    rawDims: { pageHeight: number, pageWidth: number, pageX: number, pageY: number };
}

export interface iconsGroup {
    uuids: uuidGroup[],
    minY: number,
    maxY: number
}

export interface uuidGroup {
    uuid: string,
    id: number,
    linktype: string
}

export interface itemPosition {
    x: number,
    y: number,
    position: number,
    page: number
}

export interface toolEvents {
    event: string;
    data: any;
}

export interface zoomLevels {
    value: string;
    key: string;
}


export interface temporaryAnnots {
    annots: PDFAnnotation | any;
    text: string | null;
    isNotSaved?: boolean | null;
}

export interface DocInfo {
    nBundledetailid: string;
    cFilename: string;
    cBundle: string | null;
    cPage: string;
    cRefpage: string | null;
    cFiletype: string;
    cTab: string | null;
    cPath: any;
    cExhibitno: string | null;
    nBundleid: string;
    nRotate: number;
    highlights?: PDFAnnotation[];
    mode?: any;
    start?: any;
    end?: any;
    jLinktype?: linkType;
    nPageno?: number;
    isRealtime?: boolean;
    texts?: any;
}

export interface myTeamUsers {
    nUserid: string;
    cFname: string;
    cLname: string;
    cProfile: string;
    isSelected?: boolean;
}

export interface pdfFinalSubmit {
    issues: selectedIssues[],
    contacts: selectedContactList[],
    tasks: any[],
    users: myTeamUsers[]
}

export interface globalAnnots {
    id: number[];
    type: highlightModeType;
}

export interface linkExplorerList {
    nBundledetailid: string;
    jLinktype: linkType;
    cFilename: string;
    cTab: string;
    cExhibitno: string;
    cBundletag: string;
}
export interface paginationRenge {
    page: number;
    output: string;
}
export interface hyperlinkOption {
    nBundledetailid: string;
    redirectpage: number;
    redirectpage2: number;
    nDocid: number;
    isOpen?: boolean;
}

export interface pdfToolOptions {
    pageRotation: any;
    handTool: boolean;
    zoom: string | number;
    totalSearch: number;
    currentSearch: number;
    isSearching: boolean;
    pageViewMode: string;
    docInfo: DocInfo | null;
    currentPage: number;
    pagesCount: number;
    pdfLoaded: boolean;
    pagginationRenge: paginationRenge[];
}


export interface EmailRes {
    msg: number,
    email: Email,
    value: string,
    error: any;
}

export interface Email {
    from: { name, email };
    to: [{ name, email }];
    cc: [{ name, email }];
    subject: string;
    body: string;
    attachments?: attechment[];
    date: string;
}

export interface attechment {
    filename: string; data: any
}