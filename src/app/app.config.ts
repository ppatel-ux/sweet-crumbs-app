import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { APP_CONFIG } from './app-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: APP_CONFIG,
      useValue: {
        minSizeKg: 0.5,
        maxSizeKg: 10,
        bigOrderKg: 5,
        apiBaseUrl: 'http://localhost:3000/api',
      },
    },
  ]
};
