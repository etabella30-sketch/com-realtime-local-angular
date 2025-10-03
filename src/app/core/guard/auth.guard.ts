import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SecureStorageService } from '../services/storage/secure-storage.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private storage: SecureStorageService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkLogin();
  }
  private async checkLogin(): Promise<boolean> {
    const result = await this.storage.checkLogin();

    if (!result) {
      this.router.navigate(['/auth/login']);
    }
    return result;
  }

}

@Injectable({
  providedIn: 'root'
})
export class LogedGuard implements CanActivate {

  constructor(private storage: SecureStorageService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkLogin();
  }

  private async checkLogin(): Promise<boolean> {
    const result = await this.storage.checkLogin();

    if (result) {
      this.router.navigate(['realtime']);
    }
    return !result;
  }

}