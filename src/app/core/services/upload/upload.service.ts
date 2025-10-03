import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { retryWhen, tap, delay, catchError, scan, takeWhile } from 'rxjs/operators';
import { ChunkStatusRes, UploadResponse, caseDetailMDL, checkDuplicacyMDL, completeReq, reportDetailMDL, reportSummaryMDL, sectionDetailMDL, sendChunkreq } from '../../interfaces/upload.interface';
import { UrlService } from '../../../services/url.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  uploadstep = 1;
  isreport = false;
  nMasterid = 1;
  constructor(private http: HttpClient,private url:UrlService) {
  }



  async fetchCaseDetail(nCaseid: number): Promise<caseDetailMDL> {
    try {
      const params = new HttpParams().set('nCaseid', nCaseid);
      const res: any = await firstValueFrom(
        this.http.get<any>(`${this.url.realtimeserver}/session/casedetail`, { params: params })
      );
      return res.length ? res[0] : { nCaseid: 0, cCasename: '', cCaseno: '', dUpdateDt: '', cTeamname: '' };
    } catch (err) {
      return { nCaseid: 0, cCasename: '', cCaseno: '', dUpdateDt: '', cTeamname: '' };
    }
  }



  async fetchSectionDetail(nSectionid: number): Promise<sectionDetailMDL> {
    try {
      const params = new HttpParams().set('nSectionid', nSectionid);
      const res: any = await firstValueFrom(
        this.http.get<any>(`${this.url.realtimeserver}/session/sectiondetail`, { params: params })
      );
      return res.length ? res[0] : { nSectionid: 0, cFolder: '' };
    } catch (err) {
      return { nSectionid: 0, cFolder: '' };
    }
  }

  async fetchBundleDetail(nBundleid: number): Promise<any> {
    try {
      const params = new HttpParams().set('nBundleid', nBundleid);
      const res: any = await firstValueFrom(
        this.http.get<any>(`${this.url.realtimeserver}/session/bundle`, { params: params })
      );
      return res.length ? res[0] : { nBundleid: 0, cBundlename: '' };
    } catch (err) {
      return { nBundleid: 0, cBundlename: '' };
    }
  }


  async checkDuplicacy(mdl: checkDuplicacyMDL): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<any>(`${this.url.realtimeserver}/session/checkduplicacy`, mdl)
      );
      return res;
    } catch (err) {
      return { msg: -1, error: err, value: '' };
    }
  }



  async checkStatus(identifier: string, nUPid: number, nCaseid: number, cPath: string, cTotal: string): Promise<ChunkStatusRes> {
    try {
      // let params = new HttpParams().set('identifier', identifier);
      // params = params.set('nMasterid', this.nMasterid);
      const params = new HttpParams().set('identifier', identifier).set('nMasterid', this.nMasterid).set('nUPid', nUPid).set('nCaseid', nCaseid).set('cPath', cPath).set('cTotal', cTotal);
      // const res: any = await firstValueFrom(
      //   this.http.get<any>(`${environment.serverCloudUrl}${environment.uploadservice}/upload/status`, { params: params })
      // );

      const res: any = await firstValueFrom(
        this.http.get<any>(`${environment.serverCloudUrl}${environment.uploadservice}/realtime-upload/status`, { params: params })
          .pipe(
            retryWhen(errors =>
              errors.pipe(
                scan((acc, error) => {
                  if (acc >= 5) {
                    throw new Error('Retry limit reached');
                  }
                  return acc + 1;
                }, 0),
                delay(1500), // Delay between retries
                tap((err: any) => {
                  if (err.status === 404) { // Handle specific HTTP errors if needed
                    throw new Error('API endpoint not found.');
                  }
                }),
                tap(res => {
                  if (!res || res.msg !== 1) { // Check if the response is not as expected
                    throw new Error('Invalid response.');
                  }
                }),
                catchError(err => { throw new Error('Unhandled error: ' + err.message); }) // Rethrow with additional error message
              )
            )
          )
      );

      return res ? res : { max: 0, msg: -1 };
    } catch (err) {
      return { max: 0, msg: -1 };
    }
  }

  async uploadChunk(mdl: sendChunkreq): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('identifier', mdl.identifier);
      formData.append('chunkNumber', mdl.chunkNumber.toString());
      formData.append('nUPid', String(mdl.nUPid));
      formData.append('file', mdl.file);

      const res: UploadResponse = await firstValueFrom(
        this.http.post<UploadResponse>(`${environment.serverCloudUrl}${environment.uploadservice}/realtime-upload/upload-chunk`, formData)
          .pipe(
            retryWhen(errors =>
              errors.pipe(
                scan((acc, error) => {
                  if (acc >= 5) {
                    throw new Error('Retry limit reached');
                  }
                  return acc + 1;
                }, 0),
                delay(1500), // Delay between retries
                tap((err: any) => {
                  if (err.status === 404) { // Handle specific HTTP errors if needed
                    throw new Error('API endpoint not found.');
                  }
                }),
                catchError((err) => {
                  console.error('ERROR AT CATCH', err);
                  throw new Error('Unhandled error: ' + err.message);
                }) // Rethrow with additional error message
              )
            ),
            tap(res => {
              if (!res || res.m !== 1) { // Check if the response is not as expected
                throw new Error('Invalid response.');
              }
            })
          )
      );
      return true;
    } catch (err) {
      console.error('Failed to upload chunk:', err);
      return false;
    }
  }






  async completUpload(mdl: any): Promise<boolean> {
    try {
      // const res: any = await firstValueFrom(
      //   this.http.post<any>(`${environment.serverCloudUrl}${environment.uploadservice}/upload/complete-upload`, mdl)
      // );
      mdl.nMasterid = this.nMasterid;
      const res: any = await firstValueFrom(
        this.http.post<any>(`${environment.serverCloudUrl}${environment.uploadservice}/realtime-upload/complete-upload`, mdl)
          .pipe(
            retryWhen(errors =>
              errors.pipe(
                scan((acc, error) => {
                  if (acc >= 5) {
                    throw new Error('Retry limit reached');
                  }
                  return acc + 1;
                }, 0),
                delay(1500), // Delay between retries
                tap((err: any) => {
                  if (err.status === 404) { // Handle specific HTTP errors if needed
                    throw new Error('API endpoint not found.');
                  }
                }),
                tap(res => {
                  if (!res || res.msg !== 1) { // Check if the response is not as expected
                    throw new Error('Invalid response.');
                  }
                }),
                catchError(err => { throw new Error('Unhandled error: ' + err.message); }) // Rethrow with additional error message
              )
            )
          )
      );
      return true;
    } catch (err) {
      return false;
    }
  }








  async fetchReportSummary(nCaseid: number): Promise<reportSummaryMDL[]> {
    try {
      const params = new HttpParams().set('nCaseid', nCaseid);
      const res: any = await firstValueFrom(
        this.http.get<reportSummaryMDL[]>(`${environment.serverCloudUrl}${environment.coreservice}/upload/uploadsummary`, { params: params })
      );
      return res;
    } catch (err) {
      return [];
    }
  }


  async fetchReportDetail(nUPid: number): Promise<reportDetailMDL[]> {
    try {
      const params = new HttpParams().set('nUPid', nUPid);
      const res: any = await firstValueFrom(
        this.http.get<reportDetailMDL[]>(`${environment.serverCloudUrl}${environment.coreservice}/upload/uploaddetail`, { params: params })
      );
      return res;
    } catch (err) {
      return [];
    }
  }

}