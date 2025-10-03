import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonfunctionService } from '../../core/utility/commonfunction.service';
import { SocketService } from './socket.service';
import { UrlService } from '../../services/url.service';



@Injectable({
  providedIn: 'root'
})
export class SessionService {
  cUnicuserid: any = 0;
  nUserid: any = 0;
  types = ['Attempt', 'Connected', 'Disconnected', 'Error', 'Feed', 'Success'];
  current_case: any = {}
  casename: any = '';
  cCaseno: any = '';
  constructor(private cs: CommonfunctionService, private http: HttpClient, private snackBar: MatSnackBar, public socketService: SocketService, private url: UrlService) {
    this.cUnicuserid = this.getLocalStorage('cUnicuserid');
    this.nUserid = this.getLocalStorage('nUserid');
    //console.log('this.cUnicuserid, this.nUserid',this.cUnicuserid, this.nUserid)
  }

  setLocalStorage(key, val) {
    localStorage.setItem(key, val);
  }

  getLocalStorage(key) {
    let val = localStorage.getItem(key);
    return val;
  }

  async fetchLocalServer(): Promise<any> {

    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localserver}/tcp/getserver`
        )
      );
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }

  async getSessions(nPageNumber: number): Promise<any> {

    let params: any = new HttpParams().set('pageNumber', nPageNumber);

    params = params.set('cUnicuserid', this.cUnicuserid);
    // 2024-05-02T15:29:09+05:30
    let res: any = [];
    params = params.set('dDate', this.cs.getCurrentTime()); // new Date().getFullYear();
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/session/list`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  // 

  async getLogSession(): Promise<any> {
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/log/sessionid`
        )
      );
    } catch (error) {
      console.error(error)
      res = { msg: -1 };
    }
    return res;
  }


  async fetchSession(id: number): Promise<any> {
    let params = new HttpParams().set('nSesid', id);
    params = params.set('cUnicuserid', this.cUnicuserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/sessiondata`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async reinitSessions() {
    await firstValueFrom(
      this.http.post<any>(
        `${environment.localserver}/tcp/reinitsession`,
        { cUnicuserid: this.cUnicuserid }
      )
    );

  }

  async sessionBuilder(frm: any): Promise<any> {
    frm.cUnicuserid = this.cUnicuserid;
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/sessionbuilder`,
          frm
        )
      );
      try {
        this.reinitSessions();
        this.socketService.sendMessage('reinilize-sockets', { msg: 1 });
      } catch (error) {

      }
      // await firstValueFrom(
      //   this.http.post<any>(
      //     `${environment.localserver}/tcp/reinitsession`,
      //     { cUnicuserid: this.cUnicuserid }
      //   )
      // );
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }



  async sessionDelete(nSesid: string): Promise<any> {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/sessiondelete`,
          { nSesid: nSesid }
        )
      );
      this.reinitSessions();
      this.socketService.sendMessage('reinilize-sockets', { msg: 1 });
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }



  async sysCaseUsers(nSesid: string, nCaseid: number): Promise<any> {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/refetchusers`,
          { nSesid: nSesid, nCaseid: nCaseid }
        )
      );
    } catch (error) {
      console.error(error);
      res = [];
    }
    return res;
  }




  async sessionEnd(nSesid: string): Promise<any> {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/sessionend`,
          { nSesid: nSesid, permission: 'C' }
        )
      );

      this.reinitSessions();

      this.socketService.sendMessage('reinilize-sockets', { msg: 1 });

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async serverList(): Promise<any> {

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/session/servers`
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async addServer(frm: any): Promise<any> {
    frm.cUnicuserid = this.cUnicuserid;
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/serverbuilder`,
          frm
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async setServer(nSesid: string, nRTSid: number): Promise<any> {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/session/setserver`,
          { nSesid: nSesid, nRTSid: nRTSid }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async getTeams(nCaseid: number): Promise<any> {

    let params = new HttpParams().set('nCaseid', nCaseid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/teamsusers`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async getSeachedUsers(nCaseid: number, cSearch: string): Promise<any> {

    let params = new HttpParams().set('nCaseid', nCaseid);
    params = params.set('cSearch', cSearch);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/searchusers`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async assignUser(param: any): Promise<any> {
    param.cUnicuserid = this.cUnicuserid;
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/assign`,
          param
        )
      );

      this.socketService.sendMessage('reinilize-sockets', { msg: 1 });

      this.reinitSessions();
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async saveLocalServer(param: any): Promise<any> {
    param.cUnicuserid = this.cUnicuserid;
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localserver}/tcp/setserver`,
          param
        )
      );
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }

  async setLocalUserId(cUnicuserid): Promise<any> {
    debugger;
    this.cUnicuserid = cUnicuserid;
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localserver}/tcp/setuserid`,
          { cUnicuserid: this.cUnicuserid }
        )
      );
      this.nUserid = res.nUserid;

      this.cUnicuserid = res.cUnicuserid;
      // this.setLocalStorage('nUserid', res.nUserid);
      // this.setLocalStorage('cUnicuserid', res.cUnicuserid);
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }




  show(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 3000, // Duration the snack-bar will be shown, in milliseconds
    });
  }
  async getConLogs(nPage: number, date?: string, cSearch?: string): Promise<any> {

    let params = new HttpParams().set('nUserid', this.nUserid);
    params = params.set('nPage', nPage);
    params = params.set('cSearch', cSearch);
    if (date) {
      params = params.set('dDate', date);
    }
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/getConnectivityLog`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async getAssigned(nSesid: string): Promise<any> {

    let params = new HttpParams().set('nSesid', nSesid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/getassigned`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getCaseList(pageNumber: number): Promise<any> {
    let params = new HttpParams()
    params = params.set('cUnicuserid', this.cUnicuserid);
    // params = params.set('pageNumber ', pageNumber);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/caselist`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getCaseFiles(nCaseid: number): Promise<any> {
    let params = new HttpParams()
    params = params.set('nCaseid', nCaseid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/transcriptfiles`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getPreviousSessions(nCaseid: number): Promise<any> {
    let params = new HttpParams().set('nCaseid', nCaseid);
    params = params.set('nUserid', 0);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/session/getsessionsbycaseid`,
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



  async publishFile(nBundledetailid: number, cStatus: string): Promise<any> {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/session/publishfile`,
          { nBundledetailid: nBundledetailid, cStatus: cStatus }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  downloadFile(url: string): Observable<Blob> {
    // var path = 'D:/apiportal/etabella-nestjs/assets/'
    return this.http.get(environment.localserver + '/assets/' + url, {
      responseType: 'blob'
    });
  }




  async transsciptUpdate(nSesid: string, nUserid: string, nCaseid: number, cFlag: string, cProtocol: string): Promise<any> {
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/session/updatetranscriptstatus`,
          { nSesid: nSesid, nUserid: nUserid, cFlag: cFlag, nCaseid: nCaseid, cProtocol: cProtocol }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async transcriptSync(x): Promise<any> {
    let res;
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/transcriptsync`,
          { nSesid: x.nSesid, nUserid: x.nUserid, nCaseid: x.nCaseid }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }

    return res;
  }




  
  async getRefreshType(): Promise<any> {
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/session/getrefreshtype`
        )
      );
    } catch (error) {
      console.error(error)
      res = { msg: -1 };
    }
    return res;
  }


  
  async setRefreshType(cType: string): Promise<any> {
    let res;
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${environment.localcloud}/session/setrefreshtype`,
          { cType }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }

    return res;
  }



}
