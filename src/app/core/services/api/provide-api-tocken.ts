import { makeEnvironmentProviders } from '@angular/core';
import { API_URL } from './api-url.token';
import { environment } from '../../../../environments/environments';

export const provideApiToken = () =>
  makeEnvironmentProviders([
    {
      provide: API_URL,
      useValue: environment.apiUrl,
    },
  ]);
