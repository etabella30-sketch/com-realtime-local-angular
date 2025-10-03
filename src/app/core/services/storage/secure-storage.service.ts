import { Injectable } from '@angular/core';
import { CookiesService } from '../cookies/cookies.service';
import { setUserInfo } from '../../interfaces/login.interface';
import { LocalStorageService } from './local-storage.service';
@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  userInfo: setUserInfo;
  token: string = '';
  fcmtoken: string = '';
  constructor(private cookiesService: CookiesService, public storage: LocalStorageService) { }



  setUserInfo(userInfo: setUserInfo, limit: number) {
    this.userInfo = userInfo;
    this.cookiesService.setCookie('userInfo', userInfo, true, limit);
  }

  async getUserInfo(): Promise<any> {
    if (this.userInfo && Object.keys(this.userInfo).length) {
      return this.userInfo;
    }
    try {
      this.userInfo = await this.cookiesService.getCookie('userInfo', true);
      return this.userInfo;
    } catch (error) {
      console.error('Failed to get userInfo from cookies:', error);
      return { nUserid: 0, cFname: '', cLname: '', cEmail: '', cProfile: null, isAdmin: false };
    }
  }



  async getUserId(): Promise<string | null> {
    if (this.userInfo && Object.keys(this.userInfo).length) {
      return this.userInfo.nUserid;
    }
    try {
      this.userInfo = await this.cookiesService.getCookie('userInfo', true);
      if (this.userInfo && Object.keys(this.userInfo).length) {
        return this.userInfo.nUserid;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user id from cookies:', error);
      return null;
    }
  }

  getStorage(key: string): any {
    return this.storage.getData(key, false, true);
  }

  setStorage(key: string, value: any) { this.storage.setData(key, value); }


  async setJWTToken(jwt: string, limit: number) {
    try {
      this.token = jwt;
      await this.cookiesService.setCookie('token', jwt, false, limit);
    } catch (error) {
      console.error('Failed to set user information to coockies', error)
    }
  }

  async getJWTToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }
    try {
      this.token = await this.cookiesService.getCookie('token', false, true);
      return this.token;
    } catch (error) {
      console.error('Failed to get JWT token from cookies:', error);
      return '';
    }
  }

  setFCMToken(fcmtoken: string) {
    try {
      this.fcmtoken = fcmtoken;
      this.storage.setData('fcmtoken', fcmtoken);
    } catch (error) {
      console.error('Failed to set FCM token in local storage:', error);
    }
  }

  getFCMToken() {
    this.fcmtoken = this.fcmtoken || this.storage.getData('fcmtoken') || "";
    return this.fcmtoken;
  }

  logOut() {
    this.cookiesService.deleteCookie('userInfo');
    this.cookiesService.deleteCookie('token');
    this.token = null;
    this.userInfo = null;
  }

  async checkLogin(): Promise<boolean> {
    const result = await this.getJWTToken();
    return !!result;
  }

  getOrCreateBrowserUniqueId(): string {
    return `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;
  }



}
