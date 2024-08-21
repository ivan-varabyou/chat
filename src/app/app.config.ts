import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStorage } from './core/services';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideStorage(window.localStorage)],
};
