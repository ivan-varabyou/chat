import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStorage } from './core/services';
import { provideApiToken } from './core/services/api/provideApiTocken';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStorage(window.localStorage),
    provideApiToken(),
  ],
};
