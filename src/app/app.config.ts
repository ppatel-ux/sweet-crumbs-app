import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { APP_CONFIG } from './app-config';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Add auth before the request leaves, translate errors outside loading, and finalize loading last.
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
    ),
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
