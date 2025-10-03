import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SecureStorageService } from '../services/storage/secure-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private storageService: SecureStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.storageService.getJWTToken()).pipe(
      mergeMap(token => {
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        return next.handle(request);
      }),
      catchError((error) => {
        if (error.status === 401) { // || error.status === 403  // Check this condition based on your auth logic
          this.storageService.logOut();
          this.router.navigate(['/auth/login']);  // Adjust as per your routing
        }else if(error.status === 403){
          this.router.navigate(['/user/dashboard']);  // Adjust as per your routing
        }
        return throwError(error);
      })
    );
  }
}
