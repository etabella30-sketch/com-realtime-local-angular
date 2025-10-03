import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  public compareMode: boolean = false;
  public comparetool: boolean = false;
  public issueOpened: boolean = false;
  public fullscreen: boolean = false;
  public showtoolbar: boolean = false;
  public leftMode: string = 'L';
  public rightMode: string = 'T';
  public selectedleftMode: string = 'L';
  public selectedrightMode: string = 'T';
  public tab: any = 1;
  public selectedcompareL: string;
  public selectedcompareR: string;
  nSesdataL: any;
  nSesdataR: any;
  public selectedcompare: any = 'L';


  private selectedCompareSubject = new BehaviorSubject<any>(null);
  selectedCompare$ = this.selectedCompareSubject.asObservable();


  public nSesidL: any = 0;
  public nSesidR: any = 0;

  public nSelectedSesidL: any = 0;
  public nSelectedSesidR: any = 0;
  public timezone: string | null = null;

  async getTimeZone() {
    this.timezone = await this.getTimeZoneFromLocalServer(); //Intl.DateTimeFormat().resolvedOptions().timeZone;

  }

  getCurrentDateWithTimezone(dt?:any,timezone?: string): any {
    const date = dt ? new Date(dt) : new Date();
    const utcDate = date.toLocaleString('en-US', { timeZone: (timezone || this.timezone) });
    const localDate = new Date(new Date(utcDate).toLocaleString('en-US', { timeZone: timezone }));

    return localDate; //moment().tz(timezone || this.timezone).format('YYYY-MM-DD HH:mm:ss');
  }

  setCompare(value: any) {
    this.selectedCompareSubject.next(value);
  }

  updateSelectedCompare(side: 'L' | 'R', value: any) {
    this.selectedcompareL = value;
    this.selectedcompareR = value;
  }

  updateNSesidL(value: any) {
    this.nSesdataL = value;
  }
  updateNSesidR(value: any) {
    this.nSesdataR = value;
  }

  updateCompareL(value: string) {
    this.selectedcompareL = value;
  }
  updateCompareR(value: string) {
    this.selectedcompareR = value;
  }

  constructor(private http: HttpClient) { }

  async getTimeZoneFromLocalServer(): Promise<any> {
    let res: any = null;
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localserver}/timezone`
        )
      );
      res = res.timezone || null;
    } catch (error) {
      console.error(error)
      res = null;
    }
    return res;
  }


}
