import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideStorage } from './core/services';
import { provideApiToken } from './core/services/api/provide-api-tocken';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { AuthInterceptor } from './core/interceptor/auth.interceptor';
import { provideWebsocket } from './core/services/websocket/provide-websocket';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideStorage(window.localStorage),
    provideApiToken(),
    provideWebsocket(),
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
