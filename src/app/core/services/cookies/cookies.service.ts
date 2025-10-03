import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  constructor(private cookieService: CookieService, public encS: EncryptionService) { }

  async setCookie(key: string, value: any, isEncrypt?: boolean, expiRes?: number) {
    const encryptedValue = isEncrypt ? await this.encS.encrypt(value) : value;
    const cookieOptions: any = { path: '/' };
    if (expiRes !== 0) {
      const expiresDate = new Date();
      expiresDate.setDate(expiresDate.getDate() + (expiRes || 2));
      cookieOptions.expires = expiresDate;
    }
    this.cookieService.set(key, encryptedValue, cookieOptions);
  }

  async getCookie(key: string, isEncrypt?: boolean, isAlreadyparsed?: boolean) {
    const value = this.cookieService.get(key);
    if (!value) return null;
    if (isEncrypt) {
      return await this.encS.decrypt(value);
    } else {
      try {
        const decryptedValue = isAlreadyparsed ? value : JSON.parse(value);
        return decryptedValue;
      } catch (e) {
        console.error('Decryption failed:', e);
        return null;
      }
    }
  }

  deleteCookie(key: string) {
    this.cookieService.delete(key, '/');
  }

}
