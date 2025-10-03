import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class UpldService {

  private apiUrl = `${this.url.realtimeserver}/upload`; // Backend URL

  constructor(private http: HttpClient,private url:UrlService) { }

  uploadFile(file: File, customFileName: string, caseId: any): Observable<any> {
    const formData = new FormData();
    formData.append('filename', customFileName); // Add custom filename
    formData.append('caseid', caseId); // Add case ID
    formData.append('file', file);
  
    return this.http.post(this.apiUrl, formData);
  }
}
