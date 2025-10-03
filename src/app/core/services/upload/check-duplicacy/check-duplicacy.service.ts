import { Injectable } from '@angular/core';
import { UploadService } from '../upload.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { bundleMDL, checkDuplicacyMDL, fileUploadMDL, sectionDetailMDL, selectedfileMDL } from '../../../interfaces/upload.interface';

@Injectable({
  providedIn: 'root'
})
export class CheckDuplicacyService {
  public nCaseid: number;

  public sectionDetail: sectionDetailMDL;
  public bundle: bundleMDL;
  constructor(private upld: UploadService, private store: FileStorageService) { }


  async checkDuplicacy(): Promise<any> {

    this.nCaseid = await this.store.getCaseId();
    this.sectionDetail = await this.store.getSectionDetail();
    this.bundle = await this.store.getBundleDetail();
    if (this.nCaseid) {
      const fileDetail: checkDuplicacyMDL = { nCaseid: this.nCaseid, nSectionid: this.sectionDetail.nSectionid, nBundleid: this.bundle.nBundleid, d: '[]' };
      const files: selectedfileMDL[] = await this.store.getSelectedFileStorage();
      if (files.length) {
        const d: any = files.map(({ id, parentId, name, isFolder }) => ([id, parentId, name, isFolder]));
        fileDetail.d = JSON.stringify(d);
        let res = await this.upld.checkDuplicacy(fileDetail);
        return res && res.msg == 1 ? res.jResult : false;
      }
    }
  }



  async isDuplicated(res: any): Promise<number[]> {
    let duplicated: number[] = res.filter(a => a.length > 2);
    return duplicated;
  }

  getRandomFile() {
    return `file_${Math.floor(Math.random() * new Date().getTime())}`
  }

  getFileType(filename: string) {
    try {
      return filename.split('.').pop().toUpperCase();
    } catch (error) {
      return 'unknown';
    }

  }

  async mergeresult(res: any, flag: string): Promise<fileUploadMDL[]> {


    let files: fileUploadMDL[] = [];

    let selectedFiles: selectedfileMDL[] = await this.store.getSelectedFileStorage();

    selectedFiles.map((e) => {
      if (!e.isFolder && e.file) {
        let file = res.find(a => a[0] == e.id);
        if (file && ((flag == 'I' && !file[2]) || flag != 'I')) {
          files.push({ identifier: this.store.generateRandomId(), name: this.getRandomFile(), filetype: this.getFileType(e.file.name), cFilename: e.name, file: e.file, nBundleid: file[1], nBundledetailid: (flag == 'U' ? 0 : (file[2])), totalChunks: Math.ceil(e.file.size / this.store.maxChunkSize), cStatus: 'P' });
        }
      }
    })

    return files;

  }


  async uploadStructure(nSesid: any, flag: string): Promise<fileUploadMDL[]> {


    let files: fileUploadMDL[] = [];

    let selectedFiles: selectedfileMDL[] = await this.store.getSelectedFileStorage();

    selectedFiles.map((e) => {
      if (!e.isFolder && e.file) {
        // this.getRandomFile()
        files.push({ identifier: this.store.generateRandomId(), name: `s_${nSesid}`, filetype: this.getFileType(e.file.name), cFilename: e.name, file: e.file, nBundleid: 0, nBundledetailid: 0, totalChunks: Math.ceil(e.file.size / this.store.maxChunkSize), cStatus: 'P' });

      }
    })

    return files;

  }

}
