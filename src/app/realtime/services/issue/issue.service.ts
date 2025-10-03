import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { dynamicComboMDL, issueDetailMdL, issueListMdl, issuesMdl, sessionDataMDL } from '../../models/issue.interface';
import { AnnotationService } from '../annotation/annotation.service';
import { SessionService } from '../../../shared/services/session.service';
import { RealtimeService } from '../realtime/realtime.service';
import { UrlService } from '../../../services/url.service';
@Injectable({
  providedIn: 'root'
})
export class IssueService {
  constructor(private http: HttpClient, private annotationService: AnnotationService, private sessionService: SessionService, private realtimeService: RealtimeService, private url: UrlService) {
  }


  async fetchIssueList(mdl: any): Promise<issueListMdl[]> {
    let res: any = [];
    let params = new HttpParams().set('nCaseid', mdl.nCaseid); //22
    params = params.set('nSessionid', mdl.nSessionid); //57
    params = params.set('nUserid', mdl.nUserid); //3
    params = params.set('nIDid', mdl.nIDid); //3
    try {
      res = await firstValueFrom(
        this.http.get<issueListMdl>(
          `${environment.localcloud}/issue/issuelist`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async fetchIssueAllDetail(mdl: any): Promise<issuesMdl[]> {
    let res: any = [];
    let params = new HttpParams().set('nIid', mdl.nIid); //22
    params = params.set('nCaseid', mdl.nCaseid); //22
    params = params.set('nUserid', mdl.nUserid); //22
    params = params.set('nSessionid', mdl.nSessionid); //22

    try {
      res = await firstValueFrom(
        this.http.get<issuesMdl>(
          `${environment.localcloud}/issue/getIssueDetailbyissueid`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async fetchIssueDetail(nIDid: string): Promise<any> {
    let res: any = {};
    let params = new HttpParams().set('nIDid', nIDid);
    try {
      res = await firstValueFrom(
        this.http.get<issuesMdl>(
          `${environment.localcloud}/issue/getissuedetailbyid`, { params: params }
        )
      );
      res = res[0];
    } catch (error) {
      console.error(error)
      res = {} as issueDetailMdL;
    }
    return res;
  }


  async fetchAnnotations(mdl: any): Promise<any[]> {
    let res: any = [];
    let params = new HttpParams().set('nCaseid', mdl.nCaseid);
    params = params.set('nSessionid', mdl.nSessionid);
    params = params.set('nUserid', mdl.nUserid);
    try {
      res = await firstValueFrom(
        this.http.get<issuesMdl[]>(
          `${environment.localcloud}/issue/getissueannotationlist`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async fetchHyperlinks(mdl: any): Promise<any[]> {
    let res: any = [];
    let params = new HttpParams().set('nCaseid', mdl.nCaseid);
    params = params.set('nSessionid', mdl.nSessionid);
    params = params.set('nUserid', mdl.nUserid);
    try {
      res = await firstValueFrom(
        this.http.get<issuesMdl[]>(
          `${environment.localcloud}/issue/gethighlightlist`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async insertIssueDetail(frm: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/insertIssueDetail`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async updateHighlightIssueIds(frm: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/updateHighlightIssueIds`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async updateIssueDetail(frm: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.put<any>(
          `${environment.localcloud}/issue/updateIssueDetail`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async deleteIssueDetail(mdl: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.delete<any>(
          `${environment.localcloud}/issue/deleteIssueDetail`, { body: { nIDid: mdl.nIDid } }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async insertHyperlink(frm: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/inserthighlights`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;

  }



  async deleteHyperlink(nHid: string, cTrans: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.delete<any>(
          `${environment.localcloud}/issue/deletehighlights`, { body: { nHid: nHid, cTranscript: cTrans } }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;

  }
  //////////////////////////////////

  async fetchSession(nSesid: string, nUserid: string, caseid: string): Promise<any> {

    let params = new HttpParams().set('nSesid', (nSesid || 0));
    params = params.set('nUserid', (nUserid || 0));
    params = params.set('nCaseid', (caseid || 0));
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          // `${this.realtimeService.compareMode ? this.url.realtimeserver : environment.localcloud}/session/sessiondatav2`,
          `${environment.localcloud}/session/sessiondatav2`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async issueCreation(frm: any): Promise<any> {
    // frm.nUserid = parseInt(this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/insertIssue`,
          frm
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async removeHighlights(frm: any): Promise<any> {
    // frm.nUserid = parseInt(this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/removemultihighlights`,
          frm
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async categoryCreation(frm: any): Promise<any> {
    // frm.nUserid = parseInt(this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/issue/insertCategory`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }



  async getPreviousSessions(nCaseid: string, nUserid: string): Promise<any> {
    let params = new HttpParams().set('nCaseid', nCaseid || 0);
    params = params.set('nUserid', nUserid || 0);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/session/getsessionsbycaseid`,
          { params: params }
        )
      );
      if (!res.length) {
        res = [];
      }
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async getLiveSessionByCaseid(nCaseid: string, nUserid: string): Promise<any> {
    let params = new HttpParams().set('nCaseid', nCaseid);
    params = params.set('nUserid', nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/getlivesessionbycaseid`,
          { params: params }
        )
      );
      if (!res.length) {
        res = [];
      }
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getCategory(nCaseid: string, nUserid: string): Promise<any> {
    let params = new HttpParams().set('nCaseid', nCaseid);
    params = params.set('nUserid', nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/issue/getissuecategorylist`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async issueUpdate(frm: any): Promise<any> {
    // frm.nUserid = parseInt(this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.put<any>(
          `${environment.localcloud}/issue/updateIssue`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }



  async issueDelete(nIid: string): Promise<any> {
    const url = `${environment.localcloud}/issue/deleteIssue`;
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.request('delete', url, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          body: {
            nIid: nIid
          }
        })
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async getRealtimeDataBySessionId(nSesid: string, nUserid: string, nCaseid: string): Promise<any> {
    let params = new HttpParams().set('nSesid', nSesid);
    params = params.set('nUserid', nUserid);
    params = params.set('nCaseid', nCaseid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localserver}/session/realtimedatabysesid`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async fetchSessionObj(id, userid, caseid): Promise<sessionDataMDL> {
    return new Promise<sessionDataMDL>(async (resolve, reject) => {

      let obj: sessionDataMDL = {} as sessionDataMDL;
      try {

        let data = await this.fetchSession((id), userid, caseid || 0);
        if (data && data.length) {
          obj = {
            cCasename: String(data[0].cCasename),
            cName: String(data[0].cName),
            cStatus: String(data[0].cStatus),
            maxNumber: Number(data[0].maxNumber || 0),
            lastPage: 0,
            pageRes: data[0]["pageRes"],
            secondLastRes: data[0]["secondLastRes"],
            lastLineNumber: 0,
            nSesid: data[0].nSesid || null,
            nCaseid: (data[0].nCaseid || 0),
            totaIssues: Number(data[0].totaIssues || 0),
            nLSesid: Number(data[0].nLSesid || 0),
            settings: {
              lineNumber: data[0].nLines,
              startPage: data[0].nPageno
            },
            isTrans: data[0].isTrans,
            nDemoid: data[0].nDemoid,
            cProtocol: data[0].cProtocol
          }
          this.sessionService.casename = data[0].cCasename;
          this.sessionService.cCaseno = data[0].cCaseno;
          // console.log('session data', data[0]);
          try {

            this.annotationService.setHighLightIssueIds(data[0].cDefHIuuses);
            this.annotationService.setLastIssue({ nIid: data[0].nLID, cColor: data[0].cColor })

          } catch (error) {
            console.error(error)
          }
          try {
            this.annotationService.setAnnotsIssueIds(data[0].cDefIssues);
            this.annotationService.setAnnoLastIssue({ nIid: data[0].nLIid, cColor: data[0].cAColor })
          } catch (error) {
            console.error(error)
          }




        }
      } catch (error) {

      }

      resolve(obj);

    })

  }


  async deleteDemoIssues(mdl: any): Promise<any> {

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(`${environment.localcloud}/issue/deletedemoissuedetail`, mdl));
      if (res && res.length) {
        res = res;
      }
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getDynamicCombo(nCategoryid: number): Promise<any> {

    let params = new HttpParams().set('nCategoryid', nCategoryid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/issue/dynamiccombo`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getLastIssue(data: any): Promise<any> {

    let params = new HttpParams().set('jIids', JSON.stringify(data));

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/issue/getLastIssue`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async exportAnnotIssueHighlight(mdl: any): Promise<any> {

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(`${environment.localcloud}/issue/annothighlightexport`, mdl));
      if (res && res.length) {
        console.log('annothighlightexport', res);
        res = res;
      }
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  // downloadFile(cPath: string): Observable<Blob> {
  //   let params = new HttpParams()
  //   params = params.set('cPath', cPath);
  //   const headers = new HttpHeaders().set('Content-Type', 'application/json');

  //   return this.http.get(`${environment.cloudUrl}${this.url.realtimeserver}/issue/download`, {
  //     params: params,
  //     headers: headers,
  //     responseType: 'blob' // Important to specify blob as the response type
  //   });
  // }

  downloadFile(filePath: string): Observable<Blob> {
    return this.http.get(filePath, { responseType: 'blob' });
  }



  async setDefault(mdl: any) {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localserver}/issue/setdefault`,
          mdl
        )
      );

    } catch (error) {
      console.error(error)
      res = { msg: -1 };
    }
    return res;
  }



  async syncUsers() {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localserver}/syncuserdata`,
          {}
        )
      );

    } catch (error) {
      console.error(error)
      res = { msg: -1 };
    }
    return res;
  }


  async updateIssueNote(mdl: any): Promise<any> {

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(`${environment.localserver}/issue/update/issuedetail/note`, mdl));
      if (res && res.length) {
        res = res;
      }
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }



  async getIssueVersions(nIDid: string): Promise<any> {
    let res: any = {};
    let params = new HttpParams().set('nIDid', nIDid);
    try {
      res = await firstValueFrom(
        this.http.get<issuesMdl>(
          `${environment.localcloud}/issue/versions`, { params: params }
        )
      );
      // res = res[0];
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }



  async getIssueDetailAnots(nSessionid: string, nUserid: string, nCaseid: string, cTranscript: string): Promise<any> {

    let params = new HttpParams().set('nSessionid', (nSessionid || 0));
    params = params.set('nUserid', (nUserid || 0));
    params = params.set('nCaseid', (nCaseid || 0));
    params = params.set('cTranscript', (cTranscript || 'N'));
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/issue/issuedetail/annotations`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }

}
