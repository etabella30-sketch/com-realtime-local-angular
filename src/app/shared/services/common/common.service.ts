import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { codeData } from '../../interfaces/common.interface';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { myTeamUsers } from '../../../pdf/interfaces/pdf.interface';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }




  async getCode(nId: number): Promise<codeData[]> {
    const params = new HttpParams().set('nCategoryid', nId);
    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<codeData[]>(
          `${environment.cloudUrl}${environment.coreservice}/common/getcode`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }




  async getMyTeamUsers(nCaseid: string): Promise<myTeamUsers[]> {
    return [];
    // const params = new HttpParams().set('nCaseid', nCaseid);
    // let res: any = [];
    // try {
    //   res = await firstValueFrom(
    //     this.http.get<myTeamUsers[]>(
    //       `${environment.cloudUrl}${environment.coreservice}/common/myteamusers`, { params: params }
    //     )
    //   );
    // } catch (error) {
    //   console.error(error)
    //   res = [];
    // }
    // return res;
  }

  async getcolorid(data: any): Promise<myTeamUsers[]> {
    let params = new HttpParams().set('jIids', JSON.stringify(data));

    let res: any = [];
    try {
      res = await firstValueFrom(
        this.http.get<myTeamUsers[]>(
          `${environment.cloudUrl}${environment.coreservice}/common/getcolorid`, { params: params }
        )
      );
    } catch (error) {
      console.error(error)
      res = [];
    }
    return res;
  }

  get_dts(sdt, endt) {
    try {
      var day_count = sdt.getDate() - endt.getDate();
      var crnt_count = sdt.getDate() - new Date().getDate();
      var pg: any = (crnt_count / day_count) * 100;
      pg = pg > 0 ? pg.toFixed(0) : 0;
    } catch (error) {
    }
    return pg;
  }

  downloadFile(filePath: string): Observable<Blob> {
    return this.http.get(filePath, { responseType: 'blob' });
  }

}
