import { Injectable } from '@angular/core';
import { FileStorageService } from '../file-storage/file-storage.service';
import { ChunkStatusRes, chunkUploadMDL, completeReq, fileUploadMDL, sendChunkreq } from '../../../interfaces/upload.interface';
import async from 'async';
import { UploadService } from '../upload.service';
import { CommunicationService } from '../../../../shared/services/communication/communication.service';

@Injectable({
  providedIn: 'root'
})
export class UploadManagementService {

  private files: fileUploadMDL[] = [];
  globalQueueArray: any = new Map();
  private uploadQueue: any;
  nUserid: string;
  constructor(private store: FileStorageService, private upld: UploadService, private cs: CommunicationService) {
    this.nUserid = window.localStorage.getItem('nUserid') ? (window.localStorage.getItem('nUserid')) : null;
    this.uploadQueue = async.queue(this.processUpload.bind(this), this.store.queueConcurrency);
    this.uploadQueue.drain((task, err) => {
      this.store.uploading = false;
      console.log('All tasks have been processed', task, err);
    });

    this.uploadQueue.error((error, task) => {
      this.store.uploading = false;
      console.error('Error executing task:', error, task);
    });
  }


  async startUpload(files: fileUploadMDL[], curent_case: any): Promise<any> {
    this.cs.callFunction({ event: 'UPLOAD-START', files: files });
    this.store.uploading = true;
    let generatedTasls = this.generateTasks(files, curent_case);

    return new Promise((resolve, reject) => {
      if (generatedTasls.length) {
        this.uploadQueue.push(generatedTasls);
        resolve(true);
      } else {
        resolve(false);
      }
    })

  }




  private generateTasks(files: fileUploadMDL[], curent_case): any[] {
    const tasks = [];
    files.forEach((item) => {
      tasks.push(Object.assign(item, { nCaseid: curent_case.nCaseid }));
    });
    return tasks;
  }


  getChunk(file: File, totalChunks: number, chunkNumber: number): Blob {
    const fileSize = file.size;
    const chunkSize = Math.ceil(fileSize / totalChunks);
    const start = chunkNumber * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);

    return file.slice(start, end);

  }


  private async processUpload(task: fileUploadMDL, callback: Function) {
    let nSectionid = this.store.nSectionid;
    let statusRes: ChunkStatusRes = await this.upld.checkStatus(task.identifier, 0, task.nCaseid, `doc/case${task.nCaseid}/${task.name}.${task.filetype}`, String(task.totalChunks));
    if (statusRes.msg == 1) {

      let uploadRes = await this.uploadDocument(task, statusRes.max);

      if (uploadRes) {

        let completeObj: completeReq = {
          nUDid: 0,
          nUPid: 0,
          identifier: task.identifier,
          totalChunks: task.totalChunks,
          nCaseid: this.store.nCaseid,
          filetype: task.filetype,
          filesize: task.file.size,
          name: task.name,
          nSectionid: nSectionid,
          nBundleid: task.nBundleid ? task.nBundleid : 0, // Add missing property
          nBundledetailid: task.nBundledetailid ? task.nBundledetailid : 0, // Add missing property
          cFilename: task.cFilename, // Add missing property
          cPath: 'doc/case' + this.store.nCaseid + '/' + task.name + '.' + task.filetype
        };
        console.log('completeObj', completeObj);
        let mergeReq = await this.upld.completUpload(completeObj)
        if (mergeReq) {
          callback(null, uploadRes);
        } else {
          callback(false);
        }
      } else {
        callback(false);
      }

    } else {
      callback(false);
    }
  }


  async uploadDocument(task: fileUploadMDL, startChunk: number): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
      let Queue: any;
      const totalTasks = task.totalChunks;
      let completedTasks = 0;
      try {
        // Queue = async.queue(this.chunkUpload.bind(this), this.store.queueConcurrency);
        Queue = async.queue(async (task: chunkUploadMDL, callback: Function) => {
          try {
            await this.chunkUpload(task, callback);
            completedTasks++;
            this.cs.callFunction({ event: 'UPLOAD-PROGRESS', data: { identifier: task.identifier, nProgress: (completedTasks * 100) / totalTasks } });
          } catch (error) {
            console.error('Error processing tasks at uploadDocument queue:', error);
            callback(error);
          }
        }, this.store.queueConcurrency);

        let tasks: chunkUploadMDL[] = await this.store.generateChunkTasks(task, startChunk);
        Queue.push(tasks);
        Queue.drain(() => {
          this.clearGloabalQueue(task)
          console.log('All tasks have been processed', task);
          resolve(true);
        });
        Queue.error((error) => {
          // this.clearGloabalQueue(task)
          console.error('Error executing task:', error, task);
          Queue.kill(); // Terminate the queue to stop processing further tasks
          reject(false);  // Change to reject to properly handle errors
        });
      } catch (error) {
        console.error('Error processing tasks at uploadDocument:', error);
        reject(false);
      }
      this.globalQueueArray.set(task.identifier, Queue);
      // this.globalQueueArray.push(Queue);
    });

  }


  clearGloabalQueue(task: fileUploadMDL) {
    this.globalQueueArray.delete(task.identifier);
  }

  async chunkUpload(task: chunkUploadMDL, callback: Function) {

    try {
      let mdl: sendChunkreq = {
        identifier: task.identifier,
        chunkNumber: task.chunkNumber,
        file: this.getChunk(task.file, task.totalChunks, task.chunkNumber),
        nUPid: 0
      }
      // console.warn('chunkNumber', task.chunkNumber);
      let res = await this.upld.uploadChunk(mdl);
      // console.warn('chunk complete', task.chunkNumber, res);
      if (res) {
        callback(null, res);
      } else {
        callback(false);
      }
    } catch (error) {
      callback(false);
    }
  }

  pauseUpload(x: fileUploadMDL) {
    this.globalQueueArray.get(x.identifier).pause();
  }

  resumeUpload(x: fileUploadMDL) {
    this.globalQueueArray.get(x.identifier).resume();
  }

}
