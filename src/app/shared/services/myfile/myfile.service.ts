import { Injectable } from '@angular/core';
import { TostbarService } from '../../../core/services/tost/tostbar.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SecureStorageService } from '../../../core/services/storage/secure-storage.service';
import {
  BundleCommonRes, TeamUsersRes, bundelTypeReq, bundleBuilder, bundleBuilderRes, bundleDetailReq, bundleDetailRes, bundlePermission, bundleReq, bundleRes, bundleTypeRes, copyCommonRes, deleteBundleReq, fileRename, fileUpdateDetail, filedataReq, filedataRes, pasteBundleReq, recentfileReq, recentfileRes, undoBundleReq, updateBundletag, clearRecentRes, updateFiletab,
  bundleTagReq, bundleTagRes, bundleTabRes, assignCustomBundleReq, viewBundlesRes,
  assignContact,
  assignTask,
  assignTag,
  displayRes,
  BundleLinksRes,
  BundleLinksReq
} from '../../interfaces/myfile.interface';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UrlService } from '../../../services/url.service';


@Injectable({
  providedIn: 'root'
})
export class MyfileService {

  constructor(public sStore: SecureStorageService, private http: HttpClient, public tost: TostbarService, private url: UrlService) {

  }


  async getFiledata(mdl: filedataReq): Promise<filedataRes> {
    try {
      var params = new HttpParams()
      for (const key in mdl) {
        if (mdl.hasOwnProperty(key)) {
          params = params.set(key, mdl[key]);
        }
      }
      const res: any = await firstValueFrom(
        this.http.get<filedataRes[]>(
          // `${this.url.realtimeserver}/session/filedata`,
          `${environment.cloudUrl}/session/filedata`,
          { params: params }
        )
      );

      return res?.length ? res[0] : { nBundledetailid: '', cPath: 'nofile.pdf', cPage: '', cFiletype: 'PDF' };
    } catch (err) {
      return { nBundledetailid: '', cPath: 'nofile.pdf', cPage: '', cFiletype: 'PDF' };
    }
  }


}
