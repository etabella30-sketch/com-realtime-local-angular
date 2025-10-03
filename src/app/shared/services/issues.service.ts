import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { Observable, firstValueFrom } from 'rxjs';
import { TostbarService } from '../../core/services/tost/tostbar.service';
import { UrlService } from '../../services/url.service';

@Injectable({
  providedIn: 'root'
})
export class IssuesService {
  current_session: any = {};
  issuemode: any = 'A';
  nIDid: any = 0;
  cUnicuserid: any = 0;
  nUserid: any = 0;
  pastIsuueColor: any = [];
  isEditing:boolean = false;
  cPermission:any = 'N';
  Hid:any = 0;
  constructor(private http: HttpClient, private snackBar: MatSnackBar, private toast: TostbarService,private url:UrlService) {
    this.cUnicuserid = this.getLocalStorage('cUnicuserid');
    this.nUserid = this.getLocalStorage('nUserid');
  }

  getLocalStorage(key) {
    let val = localStorage.getItem(key);
    return val;
  }

  show(message: string, type) {
    // this.snackBar.open(message, action, {
    //   duration: 3000, 
    // });
    this.toast.openSnackBar(message, type);
  }


  jumptohilight(data: any): void {
    console.log('Parent function called with data:', data);
  }



  async issueCreation(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/issue/insertIssue`,
          frm
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getIssue(nCaseid: number): Promise<any> {

    let params = new HttpParams().set('nCaseid', nCaseid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/issue/issuelist`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async issueDelete(nIid: number): Promise<any> {
    const url = `${this.url.realtimeserver}/issue/deleteIssue`;
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

  async issueUpdate(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.put<any>(
          `${this.url.realtimeserver}/issue/updateIssue`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getCategory(nCaseid: number): Promise<any> {

    let params = new HttpParams().set('nCaseid', nCaseid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/issue/list`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async categoryCreation(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/issue/insertCategory`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async categoryDelete(nICid: string): Promise<any> {
    let params = new HttpParams().set('nICid ', nICid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.delete<any>(
          `${this.url.realtimeserver}/issue/deleteCategory`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async categoryUpdate(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.put<any>(
          `${this.url.realtimeserver}/issue/updateCategory`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async issueDetailCreation(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/issue/insertIssueDetail`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async HighlightCreation(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/issue/insertHighlights`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async HighlightDelete(frm: any): Promise<any> {

    let params = new HttpParams().set('nHid', frm.nHid);
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.delete<any>(
          `${this.url.realtimeserver}/issue/deleteHighlights`, { params: params }
        )
      );
      res = res[0]
    } catch (error) {
      console.error(error)
      res = {};
    }
    return res;
  }


  async getHighlight(frm: any): Promise<any> {

    let params = new HttpParams()
    params = params.set('nCaseid', frm.nCaseid);
    params = params.set('nSessionid', frm.nSessionid);
    params = params.set('nUserid', this.nUserid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/issue/GetHighlightList`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }



  async getIssueDetail(nIDid: number): Promise<any> {

    let params = new HttpParams().set('nIDid', nIDid);

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${this.url.realtimeserver}/issue/getissuedetails`,
          { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async issueDetailUpdate(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.put<any>(
          `${this.url.realtimeserver}/issue/updateIssueDetail`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getIssueDetailList(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/issue/getIssueDetailsGrouped`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async getAnnotation(frm: any): Promise<any> {
    frm.nUserid = (this.nUserid);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.post<any>(
          `${this.url.realtimeserver}/issue/getIssueAnnot`,
          frm
        )
      );

    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  async issueDetailDelete(nIDid: number): Promise<any> {
    const url = `${this.url.realtimeserver}/issue/deleteIssueDetail`;
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.request('delete', url, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          },
          body: {
            nIDid: nIDid
          }
        })
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




}