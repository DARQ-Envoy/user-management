import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { UserDataService } from './users/services/user-data.service';
import { SERVER_COMM_TOKEN } from './users/tokens/server-comm.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
      {
      provide: SERVER_COMM_TOKEN,
      useClass: UserDataService,
    }
  ]
};
