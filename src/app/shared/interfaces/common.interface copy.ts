import { PDFAnnotation } from "../../pdf/interfaces/pdf.interface";

export interface codeData {
  nValue: number;
  cKey: string;
  jOther?: any;
  bSerialno?: number;
}

export interface linkType {
  type: string;
  start: number;
  end: number;
  pages?: number[];
  highlights?: PDFAnnotation[];
}