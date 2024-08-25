import { WebSocketConfig } from './websoket.model';
import { makeEnvironmentProviders } from '@angular/core';
import { environment } from '../../../../environments/environments';
import { WEBSOCKET_CONFIG, WEBSOCKET_URL } from './websocket.tocken';

export const provideWebsocket = () =>
  makeEnvironmentProviders([
    { provide: WEBSOCKET_CONFIG, useValue: environment.wsConfig },
  ]);
