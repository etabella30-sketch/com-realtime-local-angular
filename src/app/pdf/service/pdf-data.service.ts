import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocInfo, globalAnnots, linkExplorerList, PDFAnnotation } from '../interfaces/pdf.interface';
import { UrlService } from '../../services/url.service';

@Injectable({
  providedIn: 'root'
})
export class PdfDataService {

  private linkMode = { 'IF': 'incomming/factlinks', 'OF': 'outgoing/factlinks', 'ID': 'incomming/doclinks', 'OD': 'outgoing/doclinks' };
  constructor(private http: HttpClient,private url:UrlService) { }



  async fetchDocInfo(nBundledetailid: string): Promise<DocInfo> {
    const params = new HttpParams().set('nBundledetailid', nBundledetailid);
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<DocInfo>(
          // `${this.url.realtimeserver}/session/getDocinfo`, { params: params }
          `${environment.cloudUrl}/session/getDocinfo`, 
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = {} as DocInfo;
    }
    return res;
  }


  async getGlobalAnnotats(nBundledetailid: string): Promise<globalAnnots[]> {
    return []
  }




  async getAnnotation(nBundledetailid: string): Promise<PDFAnnotation[]> {
   return []
  }




  async updateRotation(mdl): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<any>(`${environment.cloudUrl}${environment.coreservice}/individual/updaterotation`, mdl)
      );
      if (res && res.msg == 1) {
        return res;
      } else {
        return res;
      }
    } catch (err) {
      return { msg: -1, error: err, value: '' };
    }
  }

  downloadFile(filePath: string): Observable<Blob> {
    return this.http.get(filePath, { responseType: 'blob' });
  }





  async deleteAnnoatation(mdl): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<any>(`${environment.cloudUrl}${environment.coreservice}/fact/deletehighlight`, mdl)
      );
      if (res) {
        return res[0];
      } else {
        return res;
      }
    } catch (err) {
      return { msg: -1, error: err, value: '' };
    }
  }



  async addAnnotation(mdl): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<any>(`${environment.cloudUrl}${environment.coreservice}/fact/addhighlight`, mdl)
      );
      if (res) {
        return res[0];
      } else {
        return res;
      }
    } catch (err) {
      return { msg: -1, error: err, value: '' };
    }
  }





  async getLinks(nBundledetailid: string, apilink: string): Promise<linkExplorerList[]> {
    const params = new HttpParams().set('nBundledetailid', nBundledetailid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<linkExplorerList[]>(
          `${environment.cloudUrl}${environment.coreservice}/individual/${this.linkMode[apilink]}`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }





  async getHyperLinkFile(nBundledetailid: string, nDocid: number): Promise<DocInfo> {
    let params = new HttpParams().set('nBundledetailid', nBundledetailid);
    params = params.set('nDocid', nDocid);
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<DocInfo>(
          `${environment.cloudUrl}${environment.coreservice}/individual/gethyperlinkfile`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = {} as DocInfo;
    }
    return res;
  }



}
