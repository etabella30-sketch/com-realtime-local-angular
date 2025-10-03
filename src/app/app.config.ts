import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatNativeDateModule } from "@angular/material/core";
import { AppStoreModule } from './store/store.module';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers: [
 
    provideRouter(routes),
    provideAnimationsAsync('noop'),
    provideAnimationsAsync(),
    importProvidersFrom(MatNativeDateModule,AppStoreModule), provideHttpClient(withInterceptorsFromDi()),
     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
 
  //   provideRouter(routes),
  //   provideAnimationsAsync('noop'),
  //  // provideAnimationsAsync(),
  //   importProvidersFrom(MatNativeDateModule,AppStoreModule), ,
  //   provideHttpClient(withInterceptorsFromDi()),
  //  
  ]


};
