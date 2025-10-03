import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Email, EmailRes } from '../interfaces/pdf.interface';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  globalUrl: string = environment.name == 'mipl' ? 'http://192.168.1.6:5002' : `${environment.cloudUrl}`;
  constructor(private http: HttpClient) { }



  async getEmailparser(path: string, nId: string): Promise<EmailRes> {
    let params = new HttpParams().set('cPath', path);
    params = params.set('nId', nId);
    let res: any = [];
    try {

      // `${this.globalUrl}/session/getemailparse`, { params: params }
      res = await firstValueFrom(
        this.http.get<EmailRes>(
          `${this.globalUrl}/session/getemailparse`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }


  async getAttechment(path: string, id: number): Promise<Blob> {
    let params = new HttpParams().set('cPath', path).set('nId', id.toString()); // Ensure `id` is passed as a string

    let res: Blob;
    try {
      res = await firstValueFrom(
        this.http.get<Blob>(`${environment.cloudUrl}${environment.coreservice}/session/getattechment`, {
          params: params,
          responseType: 'blob' as 'json', // Ensure we receive the response as a Blob
        })
      );
    } catch (error) {
      console.error('Error fetching attachment:', error);
      res = null;
    }
    return res;
  }


}
