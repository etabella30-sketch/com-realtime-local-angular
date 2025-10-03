import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { SecureStorageService } from '../storage/secure-storage.service';
import { LoginRequestMdl, LoginResponce } from '../../interfaces/login.interface';
import { TostbarService } from '../tost/tostbar.service';

@Injectable()
export class LoginService {
  isinvalid: boolean = false;
  broweserid: string = '';
  constructor(private http: HttpClient, public secureStorage: SecureStorageService, public tost: TostbarService) {
    this.broweserid = this.secureStorage.getOrCreateBrowserUniqueId();
    this.secureStorage.setStorage('browserid', this.broweserid);
  }

  async login(mdl: LoginRequestMdl, keepMeLogin: boolean): Promise<boolean> {
    debugger;
    try {
     /// mdl.cBroweserid = this.secureStorage.getOrCreateBrowserUniqueId();
   //   mdl.cToken = await this.secureStorage.getFCMToken();
      mdl.cRTKey = `${environment.rtKey}`;
      mdl["cUnicuserid"] = localStorage.getItem('cUnicuserid') ||  '';
      const res: any = await firstValueFrom(
        this.http.post<LoginResponce>(`${environment.authUrl}/auth/signinrt`, mdl)
      );
      if (res && res.msg == 1) {
        window.localStorage.setItem('nUserid', res.userDetail['nUserid']);
        this.secureStorage.setUserInfo(res.userDetail, (keepMeLogin ? res.expir_limit : 0))
        this.secureStorage.setJWTToken(res.userDetail['cJwt'] , (keepMeLogin ? res.expir_limit : 0));
       
        return true;
   
      } else {
       
        this.isinvalid = true;
        return false;
      }
    } catch (err) {
      this.tost.openSnackBar(`Login failed ${err}`, 'E');
      return false;
    }
  }


}
