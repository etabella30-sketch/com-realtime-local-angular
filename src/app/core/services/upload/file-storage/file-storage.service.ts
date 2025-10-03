import { Injectable } from '@angular/core';
import { bundleMDL, caseDetailMDL, chunkUploadMDL, eventStatus, sectionDetailMDL, selectedfileMDL } from '../../../interfaces/upload.interface';
import { UploadService } from '../upload.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {
  public maxFiles: number = 1000;
  public maxChunkSize: number = 1024 * 1024 * 2;
  public queueConcurrency: number = 2;
  public chunkConcurrency: number = 5;




  public fileList: any = [];
  public nBundleid: number = 0;
  public nSectionid: number = 94;
  private caseDetail: caseDetailMDL;
  public sectionDetail: sectionDetailMDL;
  public bundle: bundleMDL;
  public nCaseid: number = 22;
  private selectedFiles: selectedfileMDL[] = [];
  private uploadingList: selectedfileMDL[] = [];


  public uploading:boolean = false;
  constructor(private upld: UploadService) {

    this.selectedFiles = window.localStorage.getItem('selectedFiles') ? JSON.parse(window.localStorage.getItem('selectedFiles')) : [];
  }

  async getCaseDetail(nCaseid: number): Promise<caseDetailMDL> {
    this.nCaseid = nCaseid ? nCaseid : this.nCaseid;
    if (this.caseDetail)
      return this.caseDetail;
    else
      this.caseDetail = await this.upld.fetchCaseDetail(nCaseid);
    return this.caseDetail;
  }



  async getCaseId(): Promise<number> {
    return this.nCaseid ? this.nCaseid : 0;
  }


  generateRandomId(): string {
    return uuidv4();
  }

  async getSectionDetail(nSectionid?: number): Promise<sectionDetailMDL> {
    if (nSectionid && nSectionid != this.nSectionid) {
      this.nSectionid = null;
      this.sectionDetail = null;
      this.nBundleid = null;
      this.bundle = null;
    }
    nSectionid = nSectionid ? nSectionid : this.nSectionid;
    if (this.sectionDetail)
      return this.sectionDetail;
    else
      this.sectionDetail = await this.upld.fetchSectionDetail(nSectionid);
    this.nSectionid = this.sectionDetail.nSectionid;
    return this.sectionDetail;
  }

  async getBundleDetail(nBundleid?: number): Promise<bundleMDL> {

    if (nBundleid && nBundleid != this.nBundleid) {
      this.nBundleid = null;
      this.bundle = null;
    }

    nBundleid = nBundleid ? nBundleid : this.nBundleid;
    if (this.bundle)
      return this.bundle;
    else
      this.bundle = await this.upld.fetchBundleDetail(nBundleid);
    this.nBundleid = this.bundle.nBundleid;
    return this.bundle;
  }


  async setSelectedFileStorage(files: selectedfileMDL[]) {
    this.selectedFiles = files;
    this.selectedFiles.map(a => a.isExpanded = false)
    // window.localStorage.setItem('selectedFiles', JSON.stringify(this.selectedFiles));
  }


  async setUploadingFileStorage(files: selectedfileMDL[]) {
    this.uploadingList = files;
    // window.localStorage.setItem('selectedFiles', JSON.stringify(this.selectedFiles));
  }



  async getSelectedFileStorage(): Promise<selectedfileMDL[]> {
    return this.selectedFiles || [];
  }

  async getSelectedFileStorageByLevel(id: number): Promise<selectedfileMDL[]> {
    return this.selectedFiles.filter((file) => file.parentId == id) || [];
  }

  generateChunkTasks(mdl, startChunk: number): Promise<chunkUploadMDL[]> {
    const tasks: chunkUploadMDL[] = [];
    const totalChunks = mdl.totalChunks;  // Assume mdl includes the total number of chunks already defined
    let chunkNumber = (startChunk && startChunk > 0 && totalChunks >= startChunk) ? (startChunk - 1) : 0;
    for (chunkNumber; chunkNumber < totalChunks; chunkNumber++) {
      // Clone the mdl object and add the chunkIndex to it for each task
      const task = {
        ...mdl,  // Spread operator to copy properties from mdl
        chunkNumber: chunkNumber  // Adding chunkIndex to indicate which chunk this task is handling
      };

      // Push the task into the tasks array
      tasks.push(task);
    }

    return Promise.resolve(tasks);
  }




  getStatus(event) {
    let obj: eventStatus;
    switch (event) {
      case 'FILE-MERGED':
        obj = { cStatus: 'V' };
        break;
      case 'ZIP-PROCESS':
        obj = { cStatus: 'Z' };
        break;
      case 'ZIP-FAILED':
        obj = { cStatus: 'ZF' };
        break;
      case 'VERIFY-CPOMPLETE':
        obj = { cStatus: 'VC' };
        break;
      case 'FILE-INSERT-COMPLETE':
        obj = { cStatus: 'C' };
        break;
      case 'FILE-INSERT-FAILED':
        obj = { cStatus: 'F' };
        break;
      case 'MERGING-FAILED':
        obj = { cStatus: 'F' };
        break;
      case 'ZIP-REPORT':
        obj = { cStatus: 'ZR' };
        break;
      case 'ZIP-DETAIL':
        obj = { cStatus: 'ZD' };
        break;
      case 'ZIP-OPEN-FAILED':
        obj = { cStatus: 'ZF' };
        break;
      case 'ZIP-READ-SUCCESS':
        obj = { cStatus: 'ZR' };
        break;
      case 'ZIP-FORMATE-SUCCESS':
        obj = { cStatus: 'ZR' };
        break;
      case 'ZIP-NO-FORMATES':
        obj = { cStatus: 'ZF' };
        break;
      case 'ZIP-BUNDLE-SAVE-FAILED':
        obj = { cStatus: 'ZF' };
        break;
      case 'ZIP-BUNDLE-SAVE':
        obj = { cStatus: 'ZB' };
        break;
      case 'ZIP-COMPLETE':
        obj = { cStatus: 'C' };
        break;
      default:
        obj = { cStatus: 'P' };
        break;
    }
    return obj;
  }

}
