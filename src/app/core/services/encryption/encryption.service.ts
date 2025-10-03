import { Injectable } from '@angular/core';

import * as CryptoJS from 'crypto-js';
import { environment } from '../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private secretKey = environment.secretCrypto; // Replace with your secret key


  constructor(private cookieService: CookieService) { }

  async encrypt(value: any): Promise<any> {
    return CryptoJS.AES.encrypt(JSON.stringify(value), this.secretKey).toString();
  }

  async decrypt(value: any): Promise<any> {
    const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
    try {
      const decryptedValue = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedValue;
    } catch (e) {
      console.error('Decryption failed:', e);
      return null;
    }
  }

}
