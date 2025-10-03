import { Injectable } from '@angular/core';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  storge: any = localStorage;
  constructor(public encS: EncryptionService) { }

  setData(key: string, value: any, isEncrypt?: boolean): void {
    const encryptedValue = isEncrypt ? this.encS.encrypt(value) : value;
    this.storge.setItem(key, encryptedValue);
  }

  getData(key: string, isEncrypt?: boolean, isAlreadyparsed?: boolean): any {
    const value = this.storge.getItem(key);
    if (!value) return null;
    if (isEncrypt) {
      this.encS.decrypt(value);
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

}
