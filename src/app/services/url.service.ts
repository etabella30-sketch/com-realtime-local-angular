import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  realtimeserver: any;
  pdfLoadUrl: string = 'https://etabella.sgp1.cdn.digitaloceanspaces.com/';
  version: string = '';
  transferServiceStatus: 'online' | 'offline' = 'offline'
  constructor(private http: HttpClient) {


  }




  async getUrl(): Promise<any> {
    let res: any = {};
    try {
      res = await firstValueFrom(
        this.http.get<any>(
          `${environment.localcloud}/tcp/url`
        )
      );


    } catch (error) {
      console.error(error)
      res = {};
    }

    if (res?.url) {
      this.realtimeserver = `http://${res.url}:${res.port}`;
    }

    if (res?.pdfloadurl) {
      this.pdfLoadUrl = res.pdfloadurl;
    }
    if (res?.version) {
      this.version = res.version;
    }

    if (res?.transferServiceStatus) {
      this.transferServiceStatus = res?.transferServiceStatus;
    }

    return res;
  }

}
